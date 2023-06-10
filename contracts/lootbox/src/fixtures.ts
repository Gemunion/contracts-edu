import { ethers } from "hardhat";

export async function deployERC721(name: string, ...args: Array<any>): Promise<any> {
  const factory = await ethers.getContractFactory(name);
  return factory.deploy(...args);
}

export async function deployLinkVrfFixture() {
  // Deploy Chainlink & Vrf contracts
  const link = await ethers.getContractFactory("LinkToken");
  const linkInstance = await link.deploy();
  await linkInstance.waitForDeployment();
  // console.info(`LINK_ADDR=${await linkInstance.getAddress()}`);
  const vrfFactory = await ethers.getContractFactory("VRFCoordinatorMock");
  const vrfInstance = await vrfFactory.deploy(await linkInstance.getAddress());
  await vrfInstance.waitForDeployment();
  // console.info(`VRF_ADDR=${await vrfInstance.getAddress()}`);
  return { linkInstance, vrfInstance };
}
