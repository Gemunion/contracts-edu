import { expect } from "chai";
import { ethers, network } from "hardhat";
import { parseEther, WeiPerEther, ZeroAddress } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { MINTER_ROLE, tokenName, tokenSymbol } from "@ethberry/contracts-constants";

import { deployERC721, deployLinkVrfFixture } from "../src";
import { randomRequest } from "./shared/randomRequest";

const linkAmountInWei = WeiPerEther * 1000n;

describe("LootBox", function () {
  let vrfInstance: any;
  let linkInstance: any;

  const keyHash = "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186";
  const fee = parseEther("0.1");

  before(async function () {
    await network.provider.send("hardhat_reset");

    // https://github.com/NomicFoundation/hardhat/issues/2980
    ({ linkInstance, vrfInstance } = await loadFixture(function mysterybox() {
      return deployLinkVrfFixture();
    }));
  });

  const factory = () => deployERC721("ChainLinkLootboxMock", tokenName, tokenSymbol);
  const erc721Factory = async () =>
    deployERC721(
      "ChainLinkTokenMock",
      tokenName,
      tokenSymbol,
      await vrfInstance.getAddress(),
      await linkInstance.getAddress(),
      keyHash,
      fee,
    );

  describe("Factory", function () {
    it("should fail not a contract", async function () {
      const [_owner, receiver] = await ethers.getSigners();

      const lootInstance = await factory();

      const tx = lootInstance.setFactory(receiver.address);
      await expect(tx).to.be.revertedWith(`LootBox: the factory must be a deployed contract`);
    });

    it("Should set factory address", async function () {
      const lootInstance = await factory();

      const erc721Instance = await erc721Factory();

      const tx = lootInstance.setFactory(await erc721Instance.getAddress());
      await expect(tx).to.not.be.reverted;
    });

    it("Should set the right roles for lootbox", async function () {
      const [owner] = await ethers.getSigners();

      const lootInstance = await factory();
      const erc721Instance = await erc721Factory();

      const tx = erc721Instance.grantRole(MINTER_ROLE, await lootInstance.getAddress());
      await expect(tx)
        .to.emit(erc721Instance, "RoleGranted")
        .withArgs(MINTER_ROLE, await lootInstance.getAddress(), owner.address);

      const isMinter = await erc721Instance.hasRole(MINTER_ROLE, await lootInstance.getAddress());
      expect(isMinter).to.equal(true);
    });
  });

  describe("Unpack Random", function () {
    it("should fail not owner of token", async function () {
      const [owner, receiver] = await ethers.getSigners();

      const lootInstance = await factory();
      const erc721Instance = await erc721Factory();

      await erc721Instance.grantRole(MINTER_ROLE, await lootInstance.getAddress());
      await lootInstance.setFactory(await erc721Instance.getAddress());
      await lootInstance.mint(owner.address);
      const tx = lootInstance.connect(receiver).unpack(0);
      await expect(tx).to.be.revertedWith("LootBox: unpack caller is not owner nor approved");
    });

    it("should fail not enough LINK", async function () {
      const [owner] = await ethers.getSigners();

      const lootInstance = await factory();
      const erc721Instance = await erc721Factory();

      await erc721Instance.grantRole(MINTER_ROLE, await lootInstance.getAddress());
      await lootInstance.setFactory(await erc721Instance.getAddress());
      await lootInstance.mint(owner.address);

      const balanceOfOwner1 = await lootInstance.balanceOf(owner.address);
      expect(balanceOfOwner1).to.equal(1);

      const tx = lootInstance.unpack(0);
      await expect(tx).to.be.revertedWith("ERC721ChainLink: Not enough LINK");
    });

    it("should mint token", async function () {
      const [owner] = await ethers.getSigners();

      const erc721Instance = await erc721Factory();

      const tx = await erc721Instance.mint(owner.address);
      await tx.wait();

      const balanceOfOwner = await erc721Instance.balanceOf(owner.address);
      expect(balanceOfOwner).to.equal(1);
    });

    it("should unpack own tokens using random", async function () {
      const [owner] = await ethers.getSigners();

      const lootInstance = await factory();
      const erc721Instance = await erc721Factory();

      await erc721Instance.grantRole(MINTER_ROLE, await lootInstance.getAddress());
      await erc721Instance.grantRole(MINTER_ROLE, await vrfInstance.getAddress());
      await lootInstance.setFactory(await erc721Instance.getAddress());
      const txx = await lootInstance.mint(owner.address);
      await txx.wait();

      const balanceOfOwner1 = await lootInstance.balanceOf(owner.address);
      expect(balanceOfOwner1).to.equal(1);

      const balanceOfOwner2 = await erc721Instance.balanceOf(owner.address);
      expect(balanceOfOwner2).to.equal(0);

      const txr = await linkInstance.transfer(await erc721Instance.getAddress(), linkAmountInWei);
      await txr.wait();

      const [erc721InstanceBalance] = await linkInstance.balanceOf.staticCallResult(await erc721Instance.getAddress());
      expect(erc721InstanceBalance).to.equal(linkAmountInWei);

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
      // await linkTokenContract.transfer(erc721Instance, parseEther("1.0")).then(function (transaction: any) {
      //   console.info("Contract ", await erc721Instance.getAddress(), " funded with 1 LINK. Transaction Hash: ", transaction.hash);
      // });

      const tx = await lootInstance.unpack(0);
      await tx.wait();

      await expect(tx).to.emit(lootInstance, "Transfer").withArgs(owner.address, ZeroAddress, 0);
      await expect(tx)
        .to.emit(linkInstance, "Transfer(address,address,uint256)")
        .withArgs(await erc721Instance.getAddress(), await vrfInstance.getAddress(), parseEther("0.1"));

      // await expect(tx).to.emit(erc721Instance, "RandomRequest");
      // const eventFilter = erc721Instance.filters.RandomRequest();
      // const events = await erc721Instance.queryFilter(eventFilter);
      // const requestId = events[0].args[0];

      await randomRequest(erc721Instance, vrfInstance);

      // await expect(tx).to.emit(vrfInstance, "RandomnessRequest");
      // await expect(tx).to.emit(vrfInstance, "RandomnessRequestId").withArgs(requestId, await erc721Instance.getAddress());
      //
      // const trx = await vrfInstance.callBackWithRandomness(requestId, 123, await erc721Instance.getAddress());
      // await trx.wait();
      // await expect(trx).to.emit(erc721Instance, "MintRandom").withArgs(owner.address, requestId);

      const balanceOfOwner3 = await lootInstance.balanceOf(owner.address);
      expect(balanceOfOwner3).to.equal(0);

      const balanceOfOwner4 = await erc721Instance.balanceOf(owner.address);
      expect(balanceOfOwner4).to.equal(1);

      const item = await erc721Instance.tokenOfOwnerByIndex(owner.address, 0);
      expect(item).to.equal(0); // 0 is nft index
    });
  });
});
