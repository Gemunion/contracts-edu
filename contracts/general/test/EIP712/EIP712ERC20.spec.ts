import { expect } from "chai";
import { ethers } from "hardhat";

import { amount, MINTER_ROLE, nonce, tokenName } from "@gemunion/contracts-constants";

import { deployDropbox, deployErc20 } from "./shared/fixtures";

describe("EIP712ERC20", function () {
  describe("redeem", function () {
    it("should redeem", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc20Instance = await deployErc20();
      const dropboxInstance = await deployDropbox("EIP712ERC20");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc20Instance.grantRole(MINTER_ROLE, dropboxInstance.address);

      const signature = await owner._signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: dropboxInstance.address,
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
          token: erc20Instance.address,
          amount,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc20Instance.address, amount, owner.address, signature);
      await expect(tx1)
        .to.emit(erc20Instance, "Transfer")
        .withArgs(ethers.constants.AddressZero, receiver.address, amount);
    });

    it("should fail: duplicate mint", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc20Instance = await deployErc20();
      const dropboxInstance = await deployDropbox("EIP712ERC20");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc20Instance.grantRole(MINTER_ROLE, dropboxInstance.address);

      const signature = await owner._signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: dropboxInstance.address,
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
          token: erc20Instance.address,
          amount,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc20Instance.address, amount, owner.address, signature);
      await expect(tx1)
        .to.emit(erc20Instance, "Transfer")
        .withArgs(ethers.constants.AddressZero, receiver.address, amount);

      const tx2 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc20Instance.address, amount, owner.address, signature);
      await expect(tx2).to.be.revertedWith("EIP712ERC20: Expired signature");
    });

    it("should fail: Invalid signature", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const erc20Instance = await deployErc20();
      const dropboxInstance = await deployDropbox("EIP712ERC20");

      await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
      await erc20Instance.grantRole(MINTER_ROLE, dropboxInstance.address);

      const signature = await owner._signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: dropboxInstance.address,
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
          token: erc20Instance.address,
          amount,
        },
      );

      const tx1 = dropboxInstance.redeem(
        nonce,
        stranger.address,
        erc20Instance.address,
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
      await erc20Instance.grantRole(MINTER_ROLE, dropboxInstance.address);

      const signature = await stranger._signTypedData(
        // Domain
        {
          name: tokenName,
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: dropboxInstance.address,
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
          token: erc20Instance.address,
          amount,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc20Instance.address, amount, stranger.address, signature);
      await expect(tx1).to.be.revertedWith("EIP712ERC20: Wrong signer");
    });
  });
});
