import { expect } from "chai";
import { ethers } from "hardhat";
import { ZeroAddress } from "ethers";

import { MINTER_ROLE, nonce, tokenId, tokenName } from "@ethberry/contracts-constants";

import { deployDropbox, deployErc721 } from "./shared/fixtures";

describe("EIP712ERC721", function () {
  describe("redeem", function () {
    it("should redeem", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc721Instance = await deployErc721();
      const dropboxInstance = await deployDropbox("EIP712ERC721");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc721Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());

      const signature = await owner.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await dropboxInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc721Instance.getAddress(),
          tokenId,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, await erc721Instance.getAddress(), tokenId, owner.address, signature);
      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(ZeroAddress, receiver.address, tokenId);
    });

    it("should fail: duplicate mint", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc721Instance = await deployErc721();
      const dropboxInstance = await deployDropbox("EIP712ERC721");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc721Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());

      const signature = await owner.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await dropboxInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc721Instance.getAddress(),
          tokenId,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, await erc721Instance.getAddress(), tokenId, owner.address, signature);
      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(ZeroAddress, receiver.address, tokenId);

      const tx2 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, await erc721Instance.getAddress(), tokenId, owner.address, signature);
      await expect(tx2).to.be.revertedWith("EIP712ERC721: Expired signature");
    });

    it("should fail: Invalid signature", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc721Instance = await deployErc721();
      const dropboxInstance = await deployDropbox("EIP712ERC721");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc721Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());

      const signature = await owner.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await dropboxInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc721Instance.getAddress(),
          tokenId,
        },
      );

      const tx1 = dropboxInstance.redeem(
        nonce,
        stranger.address,
        await erc721Instance.getAddress(),
        tokenId,
        owner.address,
        signature,
      );
      await expect(tx1).to.be.revertedWith("EIP712ERC721: Invalid signature");
    });

    it("should fail: Wrong signer", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc721Instance = await deployErc721();
      const dropboxInstance = await deployDropbox("EIP712ERC721");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc721Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());

      const signature = await stranger.signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: await dropboxInstance.getAddress(),
        },
        // Types
        {
          EIP712: [
            { name: "nonce", type: "bytes32" },
            { name: "account", type: "address" },
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc721Instance.getAddress(),
          tokenId,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, await erc721Instance.getAddress(), tokenId, stranger.address, signature);
      await expect(tx1).to.be.revertedWith("EIP712ERC721: Wrong signer");
    });
  });
});
