import { task } from "hardhat/config";

task("block-number", "Prints the current block number", async (_, hre) => {
  await hre.ethers.provider.getBlockNumber().then((blockNumber: number) => {
    console.info(`Current block number: ${blockNumber}`);
  });
});
