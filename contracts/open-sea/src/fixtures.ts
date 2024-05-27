import { ethers } from "hardhat";
import { Contract } from "ethers";

import { royalty, tokenName, tokenSymbol } from "@gemunion/contracts-constants";

export async function deployERC721<T extends Contract>(name: string): Promise<T> {
  const factory = await ethers.getContractFactory(name);
  return factory.deploy(tokenName, tokenSymbol, royalty) as Promise<T>;
}
