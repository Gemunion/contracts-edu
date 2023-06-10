import { expect } from "chai";
import { ethers } from "hardhat";
import { ZeroAddress } from "ethers";

import { amount, MINTER_ROLE, nonce, tokenId, tokenName } from "@gemunion/contracts-constants";

import { deployDropbox, deployErc1155 } from "./shared/fixtures";

describe("EIP712ERC1155", function () {
  describe("redeem", function () {
    it("should redeem", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc1155Instance = await deployErc1155();
      const dropboxInstance = await deployDropbox("EIP712ERC1155");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc1155Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());
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
            { name: "tokenIds", type: "uint256[]" },
            { name: "amounts", type: "uint256[]" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc1155Instance.getAddress(),
          tokenIds: [tokenId],
          amounts: [amount],
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(
          nonce,
          receiver.address,
          await erc1155Instance.getAddress(),
          [tokenId],
          [amount],
          owner.address,
          signature,
        );
      await expect(tx1)
        .to.emit(erc1155Instance, "TransferBatch")
        .withArgs(await dropboxInstance.getAddress(), ZeroAddress, receiver.address, [tokenId], [amount]);
    });

    it("should fail: duplicate mint", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc1155Instance = await deployErc1155();
      const dropboxInstance = await deployDropbox("EIP712ERC1155");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc1155Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());

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
            { name: "tokenIds", type: "uint256[]" },
            { name: "amounts", type: "uint256[]" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc1155Instance.getAddress(),
          tokenIds: [tokenId],
          amounts: [amount],
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(
          nonce,
          receiver.address,
          await erc1155Instance.getAddress(),
          [tokenId],
          [amount],
          owner.address,
          signature,
        );
      await expect(tx1)
        .to.emit(erc1155Instance, "TransferBatch")
        .withArgs(await dropboxInstance.getAddress(), ZeroAddress, receiver.address, [tokenId], [amount]);

      const tx2 = dropboxInstance
        .connect(stranger)
        .redeem(
          nonce,
          receiver.address,
          await erc1155Instance.getAddress(),
          [tokenId],
          [amount],
          owner.address,
          signature,
        );
      await expect(tx2).to.be.revertedWith("EIP712ERC1155: Expired signature");
    });

    it("should fail: Invalid signature", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc1155Instance = await deployErc1155();
      const dropboxInstance = await deployDropbox("EIP712ERC1155");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc1155Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());

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
            { name: "tokenIds", type: "uint256[]" },
            { name: "amounts", type: "uint256[]" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc1155Instance.getAddress(),
          tokenIds: [tokenId],
          amounts: [amount],
        },
      );

      const tx1 = dropboxInstance.redeem(
        nonce,
        stranger.address,
        await erc1155Instance.getAddress(),
        [tokenId],
        [amount],
        owner.address,
        signature,
      );
      await expect(tx1).to.be.revertedWith("EIP712ERC1155: Invalid signature");
    });

    it("should fail: Wrong signer", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc1155Instance = await deployErc1155();
      const dropboxInstance = await deployDropbox("EIP712ERC1155");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc1155Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());

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
            { name: "tokenIds", type: "uint256[]" },
            { name: "amounts", type: "uint256[]" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc1155Instance.getAddress(),
          tokenIds: [tokenId],
          amounts: [amount],
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(
          nonce,
          receiver.address,
          await erc1155Instance.getAddress(),
          [tokenId],
          [amount],
          stranger.address,
          signature,
        );
      await expect(tx1).to.be.revertedWith("EIP712ERC1155: Wrong signer");
    });
  });
});
