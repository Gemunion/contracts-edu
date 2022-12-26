import { ethers } from "hardhat";

import { tokenName, tokenSymbol } from "@gemunion/contracts-constants";

export async function deployErc721Base(name: string) {
  const erc721Factory = await ethers.getContractFactory(name);
  return erc721Factory.deploy(tokenName, tokenSymbol, 1);
}
