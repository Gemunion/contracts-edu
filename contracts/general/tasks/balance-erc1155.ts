import { task } from "hardhat/config";

task("balance-erc1155", "Prints an ERC1155 balance")
  .addParam("account", "The account's address")
  .addParam("contract", "The ERC1155 contract's address")
  .setAction(async (args, hre) => {
    const { account, contract } = args;

    const coinFactory = await hre.ethers.getContractFactory("ERC1155Simple");
    const coinInstance = coinFactory.attach(contract);
    const accBalance = await coinInstance.balanceOf(account, "16110");

    console.info("ERC1155 Balance:", hre.ethers.utils.formatEther(accBalance.toString()));
  });
