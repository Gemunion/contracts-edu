import { ethers } from "hardhat";

import { amount, tokenName, tokenSymbol } from "@ethberry/contracts-constants";

async function main() {
  const erc20 = await ethers.getContractFactory("ERC20AF");
  const erc20Instance = await erc20.deploy(tokenName, tokenSymbol);

  const erc20FlashBorrower = await ethers.getContractFactory("ERC3156FlashBorrowerMock");
  const erc20FlashBorrowerInstance = await erc20FlashBorrower.deploy(true, true);

  await erc20Instance.flashLoan(erc20FlashBorrowerInstance.address, await erc20Instance.getAddress(), amount, "0x");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
