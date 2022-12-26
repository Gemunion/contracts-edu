import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers, upgrades } from "hardhat";

import { UUPS1, UUPS2 } from "../typechain-types";

use(solidity);

describe("Upgradeable", function () {
  it("should redeploy (uups)", async function () {
    const dummy1 = await ethers.getContractFactory("UUPS1");
    const dummy2 = await ethers.getContractFactory("UUPS2");

    const dummy1Instance = (await upgrades.deployProxy(dummy1, { kind: "uups" })) as UUPS1;

    const tx1 = dummy1Instance.getDummy();
    await expect(tx1).to.emit(dummy1Instance, "Dummy").withArgs(false);

    const dummy2Instance = (await upgrades.upgradeProxy(dummy1Instance.address, dummy2, {
      kind: "uups",
    })) as UUPS2;

    const tx2 = dummy2Instance.getDummy();
    await expect(tx2).to.emit(dummy2Instance, "Dummy").withArgs(true);
  });
});
