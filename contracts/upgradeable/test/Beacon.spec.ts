import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Upgradeable", function () {
  it("should redeploy (beacon)", async function () {
    const dummy1 = await ethers.getContractFactory("Beacon1");
    const dummy2 = await ethers.getContractFactory("Beacon2");

    const dummyBeacon = await upgrades.deployBeacon(dummy1);
    await dummyBeacon.waitForDeployment();

    const dummy1Instance = await upgrades.deployBeaconProxy(dummyBeacon, dummy1);
    await dummy1Instance.waitForDeployment();

    const tx1 = dummy1Instance.getDummy();
    await expect(tx1).to.emit(dummy1Instance, "Dummy").withArgs(false);

    await upgrades.upgradeBeacon(dummyBeacon, dummy2);
    // eslint-disable-next-line
    const dummy2Instance = await ethers.getContractAt("Beacon1", await dummy1Instance.getAddress());
    await dummy2Instance.waitForDeployment();

    const tx2 = dummy2Instance.getDummy();
    await expect(tx2).to.emit(dummy2Instance, "Dummy").withArgs(true);
  });
});
