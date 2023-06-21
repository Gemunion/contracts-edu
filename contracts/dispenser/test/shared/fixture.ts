import { ethers } from "hardhat";

import { baseTokenURI, tokenName, tokenSymbol } from "@gemunion/contracts-constants";

export async function deployERC20(): Promise<any> {
  const factory = await ethers.getContractFactory("ERC20AB");
  return factory.deploy(tokenName, tokenSymbol);
}

export async function deployERC721(): Promise<any> {
  const contractFactory = await ethers.getContractFactory("ERC721AB");
  return contractFactory.deploy(tokenName, tokenSymbol);
}

export async function deployERC1155(): Promise<any> {
  const factory = await ethers.getContractFactory("ERC1155AB");
  return factory.deploy(baseTokenURI);
}
