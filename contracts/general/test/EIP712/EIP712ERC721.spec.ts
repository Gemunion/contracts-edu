import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { ContractFactory } from "ethers";
import { Network } from "@ethersproject/networks";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { MINTER_ROLE, nonce, tokenId, tokenName, tokenSymbol } from "@gemunion/contracts-constants";

import { EIP712ERC721, ERC721AB } from "../../typechain-types";

use(solidity);

describe("EIP712ERC721", function () {
  let erc721: ContractFactory;
  let erc721Instance: ERC721AB;
  let dropbox: ContractFactory;
  let dropboxInstance: EIP712ERC721;
  let owner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let stranger: SignerWithAddress;
  let network: Network;

  beforeEach(async function () {
    erc721 = await ethers.getContractFactory("ERC721AB");
    dropbox = await ethers.getContractFactory("EIP712ERC721");
    [owner, receiver, stranger] = await ethers.getSigners();

    erc721Instance = (await erc721.deploy(tokenName, tokenSymbol)) as ERC721AB;
    dropboxInstance = (await dropbox.deploy(tokenName)) as EIP712ERC721;

    await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
    await erc721Instance.grantRole(MINTER_ROLE, dropboxInstance.address);

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
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: erc721Instance.address,
          tokenId,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc721Instance.address, tokenId, owner.address, signature);
      await expect(tx1)
        .to.emit(erc721Instance, "Transfer")
        .withArgs(ethers.constants.AddressZero, receiver.address, tokenId);
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
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: erc721Instance.address,
          tokenId,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc721Instance.address, tokenId, owner.address, signature);
      await expect(tx1)
        .to.emit(erc721Instance, "Transfer")
        .withArgs(ethers.constants.AddressZero, receiver.address, tokenId);

      const tx2 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc721Instance.address, tokenId, owner.address, signature);
      await expect(tx2).to.be.revertedWith("EIP712ERC721: Expired signature");
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
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: erc721Instance.address,
          tokenId,
        },
      );

      const tx1 = dropboxInstance.redeem(
        nonce,
        stranger.address,
        erc721Instance.address,
        tokenId,
        owner.address,
        signature,
      );
      await expect(tx1).to.be.revertedWith("EIP712ERC721: Invalid signature");
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
            { name: "tokenId", type: "uint256" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: erc721Instance.address,
          tokenId,
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc721Instance.address, tokenId, stranger.address, signature);
      await expect(tx1).to.be.revertedWith("EIP712ERC721: Wrong signer");
    });
  });
});
