import { ethers } from "hardhat";

async function main() {
  const interfaceIdCalculator = await ethers.getContractFactory("StringHashCalculator");

  await interfaceIdCalculator.deploy();
}

main().then(console.info).catch(console.error);
