import { expect } from "chai";
import { ethers, web3 } from "hardhat";
import { time } from "@openzeppelin/test-helpers";

import { amount, span, tokenId } from "@gemunion/contracts-constants";
import { shouldBehaveLikeOwnable } from "@gemunion/contracts-mocha";

import { deployAuction, deployERC721 } from "./shared/fixtures";

describe("AuctionERC721ETHTemplate", function () {
  const factory = async (step?: bigint, offset?: number) => {
    const erc721Instance = await deployERC721();
    const templateInstance = await deployAuction(step, offset, erc721Instance);

    return { erc721Instance, templateInstance };
  };

  shouldBehaveLikeOwnable(async () => {
    const { templateInstance } = await factory();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return templateInstance;
  });

  describe("makeBid", function () {
    it("should make a bid", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory();

      const tx = await templateInstance.connect(receiver).makeBid({ value: amount });

      await expect(tx).to.emit(templateInstance, "AuctionBid").withArgs(receiver.address, amount);
    });

    it("should make another bid", async function () {
      const [_owner, receiver, stranger] = await ethers.getSigners();
      const { templateInstance } = await factory();

      const tx1 = await templateInstance.connect(receiver).makeBid({ value: amount });

      await expect(tx1).to.emit(templateInstance, "AuctionBid").withArgs(receiver.address, amount);

      const tx2 = await templateInstance.connect(stranger).makeBid({ value: amount + amount / 10n });

      await expect(tx2)
        .to.emit(templateInstance, "AuctionBid")
        .withArgs(stranger.address, amount + amount / 10n);
    });

    it("should make a bid with no bid step", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory(10n);

      const bidMultiplier = BigInt(Math.floor(Math.random() * 10));

      const tx = templateInstance.connect(receiver).makeBid({ value: amount + (amount / 10n) * bidMultiplier });
      await expect(tx)
        .emit(templateInstance, "AuctionBid")
        .withArgs(receiver.address, amount + (amount / 10n) * bidMultiplier);
    });

    it("should fail: auction is not yet started", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory(void 0, span);

      const tx = templateInstance.connect(receiver).makeBid({ value: amount });
      await expect(tx).to.be.revertedWith("Auction: auction is not yet started");
    });

    it("should fail: auction is already finished", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory();

      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx = templateInstance.connect(receiver).makeBid({ value: amount });
      await expect(tx).to.be.revertedWith("Auction: auction is already finished");
    });

    it("should fail: auction is canceled", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory();

      await templateInstance.cancelAuction();
      const tx = templateInstance.connect(receiver).makeBid({ value: amount });
      await expect(tx).to.be.revertedWith("Auction: auction is canceled");
    });

    it("should fail: caller is the owner", async function () {
      const [owner] = await ethers.getSigners();
      const { templateInstance } = await factory();

      const tx = templateInstance.connect(owner).makeBid({ value: amount });
      await expect(tx).to.be.revertedWith("Ownable: caller is the owner");
    });

    it("should fail: bid value is not increased", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory();

      const tx = templateInstance.connect(receiver).makeBid({ value: 0 });
      await expect(tx).to.be.revertedWith("Auction: bid value is not increased");
    });

    it("should fail: proposed bid can not be less than start price", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory();

      const tx = templateInstance.connect(receiver).makeBid({ value: amount / 2n });
      await expect(tx).to.be.revertedWith("Auction: proposed bid can not be less than start price");
    });

    it("should fail: proposed bid must be bigger than current bid", async function () {
      const [_owner, receiver, stranger] = await ethers.getSigners();
      const { templateInstance } = await factory();

      await templateInstance.connect(receiver).makeBid({ value: amount * 10n });
      const tx = templateInstance.connect(stranger).makeBid({ value: amount * 2n });
      await expect(tx).to.be.revertedWith("Auction: proposed bid must be bigger than current bid");
    });

    it("should fail: bid must be a multiple of the bid step", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory();

      const bidMultiplier = BigInt(Math.floor(Math.random() * 10));

      const tx = templateInstance.connect(receiver).makeBid({ value: amount + bidMultiplier });
      await expect(tx).to.be.revertedWith("Auction: bid must be a multiple of the bid step");
    });
  });

  describe("getHighestBid", function () {
    it("should get highest bid (zero)", async function () {
      const { templateInstance } = await factory();

      const highestBid = await templateInstance.getHighestBid();
      expect(highestBid).to.equal(0);
    });

    it("should get highest bid (amount)", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory();

      await templateInstance.connect(receiver).makeBid({ value: amount });

      const highestBid = await templateInstance.getHighestBid();
      expect(highestBid).to.equal(amount);
    });
  });

  describe("cancelAuction", function () {
    it("should cancel", async function () {
      const { templateInstance } = await factory();

      const tx = templateInstance.cancelAuction();
      await expect(tx).to.emit(templateInstance, "AuctionCanceled").withArgs();
    });

    it("should fail: caller is not the owner", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory();

      const tx = templateInstance.connect(receiver).cancelAuction();
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should fail: auction is already finished", async function () {
      const { templateInstance } = await factory();

      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx = templateInstance.cancelAuction();
      await expect(tx).to.be.revertedWith("Auction: auction is already finished");
    });

    it("should fail: auction is canceled", async function () {
      const { templateInstance } = await factory();

      await templateInstance.cancelAuction();
      const tx = templateInstance.cancelAuction();
      await expect(tx).to.be.revertedWith("Auction: auction is canceled");
    });
  });

  describe("withdrawAsset", function () {
    it("should withdraw (no bids)", async function () {
      const [owner] = await ethers.getSigners();
      const { templateInstance, erc721Instance } = await factory();

      await erc721Instance.safeMint(await templateInstance.getAddress(), tokenId);

      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx = templateInstance.withdrawAsset();
      await expect(tx)
        .to.emit(erc721Instance, "Transfer")
        .withArgs(await templateInstance.getAddress(), owner.address, tokenId);
    });

    it("should withdraw (canceled + no bids)", async function () {
      const [owner] = await ethers.getSigners();
      const { templateInstance, erc721Instance } = await factory();

      await erc721Instance.safeMint(await templateInstance.getAddress(), tokenId);

      await templateInstance.cancelAuction();
      const tx = templateInstance.withdrawAsset();
      await expect(tx)
        .to.emit(erc721Instance, "Transfer")
        .withArgs(await templateInstance.getAddress(), owner.address, tokenId);
    });

    it("should withdraw (bids)", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { templateInstance, erc721Instance } = await factory();

      await erc721Instance.safeMint(await templateInstance.getAddress(), tokenId);

      await templateInstance.connect(receiver).makeBid({ value: amount });

      const span = 300;
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx = templateInstance.withdrawAsset();
      await expect(tx)
        .to.emit(erc721Instance, "Transfer")
        .withArgs(await templateInstance.getAddress(), receiver.address, tokenId);
    });

    it("should withdraw (canceled + bids)", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const { templateInstance, erc721Instance } = await factory();

      await erc721Instance.safeMint(await templateInstance.getAddress(), tokenId);

      await templateInstance.connect(receiver).makeBid({ value: amount });

      await templateInstance.cancelAuction();
      const tx = templateInstance.withdrawAsset();
      await expect(tx)
        .to.emit(erc721Instance, "Transfer")
        .withArgs(await templateInstance.getAddress(), owner.address, tokenId);
    });
  });

  describe("withdrawMoney", function () {
    it("should withdraw (no bids)", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory();

      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx1 = await templateInstance.withdrawMoney();
      await expect(tx1).to.changeEtherBalance(owner, 0);

      const tx2 = await templateInstance.connect(receiver).withdrawMoney();
      await expect(tx2).to.changeEtherBalance(receiver, 0);
    });

    it("should withdraw (canceled + no bids)", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const { templateInstance } = await factory();

      await templateInstance.cancelAuction();

      const tx1 = await templateInstance.withdrawMoney();
      await expect(tx1).to.changeEtherBalance(owner, 0);

      const tx2 = await templateInstance.connect(receiver).withdrawMoney();
      await expect(tx2).to.changeEtherBalance(receiver, 0);
    });

    it("should withdraw (bids)", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const { templateInstance } = await factory();

      await templateInstance.connect(receiver).makeBid({ value: amount });
      await templateInstance.connect(stranger).makeBid({ value: amount * 2n });

      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(span)));

      const tx1 = await templateInstance.withdrawMoney();
      await expect(tx1).to.changeEtherBalance(owner, amount * 2n);

      const tx2 = await templateInstance.connect(receiver).withdrawMoney();
      await expect(tx2).to.changeEtherBalance(receiver, amount);

      const tx3 = await templateInstance.connect(stranger).withdrawMoney();
      await expect(tx3).to.changeEtherBalance(stranger, 0);
    });

    it("should withdraw (canceled + bids)", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const { templateInstance } = await factory();

      await templateInstance.connect(receiver).makeBid({ value: amount });
      await templateInstance.connect(stranger).makeBid({ value: amount * 2n });

      await templateInstance.cancelAuction();

      const tx1 = await templateInstance.withdrawMoney();
      await expect(tx1).to.changeEtherBalance(owner, 0);

      const tx2 = await templateInstance.connect(receiver).withdrawMoney();
      await expect(tx2).to.changeEtherBalance(receiver, amount);

      const tx3 = await templateInstance.connect(stranger).withdrawMoney();
      await expect(tx3).to.changeEtherBalance(stranger, amount * 2n);
    });
  });
});
