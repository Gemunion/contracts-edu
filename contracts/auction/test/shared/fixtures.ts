import { ethers } from "hardhat";
import { Contract } from "ethers";

import { amount, span, tokenId, tokenName, tokenSymbol } from "@gemunion/contracts-constants";
import { time } from "@openzeppelin/test-helpers";

export async function deployERC721() {
  const contractFactory = await ethers.getContractFactory("ERC721AB");
  return contractFactory.deploy(tokenName, tokenSymbol);
}
export async function deployAuctionFactory() {
  const contractFactory = await ethers.getContractFactory("AuctionFactory");
  return contractFactory.deploy();
}

export async function deployAuction(stepMultiplier = 1 / 10, offset = 0, erc721Instance: Contract) {
  const [owner] = await ethers.getSigners();
  const timestamp: number = (await time.latest()).toNumber();
  const contractFactory = await ethers.getContractFactory("AuctionERC721ETHTemplate");
  return contractFactory.deploy(
    owner.address,
    erc721Instance.address,
    tokenId,
    amount,
    amount * stepMultiplier,
    amount * 3,
    timestamp + offset,
    timestamp + offset + span,
  );
}
