import { ethers } from "hardhat";
import { time } from "@openzeppelin/test-helpers";

export async function deployERC20(name = "ERC20ABC", options: any = {}): Promise<any> {
  const factory = await ethers.getContractFactory(name);
  const args = Object.assign({ tokenName: "Gemunion", tokenSymbol: "GEM" }, options);
  return factory.deploy(...Object.values(args));
}

export async function deployVesting(name: string, cliffInMonth: number, monthlyRelease: number): Promise<any> {
  const [owner] = await ethers.getSigners();
  const current = await time.latest();
  const vestingFactory = await ethers.getContractFactory(name);
  const vestingInstance: any = await vestingFactory.deploy(
    owner.address,
    current.toNumber(),
    cliffInMonth,
    monthlyRelease,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return vestingInstance;
}
