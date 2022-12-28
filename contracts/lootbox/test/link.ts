import { ethers } from "hardhat";

import { tokenName, tokenSymbol } from "@gemunion/contracts-constants";

export async function deployLinkVrfFixture() {
  // Deploy Chainlink & Vrf contracts
  const link = await ethers.getContractFactory("LINK");
  const linkInstance = await link.deploy(tokenName, tokenSymbol);
  await linkInstance.deployed();
  // console.info(`LINK_ADDR=${linkInstance.address}`);
  const vrfFactory = await ethers.getContractFactory("VRFCoordinatorMock");
  const vrfInstance = await vrfFactory.deploy(linkInstance.address);
  await vrfInstance.deployed();
  // console.info(`VRF_ADDR=${vrfInstance.address}`);
  return { linkInstance, vrfInstance };
}
