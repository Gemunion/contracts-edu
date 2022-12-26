import { task } from "hardhat/config";

task("balance-erc20", "Prints an ERC20 balance")
  .addParam("account", "The account's address")
  .addParam("contract", "The ERC20 contract's address")
  .setAction(async (args, hre) => {
    const { account, contract } = args;

    const coinFactory = await hre.ethers.getContractFactory("ERC20ABCS");
    const coinInstance = coinFactory.attach(contract);
    const accBalance = await coinInstance.balanceOf(account);

    console.info("ERC20 Balance:", hre.ethers.utils.formatEther(accBalance.toString()));
  });
