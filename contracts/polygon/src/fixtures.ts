import { ethers } from "hardhat";

import { tokenName, tokenSymbol } from "@gemunion/contracts-constants";

export async function deployErc20(name: string) {
  const factory = await ethers.getContractFactory(name);
  return factory.deploy(tokenName, tokenSymbol);
}
