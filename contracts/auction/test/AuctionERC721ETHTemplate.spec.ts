import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers, web3 } from "hardhat";
import { ContractFactory } from "ethers";
import { time } from "@openzeppelin/test-helpers";

import { amount, tokenId, tokenName, tokenSymbol } from "@gemunion/contracts-constants";

import { AuctionERC721ETHTemplate, ERC721AB } from "../typechain-types";
import { shouldHaveOwner } from "./shared/ownable/owner";
import { shouldTransferOwnership } from "./shared/ownable/transferOwnership";
import { shouldRenounceOwnership } from "./shared/ownable/renounceOwnership";

use(solidity);

describe("AuctionERC721ETHTemplate", function () {
  let erc721: ContractFactory;
  let erc721Instance: ERC721AB;
  let template: ContractFactory;
  let templateInstance: AuctionERC721ETHTemplate;

  beforeEach(async function () {
    erc721 = await ethers.getContractFactory("ERC721AB");
    template = await ethers.getContractFactory("AuctionERC721ETHTemplate");
    [this.owner, this.receiver, this.stranger] = await ethers.getSigners();

    erc721Instance = (await erc721.deploy(tokenName, tokenSymbol)) as ERC721AB;

    const span = 300;
    const timestamp: number = (await time.latest()).toNumber();

    templateInstance = (await template.deploy(
      this.owner.address,
      erc721Instance.address,
      tokenId,
      amount,
      amount / 10,
      amount * 3,
      timestamp,
      timestamp + span,
    )) as AuctionERC721ETHTemplate;

    await erc721Instance.safeMint(templateInstance.address, tokenId);

    this.contractInstance = templateInstance;
  });

  shouldHaveOwner();
  shouldTransferOwnership();
  shouldRenounceOwnership();

  describe("makeBid", function () {
    it("should make a bid", async function () {
      const tx = await templateInstance.connect(this.receiver).makeBid({ value: amount });

      await expect(tx).to.emit(templateInstance, "AuctionBid").withArgs(this.receiver.address, amount);
    });

    it("should make another bid", async function () {
      const tx1 = await templateInstance.connect(this.receiver).makeBid({ value: amount });

      await expect(tx1).to.emit(templateInstance, "AuctionBid").withArgs(this.receiver.address, amount);

      const tx2 = await templateInstance.connect(this.stranger).makeBid({ value: amount + amount / 10 });

      await expect(tx2)
        .to.emit(templateInstance, "AuctionBid")
        .withArgs(this.stranger.address, amount + amount / 10);
    });

    it("should make a bid with no bid step", async function () {
      const span = 300;
      const timestamp: number = (await time.latest()).toNumber();

      templateInstance = (await template.deploy(
        this.owner.address,
        erc721Instance.address,
        tokenId,
        amount,
        0,
        amount * 3,
        timestamp,
        timestamp + span,
      )) as AuctionERC721ETHTemplate;

      const bid = 12345;
      const tx = templateInstance.connect(this.receiver).makeBid({ value: amount + bid });
      await expect(tx)
        .emit(templateInstance, "AuctionBid")
        .withArgs(this.receiver.address, amount + bid);
    });

    it("should fail: auction is not yet started", async function () {
      const span = 300;
      const timestamp: number = (await time.latest()).toNumber();

      templateInstance = (await template.deploy(
        this.owner.address,
        erc721Instance.address,
        tokenId,
        amount,
        0,
        amount * 3,
        timestamp + span,
        timestamp + span + span,
      )) as AuctionERC721ETHTemplate;

      const tx = templateInstance.connect(this.receiver).makeBid({ value: amount });
      await expect(tx).to.be.revertedWith("Auction: auction is not yet started");
    });

    it("should fail: auction is already finished", async function () {
      const span = 300;
      const timestamp: number = (await time.latest()).toNumber();

      templateInstance = (await template.deploy(
        this.owner.address,
        erc721Instance.address,
        tokenId,
        amount,
        0,
        amount * 3,
        timestamp,
        timestamp + span,
      )) as AuctionERC721ETHTemplate;

      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx = templateInstance.connect(this.receiver).makeBid({ value: amount });
      await expect(tx).to.be.revertedWith("Auction: auction is already finished");
    });

    it("should fail: auction is canceled", async function () {
      await templateInstance.cancelAuction();
      const tx = templateInstance.connect(this.receiver).makeBid({ value: amount });
      await expect(tx).to.be.revertedWith("Auction: auction is canceled");
    });

    it("should fail: caller is the owner", async function () {
      const tx = templateInstance.connect(this.owner).makeBid({ value: amount });
      await expect(tx).to.be.revertedWith("Ownable: caller is the owner");
    });

    it("should fail: bid value is not increased", async function () {
      const tx = templateInstance.connect(this.receiver).makeBid({ value: 0 });
      await expect(tx).to.be.revertedWith("Auction: bid value is not increased");
    });

    it("should fail: proposed bid can not be less than start price", async function () {
      const tx = templateInstance.connect(this.receiver).makeBid({ value: amount / 2 });
      await expect(tx).to.be.revertedWith("Auction: proposed bid can not be less than start price");
    });

    it("should fail: proposed bid must be bigger than current bid", async function () {
      await templateInstance.connect(this.receiver).makeBid({ value: amount * 10 });
      const tx = templateInstance.connect(this.stranger).makeBid({ value: amount * 2 });
      await expect(tx).to.be.revertedWith("Auction: proposed bid must be bigger than current bid");
    });

    it("should fail: bid must be a multiple of the bid step", async function () {
      const bid = 12345;
      const tx = templateInstance.connect(this.receiver).makeBid({ value: amount + bid });
      await expect(tx).to.be.revertedWith("Auction: bid must be a multiple of the bid step");
    });
  });

  describe("getHighestBid", function () {
    it("should get highest bid (zero)", async function () {
      const highestBid = await templateInstance.getHighestBid();
      expect(highestBid).to.equal(0);
    });

    it("should get highest bid (amount)", async function () {
      await templateInstance.connect(this.receiver).makeBid({ value: amount });

      const highestBid = await templateInstance.getHighestBid();
      expect(highestBid).to.equal(amount);
    });
  });

  describe("cancelAuction", function () {
    it("should cancel", async function () {
      const tx = templateInstance.cancelAuction();
      await expect(tx).to.emit(templateInstance, "AuctionCanceled").withArgs();
    });

    it("should fail: caller is not the owner", async function () {
      const tx = templateInstance.connect(this.receiver).cancelAuction();
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should fail: auction is already finished", async function () {
      const span = 300;
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx = templateInstance.cancelAuction();
      await expect(tx).to.be.revertedWith("Auction: auction is already finished");
    });

    it("should fail: auction is canceled", async function () {
      await templateInstance.cancelAuction();
      const tx = templateInstance.cancelAuction();
      await expect(tx).to.be.revertedWith("Auction: auction is canceled");
    });
  });

  describe("withdrawAsset", function () {
    it("should withdraw (no bids)", async function () {
      const span = 300;
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx = templateInstance.withdrawAsset();
      await expect(tx)
        .to.emit(erc721Instance, "Transfer")
        .withArgs(templateInstance.address, this.owner.address, tokenId);
    });

    it("should withdraw (canceled + no bids)", async function () {
      await templateInstance.cancelAuction();
      const tx = templateInstance.withdrawAsset();
      await expect(tx)
        .to.emit(erc721Instance, "Transfer")
        .withArgs(templateInstance.address, this.owner.address, tokenId);
    });

    it("should withdraw (bids)", async function () {
      await templateInstance.connect(this.receiver).makeBid({ value: amount });

      const span = 300;
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx = templateInstance.withdrawAsset();
      await expect(tx)
        .to.emit(erc721Instance, "Transfer")
        .withArgs(templateInstance.address, this.receiver.address, tokenId);
    });

    it("should withdraw (canceled + bids)", async function () {
      await templateInstance.connect(this.receiver).makeBid({ value: amount });

      await templateInstance.cancelAuction();
      const tx = templateInstance.withdrawAsset();
      await expect(tx)
        .to.emit(erc721Instance, "Transfer")
        .withArgs(templateInstance.address, this.owner.address, tokenId);
    });
  });

  describe("withdrawMoney", function () {
    it("should withdraw (no bids)", async function () {
      const span = 300;
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx1 = await templateInstance.withdrawMoney();
      await expect(tx1).to.changeEtherBalance(this.owner, 0);

      const tx2 = await templateInstance.connect(this.receiver).withdrawMoney();
      await expect(tx2).to.changeEtherBalance(this.receiver, 0);
    });

    it("should withdraw (canceled + no bids)", async function () {
      await templateInstance.cancelAuction();

      const tx1 = await templateInstance.withdrawMoney();
      await expect(tx1).to.changeEtherBalance(this.owner, 0);

      const tx2 = await templateInstance.connect(this.receiver).withdrawMoney();
      await expect(tx2).to.changeEtherBalance(this.receiver, 0);
    });

    it("should withdraw (bids)", async function () {
      await templateInstance.connect(this.receiver).makeBid({ value: amount });
      await templateInstance.connect(this.stranger).makeBid({ value: amount * 2 });

      const span = 300;
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx1 = await templateInstance.withdrawMoney();
      await expect(tx1).to.changeEtherBalance(this.owner, amount * 2);

      const tx2 = await templateInstance.connect(this.receiver).withdrawMoney();
      await expect(tx2).to.changeEtherBalance(this.receiver, amount);

      const tx3 = await templateInstance.connect(this.stranger).withdrawMoney();
      await expect(tx3).to.changeEtherBalance(this.stranger, 0);
    });

    it("should withdraw (canceled + bids)", async function () {
      await templateInstance.connect(this.receiver).makeBid({ value: amount });
      await templateInstance.connect(this.stranger).makeBid({ value: amount * 2 });

      await templateInstance.cancelAuction();

      const tx1 = await templateInstance.withdrawMoney();
      await expect(tx1).to.changeEtherBalance(this.owner, 0);

      const tx2 = await templateInstance.connect(this.receiver).withdrawMoney();
      await expect(tx2).to.changeEtherBalance(this.receiver, amount);

      const tx3 = await templateInstance.connect(this.stranger).withdrawMoney();
      await expect(tx3).to.changeEtherBalance(this.stranger, amount * 2);
    });
  });
});
