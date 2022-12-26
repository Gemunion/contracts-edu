import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { ContractFactory } from "ethers";
import { time } from "@openzeppelin/test-helpers";

import {
  amount,
  DEFAULT_ADMIN_ROLE,
  PAUSER_ROLE,
  tokenId,
  tokenName,
  tokenSymbol,
} from "@gemunion/contracts-constants";

import { AuctionFactory, ERC721AB } from "../typechain-types";
import { shouldHaveRole } from "./shared/accessible/hasRoles";
import { shouldGetRoleAdmin } from "./shared/accessible/getRoleAdmin";
import { shouldGrantRole } from "./shared/accessible/grantRole";
import { shouldRevokeRole } from "./shared/accessible/revokeRole";
import { shouldRenounceRole } from "./shared/accessible/renounceRole";
import { shouldPause } from "./shared/pausable";

use(solidity);

describe("AuctionFactory", function () {
  let factory: ContractFactory;
  let factoryInstance: AuctionFactory;
  let erc721: ContractFactory;
  let erc721Instance: ERC721AB;

  beforeEach(async function () {
    factory = await ethers.getContractFactory("AuctionFactory");
    erc721 = await ethers.getContractFactory("ERC721AB");
    [this.owner, this.receiver, this.stranger] = await ethers.getSigners();

    factoryInstance = (await factory.deploy()) as AuctionFactory;
    erc721Instance = (await erc721.deploy(tokenName, tokenSymbol)) as ERC721AB;

    await erc721Instance.mint(this.owner.address, tokenId);
    await erc721Instance.approve(factoryInstance.address, tokenId);

    this.contractInstance = factoryInstance;
  });

  shouldHaveRole(DEFAULT_ADMIN_ROLE, PAUSER_ROLE);
  shouldGetRoleAdmin(DEFAULT_ADMIN_ROLE, PAUSER_ROLE);
  shouldGrantRole();
  shouldRevokeRole();
  shouldRenounceRole();
  shouldPause();

  describe("createAuction", function () {
    it("should create auction", async function () {
      const span = 300;
      const timestamp: number = (await time.latest()).toNumber();

      const tx = factoryInstance.createAuction(
        erc721Instance.address,
        tokenId,
        amount,
        amount / 10,
        amount * 3,
        timestamp,
        timestamp + span,
      );

      // TODO strange: first call returns undef, second call returns array[string]
      await factoryInstance.allAuctions();
      const [auction] = await factoryInstance.allAuctions();

      await expect(tx)
        .to.emit(factoryInstance, "AuctionStart")
        .withArgs(
          auction,
          this.owner.address,
          erc721Instance.address,
          tokenId,
          amount,
          amount / 10,
          amount * 3,
          timestamp,
          timestamp + span,
        );

      const ownerOf = await erc721Instance.ownerOf(tokenId);
      expect(ownerOf).to.equal(auction);
    });

    it("should fail: collection address cannot be zero", async function () {
      const span = 300;
      const timestamp: number = (await time.latest()).toNumber();

      const tx = factoryInstance.createAuction(
        ethers.constants.AddressZero,
        tokenId,
        amount,
        amount / 10,
        amount * 3,
        timestamp,
        timestamp + span,
      );

      await expect(tx).to.be.revertedWith("Auction: collection address cannot be zero");
    });

    it("should fail: auction start time should be less than end time", async function () {
      const span = 300;
      const timestamp: number = (await time.latest()).toNumber();

      const tx = factoryInstance.createAuction(
        erc721Instance.address,
        tokenId,
        amount,
        amount / 10,
        amount * 3,
        timestamp + span,
        timestamp,
      );

      await expect(tx).to.be.revertedWith("Auction: auction start time should be less than end time");
    });

    it("should fail: auction start price should be greater than zero", async function () {
      const span = 300;
      const timestamp: number = (await time.latest()).toNumber();

      const tx = factoryInstance.createAuction(
        erc721Instance.address,
        tokenId,
        0,
        amount / 10,
        amount * 3,
        timestamp,
        timestamp + span,
      );

      await expect(tx).to.be.revertedWith("Auction: auction start price should be greater than zero");
    });

    it("should fail: auction start price should less than buyout price", async function () {
      const span = 300;
      const timestamp: number = (await time.latest()).toNumber();

      const tx = factoryInstance.createAuction(
        erc721Instance.address,
        tokenId,
        amount,
        amount / 10,
        amount / 2,
        timestamp,
        timestamp + span,
      );

      await expect(tx).to.be.revertedWith("Auction: auction start price should less than buyout price");
    });

    it("should fail: auction should finished in future", async function () {
      const span = 300;
      const timestamp: number = (await time.latest()).toNumber();

      const tx = factoryInstance.createAuction(
        erc721Instance.address,
        tokenId,
        amount,
        amount / 10,
        amount * 3,
        timestamp - span - span,
        timestamp - span,
      );

      await expect(tx).to.be.revertedWith("Auction: auction should finished in future");
    });

    it("should fail: transfer from incorrect owner", async function () {
      const span = 300;
      const timestamp: number = (await time.latest()).toNumber();

      const tx = factoryInstance
        .connect(this.stranger)
        .createAuction(erc721Instance.address, tokenId, amount, amount / 10, amount * 3, timestamp, timestamp + span);

      await expect(tx).to.be.revertedWith("ERC721: transfer from incorrect owner");
    });
  });

  describe("allAuctions", function () {
    it("should get all auction address", async function () {
      const span = 300;
      const timestamp: number = (await time.latest()).toNumber();

      const addr = await factoryInstance.callStatic.createAuction(
        erc721Instance.address,
        tokenId,
        amount,
        amount / 10,
        amount * 3,
        timestamp,
        timestamp + span,
      );

      const tx = await factoryInstance.createAuction(
        erc721Instance.address,
        tokenId,
        amount,
        amount / 10,
        amount * 3,
        timestamp,
        timestamp + span,
      );

      await expect(tx)
        .to.emit(factoryInstance, "AuctionStart")
        .withArgs(
          addr,
          this.owner.address,
          erc721Instance.address,
          tokenId,
          amount,
          amount / 10,
          amount * 3,
          timestamp,
          timestamp + span,
        );

      const auctions = await factoryInstance.allAuctions();

      expect(auctions.length).to.equal(1);
      expect(addr).to.equal(auctions[0]);
    });
  });
});
