import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { ContractFactory } from "ethers";
import { Network } from "@ethersproject/networks";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { amount, baseTokenURI, MINTER_ROLE, nonce, tokenId, tokenName } from "@gemunion/contracts-constants";

import { EIP712ERC1155, ERC1155AB } from "../../typechain-types";

use(solidity);

describe("EIP712ERC1155", function () {
  let erc1155: ContractFactory;
  let erc1155Instance: ERC1155AB;
  let dropbox: ContractFactory;
  let dropboxInstance: EIP712ERC1155;
  let owner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let stranger: SignerWithAddress;
  let network: Network;

  beforeEach(async function () {
    erc1155 = await ethers.getContractFactory("ERC1155AB");
    dropbox = await ethers.getContractFactory("EIP712ERC1155");
    [owner, receiver, stranger] = await ethers.getSigners();

    erc1155Instance = (await erc1155.deploy(baseTokenURI)) as ERC1155AB;
    dropboxInstance = (await dropbox.deploy(tokenName)) as EIP712ERC1155;

    await dropboxInstance.grantRole(MINTER_ROLE, owner.address);
    await erc1155Instance.grantRole(MINTER_ROLE, dropboxInstance.address);

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
            { name: "tokenIds", type: "uint256[]" },
            { name: "amounts", type: "uint256[]" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: erc1155Instance.address,
          tokenIds: [tokenId],
          amounts: [amount],
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc1155Instance.address, [tokenId], [amount], owner.address, signature);
      await expect(tx1)
        .to.emit(erc1155Instance, "TransferBatch")
        .withArgs(dropboxInstance.address, ethers.constants.AddressZero, receiver.address, [tokenId], [amount]);
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
            { name: "tokenIds", type: "uint256[]" },
            { name: "amounts", type: "uint256[]" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: erc1155Instance.address,
          tokenIds: [tokenId],
          amounts: [amount],
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc1155Instance.address, [tokenId], [amount], owner.address, signature);
      await expect(tx1)
        .to.emit(erc1155Instance, "TransferBatch")
        .withArgs(dropboxInstance.address, ethers.constants.AddressZero, receiver.address, [tokenId], [amount]);

      const tx2 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc1155Instance.address, [tokenId], [amount], owner.address, signature);
      await expect(tx2).to.be.revertedWith("EIP712ERC1155: Expired signature");
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
            { name: "tokenIds", type: "uint256[]" },
            { name: "amounts", type: "uint256[]" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: erc1155Instance.address,
          tokenIds: [tokenId],
          amounts: [amount],
        },
      );

      const tx1 = dropboxInstance.redeem(
        nonce,
        stranger.address,
        erc1155Instance.address,
        [tokenId],
        [amount],
        owner.address,
        signature,
      );
      await expect(tx1).to.be.revertedWith("EIP712ERC1155: Invalid signature");
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
            { name: "tokenIds", type: "uint256[]" },
            { name: "amounts", type: "uint256[]" },
          ],
        },
        // Value
        {
          nonce,
          account: receiver.address,
          token: erc1155Instance.address,
          tokenIds: [tokenId],
          amounts: [amount],
        },
      );

      const tx1 = dropboxInstance
        .connect(stranger)
        .redeem(nonce, receiver.address, erc1155Instance.address, [tokenId], [amount], stranger.address, signature);
      await expect(tx1).to.be.revertedWith("EIP712ERC1155: Wrong signer");
    });
  });
});
