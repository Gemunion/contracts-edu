import { ethers } from "hardhat";

import { amount, span, tokenId, tokenName, tokenSymbol } from "@gemunion/contracts-constants";
import { time } from "@openzeppelin/test-helpers";

export async function deployERC721(): Promise<any> {
  const contractFactory = await ethers.getContractFactory("ERC721AB");
  return contractFactory.deploy(tokenName, tokenSymbol);
}
export async function deployAuctionFactory(): Promise<any> {
  const contractFactory = await ethers.getContractFactory("AuctionFactory");
  return contractFactory.deploy();
}

export async function deployAuction(stepMultiplier = 10n, offset = 0, erc721Instance: any): Promise<any> {
  const [owner] = await ethers.getSigners();
  const timestamp: number = (await time.latest()).toNumber();
  const contractFactory = await ethers.getContractFactory("AuctionERC721ETHTemplate");
  return contractFactory.deploy(
    owner.address,
    await erc721Instance.getAddress(),
    tokenId,
    amount,
    amount / stepMultiplier,
    amount * 3n,
    timestamp + offset,
    timestamp + offset + span,
  );
}
