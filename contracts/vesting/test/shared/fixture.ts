import { ethers } from "hardhat";
import { time } from "@openzeppelin/test-helpers";

import { amount, span, tokenName, tokenSymbol } from "@gemunion/contracts-constants";

export async function deployVesting(name: string): Promise<any> {
  const [owner] = await ethers.getSigners();
  const current = await time.latest();
  const vestingFactory = await ethers.getContractFactory(name);
  const vestingInstance: any = await vestingFactory.deploy(owner.address, current.toNumber(), span * 4);

  await owner.sendTransaction({
    to: await vestingInstance.getAddress(),
    value: amount * 100n,
    gasLimit: 21000 + 61, // + revert
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return vestingInstance;
}

export async function deployERC20(contractInstance: any): Promise<any> {
  const factory = await ethers.getContractFactory("ERC20AB");
  const instance: any = await factory.deploy(tokenName, tokenSymbol);
  await instance.mint(await contractInstance.getAddress(), amount * 100n);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return instance;
}
