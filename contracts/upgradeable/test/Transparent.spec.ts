import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Upgradeable", function () {
  it("should redeploy (transparent)", async function () {
    const dummy1 = await ethers.getContractFactory("Transparent1");
    const dummy2 = await ethers.getContractFactory("Transparent2");

    const dummy1Instance = await upgrades.deployProxy(dummy1, { kind: "transparent" });
    await dummy1Instance.waitForDeployment();

    const tx1 = dummy1Instance.getDummy();
    await expect(tx1).to.emit(dummy1Instance, "Dummy").withArgs(false);

    const dummy2Instance = await upgrades.upgradeProxy(await dummy1Instance.getAddress(), dummy2, {
      kind: "transparent",
    });
    await dummy2Instance.waitForDeployment();

    const tx2 = dummy2Instance.getDummy();
    await expect(tx2).to.emit(dummy2Instance, "Dummy").withArgs(true);
  });
});
