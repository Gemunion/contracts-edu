import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { ContractFactory, ContractTransaction } from "ethers";

import { decimals, MINTER_ROLE, tokenName, tokenSymbol } from "@gemunion/contracts-constants";

import { ChainLinkLootboxMock, ChainLinkTokenMock, LINK, VRFCoordinatorMock } from "../typechain-types";

const linkAmountInWei = ethers.BigNumber.from("1000").mul(decimals);

use(solidity);

describe("LootBox", function () {
  let vrf: ContractFactory;
  let vrfInstance: VRFCoordinatorMock;
  let link: ContractFactory;
  let linkInstance: LINK;

  let nft: ContractFactory;
  let nftInstance: ChainLinkTokenMock;
  let lootbox: ContractFactory;
  let lootInstance: ChainLinkLootboxMock;
  this.timeout(42000);

  beforeEach(async function () {
    const [owner] = await ethers.getSigners();

    link = await ethers.getContractFactory("LINK");
    linkInstance = (await link.deploy(tokenName, tokenSymbol)) as LINK;
    await linkInstance.mint(owner.address, linkAmountInWei);
    vrf = await ethers.getContractFactory("VRFCoordinatorMock");
    vrfInstance = (await vrf.deploy(linkInstance.address)) as VRFCoordinatorMock;

    nft = await ethers.getContractFactory("ChainLinkTokenMock");
    lootbox = await ethers.getContractFactory("ChainLinkLootboxMock");

    const keyHash = "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186";
    const fee = parseEther("0.1");
    nftInstance = (await nft.deploy(
      tokenName,
      tokenSymbol,
      vrfInstance.address,
      linkInstance.address,
      keyHash,
      fee,
    )) as ChainLinkTokenMock;

    lootInstance = (await lootbox.deploy(tokenName, tokenSymbol)) as ChainLinkLootboxMock;
  });

  describe("Factory", function () {
    it("should fail not a contract", async function () {
      const [_owner, receiver] = await ethers.getSigners();

      const tx = lootInstance.setFactory(receiver.address);
      await expect(tx).to.be.revertedWith(`LootBox: the factory must be a deployed contract`);
    });

    it("Should set factory address", async function () {
      const tx = lootInstance.setFactory(nftInstance.address);
      await expect(tx).to.not.be.reverted;
    });

    it("Should set the right roles for lootbox", async function () {
      const [owner] = await ethers.getSigners();

      const tx = nftInstance.grantRole(MINTER_ROLE, lootInstance.address);
      await expect(tx).to.emit(nftInstance, "RoleGranted").withArgs(MINTER_ROLE, lootInstance.address, owner.address);

      const isMinter = await nftInstance.hasRole(MINTER_ROLE, lootInstance.address);
      expect(isMinter).to.equal(true);
    });
  });

  describe("Unpack Random", function () {
    it("should fail not owner of token", async function () {
      const [owner, receiver] = await ethers.getSigners();

      await nftInstance.grantRole(MINTER_ROLE, lootInstance.address);
      await lootInstance.setFactory(nftInstance.address);
      await lootInstance.mint(owner.address);
      const tx = lootInstance.connect(receiver).unpack(0);
      await expect(tx).to.be.revertedWith("LootBox: unpack caller is not owner nor approved");
    });

    it("should fail not enough LINK", async function () {
      const [owner] = await ethers.getSigners();

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

      const txx: ContractTransaction = await nftInstance.mint(owner.address);
      await txx.wait();

      const balanceOfOwner1 = await nftInstance.balanceOf(owner.address);
      expect(balanceOfOwner1).to.equal(1);
    });

    it("should unpack own tokens using random", async function () {
      const [owner] = await ethers.getSigners();

      await nftInstance.grantRole(MINTER_ROLE, lootInstance.address);
      await nftInstance.grantRole(MINTER_ROLE, vrfInstance.address);
      await lootInstance.setFactory(nftInstance.address);
      const txx: ContractTransaction = await lootInstance.mint(owner.address);
      await txx.wait();

      const balanceOfOwner1 = await lootInstance.balanceOf(owner.address);
      expect(balanceOfOwner1).to.equal(1);

      const balanceOfOwner2 = await nftInstance.balanceOf(owner.address);
      expect(balanceOfOwner2).to.equal(0);

      const txr: ContractTransaction = await linkInstance.transfer(nftInstance.address, linkAmountInWei);
      await txr.wait();

      const nftInstanceBalance = await linkInstance.balanceOf(nftInstance.address);
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

      const tx: ContractTransaction = await lootInstance.unpack(0);
      await tx.wait();

      await expect(tx).to.emit(lootInstance, "Transfer").withArgs(owner.address, ethers.constants.AddressZero, 0);
      await expect(tx)
        .to.emit(linkInstance, "Transfer")
        .withArgs(nftInstance.address, vrfInstance.address, parseEther("0.1"));

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
