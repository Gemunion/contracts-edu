import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers, upgrades } from "hardhat";

import { Beacon1, Beacon2 } from "../typechain-types";

use(solidity);

describe("Upgradeable", function () {
  it("should redeploy (beacon)", async function () {
    const dummy1 = await ethers.getContractFactory("Beacon1");
    const dummy2 = await ethers.getContractFactory("Beacon2");

    const dummyBeacon = (await upgrades.deployBeacon(dummy1)) as Beacon1;
    await dummyBeacon.deployed();

    const dummy1Instance = await upgrades.deployBeaconProxy(dummyBeacon, dummy1);
    await dummy1Instance.deployed();

    const tx1 = dummy1Instance.getDummy();
    await expect(tx1).to.emit(dummy1Instance, "Dummy").withArgs(false);

    await upgrades.upgradeBeacon(dummyBeacon, dummy2);
    // eslint-disable-next-line
    const dummy2Instance = dummy2.attach(dummy1Instance.address) as Beacon2;

    const tx2 = dummy2Instance.getDummy();
    await expect(tx2).to.emit(dummy2Instance, "Dummy").withArgs(true);
  });
});
