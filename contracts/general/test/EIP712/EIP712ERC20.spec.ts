import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { ContractFactory } from "ethers";
import { Network } from "@ethersproject/networks";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { amount, MINTER_ROLE, nonce, tokenName, tokenSymbol } from "@gemunion/contracts-constants";

import { EIP712ERC20, ERC20AB } from "../../typechain-types";

use(solidity);

describe("EIP712ERC20", function () {
  let erc20: ContractFactory;
  let erc20Instance: ERC20AB;
  let dropbox: ContractFactory;
  let dropboxInstance: EIP712ERC20;
  let owner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let stranger: SignerWithAddress;
  let network: Network;

  beforeEach(async function () {
    erc20 = await ethers.getContractFactory("ERC20AB");
    dropbox = await ethers.getContractFactory("EIP712ERC20");
    [owner, receiver, stranger] = await ethers.getSigners();

    erc20Instance = (await erc20.deploy(tokenName, tokenSymbol)) as ERC20AB;
    dropboxInstance = (await dropbox.deploy(tokenName)) as EIP712ERC20;

    await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
    await erc20Instance.grantRole(MINTER_ROLE, dropboxInstance.address);

    network = await ethers.provider.getNetwork();
  });

  describe("redeem", function () {
    it("should redeem", async function () {
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
