import { expect } from "chai";
import { ethers } from "hardhat";
import { ZeroAddress } from "ethers";
import { time } from "@openzeppelin/test-helpers";

import { amount, DEFAULT_ADMIN_ROLE, PAUSER_ROLE, span, tokenId } from "@gemunion/contracts-constants";

import { shouldBehaveLikeAccessControl, shouldBehaveLikePausable } from "@gemunion/contracts-mocha";

import { deployAuctionFactory, deployERC721 } from "./shared/fixtures";

describe("AuctionFactory", function () {
  const factory = () => deployAuctionFactory();
  const erc721Factory = () => deployERC721();

  shouldBehaveLikeAccessControl(factory)(DEFAULT_ADMIN_ROLE, PAUSER_ROLE);

  shouldBehaveLikePausable(factory);

  describe("createAuction", function () {
    it("should create auction", async function () {
      const [owner] = await ethers.getSigners();

      const timestamp: number = (await time.latest()).toNumber();

      const factoryInstance = await factory();
      const erc721Instance = await erc721Factory();

      await erc721Instance.mint(owner.address, tokenId);
      await erc721Instance.approve(await factoryInstance.getAddress(), tokenId);

      const tx = await factoryInstance.createAuction(
        await erc721Instance.getAddress(),
        tokenId,
        amount,
        amount / 10n,
        amount * 3n,
        timestamp,
        timestamp + span,
      );

      const [auction] = await factoryInstance.allAuctions();

      await expect(tx)
        .to.emit(factoryInstance, "AuctionStart")
        .withArgs(
          auction,
          owner.address,
          await erc721Instance.getAddress(),
          tokenId,
          amount,
          amount / 10n,
          amount * 3n,
          timestamp,
          timestamp + span,
        );

      const ownerOf = await erc721Instance.ownerOf(tokenId);
      expect(ownerOf).to.equal(auction);
    });

    it("should fail: collection address cannot be zero", async function () {
      const timestamp: number = (await time.latest()).toNumber();
      const factoryInstance = await factory();

      const tx = factoryInstance.createAuction(
        ZeroAddress,
        tokenId,
        amount,
        amount / 10n,
        amount * 3n,
        timestamp,
        timestamp + span,
      );

      await expect(tx).to.be.revertedWith("Auction: collection address cannot be zero");
    });

    it("should fail: auction start time should be less than end time", async function () {
      const timestamp: number = (await time.latest()).toNumber();

      const factoryInstance = await factory();
      const erc721Instance = await erc721Factory();

      const tx = factoryInstance.createAuction(
        await erc721Instance.getAddress(),
        tokenId,
        amount,
        amount / 10n,
        amount * 3n,
        timestamp + span,
        timestamp,
      );

      await expect(tx).to.be.revertedWith("Auction: auction start time should be less than end time");
    });

    it("should fail: auction start price should be greater than zero", async function () {
      const timestamp: number = (await time.latest()).toNumber();

      const factoryInstance = await factory();
      const erc721Instance = await erc721Factory();

      const tx = factoryInstance.createAuction(
        await erc721Instance.getAddress(),
        tokenId,
        0,
        amount / 10n,
        amount * 3n,
        timestamp,
        timestamp + span,
      );

      await expect(tx).to.be.revertedWith("Auction: auction start price should be greater than zero");
    });

    it("should fail: auction start price should less than buyout price", async function () {
      const timestamp: number = (await time.latest()).toNumber();

      const factoryInstance = await factory();
      const erc721Instance = await erc721Factory();

      const tx = factoryInstance.createAuction(
        await erc721Instance.getAddress(),
        tokenId,
        amount,
        amount / 10n,
        amount / 2n,
        timestamp,
        timestamp + span,
      );

      await expect(tx).to.be.revertedWith("Auction: auction start price should less than buyout price");
    });

    it("should fail: auction should finished in future", async function () {
      const timestamp: number = (await time.latest()).toNumber();

      const factoryInstance = await factory();
      const erc721Instance = await erc721Factory();

      const tx = factoryInstance.createAuction(
        await erc721Instance.getAddress(),
        tokenId,
        amount,
        amount / 10n,
        amount * 3n,
        timestamp - span - span,
        timestamp - span,
      );

      await expect(tx).to.be.revertedWith("Auction: auction should finished in future");
    });

    it("should fail: transfer from incorrect owner", async function () {
      const [owner, _receiver, stranger] = await ethers.getSigners();
      const timestamp: number = (await time.latest()).toNumber();

      const factoryInstance = await factory();
      const erc721Instance = await erc721Factory();

      await erc721Instance.mint(owner.address, tokenId);
      await erc721Instance.approve(await factoryInstance.getAddress(), tokenId);

      const tx = factoryInstance
        .connect(stranger)
        .createAuction(
          await erc721Instance.getAddress(),
          tokenId,
          amount,
          amount / 10n,
          amount * 3n,
          timestamp,
          timestamp + span,
        );

      await expect(tx).to.be.revertedWith("ERC721: transfer from incorrect owner");
    });
  });

  describe("allAuctions", function () {
    it("should get all auction address", async function () {
      const [owner] = await ethers.getSigners();
      const timestamp: number = (await time.latest()).toNumber();

      const factoryInstance = await factory();
      const erc721Instance = await erc721Factory();

      await erc721Instance.mint(owner.address, tokenId);
      await erc721Instance.approve(await factoryInstance.getAddress(), tokenId);

      const [addr] = await factoryInstance.createAuction.staticCallResult(
        await erc721Instance.getAddress(),
        tokenId,
        amount,
        amount / 10n,
        amount * 3n,
        timestamp,
        timestamp + span,
      );

      const tx = await factoryInstance.createAuction(
        await erc721Instance.getAddress(),
        tokenId,
        amount,
        amount / 10n,
        amount * 3n,
        timestamp,
        timestamp + span,
      );

      await expect(tx)
        .to.emit(factoryInstance, "AuctionStart")
        .withArgs(
          addr,
          owner.address,
          await erc721Instance.getAddress(),
          tokenId,
          amount,
          amount / 10n,
          amount * 3n,
          timestamp,
          timestamp + span,
        );

      const auctions = await factoryInstance.allAuctions();

      expect(auctions.length).to.equal(1);
      expect(addr).to.equal(auctions[0]);
    });
  });
});
