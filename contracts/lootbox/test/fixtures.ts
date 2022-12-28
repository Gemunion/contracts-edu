import { ethers } from "hardhat";

export async function deployERC721(name: string, ...args: Array<any>) {
  const factory = await ethers.getContractFactory(name);
  return factory.deploy(...args);
}
