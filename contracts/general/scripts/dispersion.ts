import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { randomBytes, hexlify } from "ethers";

import { mapSeries } from "./map-series";

async function main() {
  const contract = await ethers.getContractFactory("Dispersion");

  const dispersionInstance = await contract.deploy();

  const result = await mapSeries(
    new Array(1e4).fill(null).map(() => {
      return () => dispersionInstance.getDispersion(BigInt(hexlify(randomBytes(32))));
    }),
  );

  const dispersion = result.reduce(
    (memo, e) => {
      const index = e.toString();
      if (!memo[index]) {
        memo[index] = 0;
      }
      memo[index]++;
      return memo;
    },
    {} as Record<string, number>,
  );

  console.info(dispersion);
}

main().then(console.info).catch(console.error);
