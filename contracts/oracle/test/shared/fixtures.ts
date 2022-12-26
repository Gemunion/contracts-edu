import { ethers } from "hardhat";

export async function deployPriceOracle(name: string) {
  const contractFactory = await ethers.getContractFactory(name);
  return contractFactory.deploy();
}
