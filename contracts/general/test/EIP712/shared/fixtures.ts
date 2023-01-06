import { ethers } from "hardhat";

import { tokenName, tokenSymbol, baseTokenURI } from "@gemunion/contracts-constants";

export async function deployErc20() {
  const factory = await ethers.getContractFactory("ERC20AB");
  return factory.deploy(tokenName, tokenSymbol);
}

export async function deployErc721() {
  const factory = await ethers.getContractFactory("ERC721AB");
  return factory.deploy(tokenName, tokenSymbol);
}

export async function deployErc1155() {
  const factory = await ethers.getContractFactory("ERC1155AB");
  return factory.deploy(baseTokenURI);
}

export async function deployDropbox(name: string) {
  const factory = await ethers.getContractFactory(name);
  return factory.deploy(tokenName);
}
