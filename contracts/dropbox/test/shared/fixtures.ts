import { ethers } from "hardhat";

import { royalty, tokenMaxAmount, tokenName, tokenSymbol } from "@ethberry/contracts-constants";

export async function deployERC721(name: string): Promise<any> {
  const erc721Factory = await ethers.getContractFactory(name);
  return erc721Factory.deploy(tokenName, tokenSymbol, tokenMaxAmount, royalty);
}
