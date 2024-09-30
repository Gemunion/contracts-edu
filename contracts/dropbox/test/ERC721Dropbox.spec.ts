import { expect } from "chai";
import { ethers } from "hardhat";
import { encodeBytes32String, ZeroAddress } from "ethers";

import {
  DEFAULT_ADMIN_ROLE,
  InterfaceId,
  MINTER_ROLE,
  nonce,
  tokenId,
  tokenMaxAmount,
  tokenName,
} from "@ethberry/contracts-constants";
import { shouldBehaveLikeAccessControl } from "@ethberry/contracts-access";
import { shouldSupportsInterface } from "@ethberry/contracts-utils";
import {
  shouldBehaveLikeERC721,
  shouldBehaveLikeERC721Burnable,
  shouldBehaveLikeERC721Royalty,
} from "@ethberry/contracts-erc721";

import { deployERC721 } from "./shared/fixtures";

describe("ERC721DropboxTest", function () {
  const factory = () => deployERC721(this.title);

  shouldBehaveLikeAccessControl(factory)(DEFAULT_ADMIN_ROLE, MINTER_ROLE);

  shouldBehaveLikeERC721(factory);
  shouldBehaveLikeERC721Burnable(factory);
  shouldBehaveLikeERC721Royalty(factory);

  describe("redeem", function () {
    it("should redeem", async function () {
      const network = await ethers.provider.getNetwork();
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const signature = await owner.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await contractInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          tokenId,
        },
      );

      const tx1 = contractInstance.connect(receiver).redeem(nonce, receiver, tokenId, owner, signature);
      await expect(tx1).to.emit(contractInstance, "DropboxRedeem").withArgs(receiver.address, tokenId);

      const ownerOf = await contractInstance.ownerOf(tokenId);
      expect(ownerOf).to.equal(receiver.address);
    });

    it("should fail: AccessControlUnauthorizedAccount", async function () {
      const network = await ethers.provider.getNetwork();
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const signature = await owner.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await contractInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          tokenId,
        },
      );

      const tx = contractInstance.connect(receiver).redeem(nonce, receiver, tokenId, receiver, signature);
      await expect(tx)
        .to.be.revertedWithCustomError(contractInstance, "AccessControlUnauthorizedAccount")
        .withArgs(receiver.address, MINTER_ROLE);
    });

    it("should fail: invalid signature", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const tx1 = contractInstance
        .connect(receiver)
        .redeem(nonce, receiver, tokenId, owner, encodeBytes32String("signature"));
      await expect(tx1)
        .to.be.revertedWithCustomError(contractInstance, "DropboxInvalidSignature")
        .withArgs(owner.address);
    });

    it("should fail: expired signature", async function () {
      const network = await ethers.provider.getNetwork();
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const signature = await owner.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await contractInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          tokenId,
        },
      );

      const tx1 = contractInstance.connect(receiver).redeem(nonce, receiver, tokenId, owner, signature);
      await expect(tx1).to.emit(contractInstance, "DropboxRedeem").withArgs(receiver.address, tokenId);

      const tx2 = contractInstance.connect(receiver).redeem(nonce, receiver, tokenId, owner, signature);
      await expect(tx2).to.be.revertedWithCustomError(contractInstance, "DropboxExpiredSignature");
    });

    it("should fail: token already minted", async function () {
      const network = await ethers.provider.getNetwork();
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const signature = await owner.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await contractInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          tokenId,
        },
      );

      const tx1 = contractInstance.connect(receiver).redeem(nonce, receiver, tokenId, owner, signature);
      await expect(tx1).to.emit(contractInstance, "DropboxRedeem").withArgs(receiver.address, tokenId);

      const newNonce = encodeBytes32String("nonce1");

      const signature2 = await owner.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await contractInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce: newNonce,
          account: receiver.address,
          tokenId,
        },
      );

      const tx2 = contractInstance.connect(receiver).redeem(newNonce, receiver, tokenId, owner, signature2);
      await expect(tx2).to.be.revertedWithCustomError(contractInstance, "ERC721InvalidSender").withArgs(ZeroAddress);
    });

    it("should fail: cap exceeded", async function () {
      const network = await ethers.provider.getNetwork();
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const signature = await owner.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await contractInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          tokenId,
        },
      );

      const tx1 = contractInstance.connect(receiver).redeem(nonce, receiver, tokenId, owner, signature);
      await expect(tx1).to.emit(contractInstance, "DropboxRedeem").withArgs(receiver.address, tokenId);

      const tokenId2 = 2;
      const nonce2 = encodeBytes32String("nonce2");

      const signature2 = await owner.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await contractInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce: nonce2,
          account: receiver.address,
          tokenId: tokenId2,
        },
      );

      const tx2 = contractInstance.connect(receiver).redeem(nonce2, receiver, tokenId2, owner, signature2);
      await expect(tx2).to.emit(contractInstance, "DropboxRedeem").withArgs(receiver.address, tokenId2);

      const tokenId3 = 3;
      const nonce3 = encodeBytes32String("nonce3");

      const signature3 = await owner.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await contractInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce: nonce3,
          account: receiver.address,
          tokenId: tokenId3,
        },
      );

      const tx3 = contractInstance.connect(receiver).redeem(nonce3, receiver, tokenId3, owner, signature3);
      await expect(tx3)
        .to.be.revertedWithCustomError(contractInstance, "ERC721ExceededCap")
        .withArgs(3, tokenMaxAmount);
    });
  });

  shouldSupportsInterface(factory)([
    InterfaceId.IERC165,
    InterfaceId.IAccessControl,
    InterfaceId.IERC721,
    InterfaceId.IERC721Metadata,
    InterfaceId.IRoyalty,
  ]);
});
