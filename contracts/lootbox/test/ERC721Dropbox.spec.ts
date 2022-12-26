import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";

import { MINTER_ROLE, tokenId, tokenName } from "@gemunion/contracts-constants";

import { deployErc721Base } from "../src";

use(solidity);

describe("ERC721DropboxTest", function () {
  const factory = () => deployErc721Base(this.title);

  describe("redeem", function () {
    it("should redeem", async function () {
      const network = await ethers.provider.getNetwork();
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const signature = await owner._signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: contractInstance.address,
        },
        // Types
        {
          EIP712: [
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          account: receiver.address,
          tokenId,
        },
      );

      const tx1 = contractInstance.connect(receiver).redeem(receiver.address, tokenId, owner.address, signature);
      await expect(tx1).to.emit(contractInstance, "Redeem").withArgs(receiver.address, tokenId);

      const ownerOf = await contractInstance.ownerOf(tokenId);
      expect(ownerOf).to.equal(receiver.address);
    });

    it("should fail: account is missing role", async function () {
      const network = await ethers.provider.getNetwork();
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const signature = await owner._signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: contractInstance.address,
        },
        // Types
        {
          EIP712: [
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          account: receiver.address,
          tokenId,
        },
      );

      const tx1 = contractInstance.connect(receiver).redeem(receiver.address, tokenId, receiver.address, signature);
      await expect(tx1).to.be.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${MINTER_ROLE}`,
      );
    });

    it("should fail: invalid signature", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const tx1 = contractInstance
        .connect(receiver)
        .redeem(receiver.address, tokenId, owner.address, ethers.utils.formatBytes32String("signature"));
      await expect(tx1).to.be.revertedWith("ERC721Dropbox: Invalid signature");
    });

    it("should fail: token already minted", async function () {
      const network = await ethers.provider.getNetwork();
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const signature = await owner._signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: contractInstance.address,
        },
        // Types
        {
          EIP712: [
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          account: receiver.address,
          tokenId,
        },
      );

      const tx1 = contractInstance.connect(receiver).redeem(receiver.address, tokenId, owner.address, signature);
      await expect(tx1).to.emit(contractInstance, "Redeem").withArgs(receiver.address, tokenId);

      const tx2 = contractInstance.connect(receiver).redeem(receiver.address, tokenId, owner.address, signature);
      await expect(tx2).to.be.revertedWith("ERC721: token already minted");
    });

    it("should fail: cap exceeded", async function () {
      const network = await ethers.provider.getNetwork();
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const signature = await owner._signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: contractInstance.address,
        },
        // Types
        {
          EIP712: [
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          account: receiver.address,
          tokenId,
        },
      );

      const tx1 = contractInstance.connect(receiver).redeem(receiver.address, tokenId, owner.address, signature);
      await expect(tx1).to.emit(contractInstance, "Redeem").withArgs(receiver.address, tokenId);

      const newTokenId = 2;

      const signature2 = await owner._signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: contractInstance.address,
        },
        // Types
        {
          EIP712: [
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          account: receiver.address,
          tokenId: newTokenId,
        },
      );

      const tx2 = contractInstance.connect(receiver).redeem(receiver.address, newTokenId, owner.address, signature2);
      await expect(tx2).to.be.revertedWith("ERC721Capped: cap exceeded");
    });
  });
});
