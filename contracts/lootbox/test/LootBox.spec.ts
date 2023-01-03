import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers, network } from "hardhat";
import { utils } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { decimals, MINTER_ROLE, tokenName, tokenSymbol } from "@gemunion/contracts-constants";

import { LinkToken, VRFCoordinatorMock } from "../typechain-types";
import { deployERC721, deployLinkVrfFixture } from "../src";

const linkAmountInWei = ethers.BigNumber.from("1000").mul(decimals);

use(solidity);

describe("LootBox", function () {
  let vrfInstance: VRFCoordinatorMock;
  let linkInstance: LinkToken;

  const keyHash = "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186";
  const fee = utils.parseEther("0.1");

  before(async function () {
    await network.provider.send("hardhat_reset");

    // https://github.com/NomicFoundation/hardhat/issues/2980
    ({ linkInstance, vrfInstance } = await loadFixture(function mysterybox() {
      return deployLinkVrfFixture();
    }));
  });

  const factory = () => deployERC721("ChainLinkLootboxMock", tokenName, tokenSymbol);
  const erc721Factory = () =>
    deployERC721("ChainLinkTokenMock", tokenName, tokenSymbol, vrfInstance.address, linkInstance.address, keyHash, fee);

  describe("Factory", function () {
    it("should fail not a contract", async function () {
      const [_owner, receiver] = await ethers.getSigners();

      const lootInstance = await factory();

      const tx = lootInstance.setFactory(receiver.address);
      await expect(tx).to.be.revertedWith(`LootBox: the factory must be a deployed contract`);
    });

    it("Should set factory address", async function () {
      const lootInstance = await factory();

      const nftInstance = await erc721Factory();

      const tx = lootInstance.setFactory(nftInstance.address);
      await expect(tx).to.not.be.reverted;
    });

    it("Should set the right roles for lootbox", async function () {
      const [owner] = await ethers.getSigners();

      const lootInstance = await factory();
      const nftInstance = await erc721Factory();

      const tx = nftInstance.grantRole(MINTER_ROLE, lootInstance.address);
      await expect(tx).to.emit(nftInstance, "RoleGranted").withArgs(MINTER_ROLE, lootInstance.address, owner.address);

      const isMinter = await nftInstance.hasRole(MINTER_ROLE, lootInstance.address);
      expect(isMinter).to.equal(true);
    });
  });

  describe("Unpack Random", function () {
    it("should fail not owner of token", async function () {
      const [owner, receiver] = await ethers.getSigners();

      const lootInstance = await factory();
      const nftInstance = await erc721Factory();

      await nftInstance.grantRole(MINTER_ROLE, lootInstance.address);
      await lootInstance.setFactory(nftInstance.address);
      await lootInstance.mint(owner.address);
      const tx = lootInstance.connect(receiver).unpack(0);
      await expect(tx).to.be.revertedWith("LootBox: unpack caller is not owner nor approved");
    });

    it("should fail not enough LINK", async function () {
      const [owner] = await ethers.getSigners();

      const lootInstance = await factory();
      const nftInstance = await erc721Factory();

      await nftInstance.grantRole(MINTER_ROLE, lootInstance.address);
      await lootInstance.setFactory(nftInstance.address);
      await lootInstance.mint(owner.address);

      const balanceOfOwner1 = await lootInstance.balanceOf(owner.address);
      expect(balanceOfOwner1).to.equal(1);

      const tx = lootInstance.unpack(0);
      await expect(tx).to.be.revertedWith("ERC721ChainLink: Not enough LINK");
    });

    it("should mint token", async function () {
      const [owner] = await ethers.getSigners();

      const nftInstance = await erc721Factory();

      const tx = await nftInstance.mint(owner.address);
      await tx.wait();

      const balanceOfOwner = await nftInstance.balanceOf(owner.address);
      expect(balanceOfOwner).to.equal(1);
    });

    it("should unpack own tokens using random", async function () {
      const [owner] = await ethers.getSigners();

      const lootInstance = await factory();
      const nftInstance = await erc721Factory();

      await nftInstance.grantRole(MINTER_ROLE, lootInstance.address);
      await nftInstance.grantRole(MINTER_ROLE, vrfInstance.address);
      await lootInstance.setFactory(nftInstance.address);
      const txx = await lootInstance.mint(owner.address);
      await txx.wait();

      const balanceOfOwner1 = await lootInstance.balanceOf(owner.address);
      expect(balanceOfOwner1).to.equal(1);

      const balanceOfOwner2 = await nftInstance.balanceOf(owner.address);
      expect(balanceOfOwner2).to.equal(0);

      const txr = await linkInstance.transfer(nftInstance.address, linkAmountInWei);
      await txr.wait();

      const nftInstanceBalance = await linkInstance.callStatic.balanceOf(nftInstance.address);
      expect(nftInstanceBalance).to.equal(linkAmountInWei);

      // Create connection to LINK token contract and initiate the transfer
      // const LINK_TOKEN_ABI = [
      //   {
      //     constant: false,
      //     inputs: [
      //       {
      //         name: "_to",
      //         type: "address",
      //       },
      //       {
      //         name: "_value",
      //         type: "uint256",
      //       },
      //     ],
      //     name: "transfer",
      //     outputs: [
      //       {
      //         name: "success",
      //         type: "bool",
      //       },
      //     ],
      //     payable: false,
      //     stateMutability: "nonpayable",
      //     type: "function",
      //   },
      // ];
      // const linkContractAddr = "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06";
      // const linkTokenContract = new ethers.Contract(linkContractAddr, LINK_TOKEN_ABI, owner);
      // await linkTokenContract.transfer(nftInstance, parseEther("1.0")).then(function (transaction: any) {
      //   console.info("Contract ", nftInstance.address, " funded with 1 LINK. Transaction Hash: ", transaction.hash);
      // });

      const tx = await lootInstance.unpack(0);
      await tx.wait();

      await expect(tx).to.emit(lootInstance, "Transfer").withArgs(owner.address, ethers.constants.AddressZero, 0);
      await expect(tx)
        .to.emit(linkInstance, "Transfer(address,address,uint256)")
        .withArgs(nftInstance.address, vrfInstance.address, utils.parseEther("0.1"));

      await expect(tx).to.emit(nftInstance, "RandomRequest");
      const eventFilter = nftInstance.filters.RandomRequest();
      const events = await nftInstance.queryFilter(eventFilter);
      const requestId = events[0].args[0];

      await expect(tx).to.emit(vrfInstance, "RandomnessRequest");
      await expect(tx).to.emit(vrfInstance, "RandomnessRequestId").withArgs(requestId, nftInstance.address);

      const trx = await vrfInstance.callBackWithRandomness(requestId, 123, nftInstance.address);
      await trx.wait();
      await expect(trx).to.emit(nftInstance, "MintRandom").withArgs(owner.address, requestId);

      const balanceOfOwner3 = await lootInstance.balanceOf(owner.address);
      expect(balanceOfOwner3).to.equal(0);

      const balanceOfOwner4 = await nftInstance.balanceOf(owner.address);
      expect(balanceOfOwner4).to.equal(1);

      const item = await nftInstance.tokenOfOwnerByIndex(owner.address, 0);
      expect(item).to.equal(0); // 0 is nft index
    });
  });
});
