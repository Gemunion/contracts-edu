import { expect } from "chai";
import { ethers } from "hardhat";
import { ZeroAddress } from "ethers";

import { amount, MINTER_ROLE, nonce, tokenName } from "@ethberry/contracts-constants";

import { deployDropbox, deployErc20 } from "./shared/fixtures";

describe("EIP712ERC20", function () {
  describe("redeem", function () {
    it("should redeem", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc20Instance = await deployErc20();
      const dropboxInstance = await deployDropbox("EIP712ERC20");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc20Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());

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
            { name: "amount", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc20Instance.getAddress(),
          amount,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, await erc20Instance.getAddress(), amount, owner.address, signature);
      await expect(tx1).to.emit(erc20Instance, "Transfer").withArgs(ZeroAddress, receiver.address, amount);
    });

    it("should fail: duplicate mint", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc20Instance = await deployErc20();
      const dropboxInstance = await deployDropbox("EIP712ERC20");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc20Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());

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
            { name: "amount", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc20Instance.getAddress(),
          amount,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, await erc20Instance.getAddress(), amount, owner.address, signature);
      await expect(tx1).to.emit(erc20Instance, "Transfer").withArgs(ZeroAddress, receiver.address, amount);

      const tx2 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, await erc20Instance.getAddress(), amount, owner.address, signature);
      await expect(tx2).to.be.revertedWith("EIP712ERC20: Expired signature");
    });

    it("should fail: Invalid signature", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc20Instance = await deployErc20();
      const dropboxInstance = await deployDropbox("EIP712ERC20");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc20Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());

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
            { name: "amount", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc20Instance.getAddress(),
          amount,
        },
      );

      const tx1 = dropboxInstance.redeem(
        nonce,
        stranger.address,
        await erc20Instance.getAddress(),
        amount,
        owner.address,
        signature,
      );
      await expect(tx1).to.be.revertedWith("EIP712ERC20: Invalid signature");
    });

    it("should fail: Wrong signer", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc20Instance = await deployErc20();
      const dropboxInstance = await deployDropbox("EIP712ERC20");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc20Instance.grantRole(MINTER_ROLE, await dropboxInstance.getAddress());

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
            { name: "amount", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: await erc20Instance.getAddress(),
          amount,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, await erc20Instance.getAddress(), amount, stranger.address, signature);
      await expect(tx1).to.be.revertedWith("EIP712ERC20: Wrong signer");
    });
  });
});
