import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Upgradeable", function () {
  it("should redeploy (uups)", async function () {
    const dummy1 = await ethers.getContractFactory("UUPS1");
    const dummy2 = await ethers.getContractFactory("UUPS2");

    const dummy1Instance = await upgrades.deployProxy(dummy1, { kind: "uups" });
    await dummy1Instance.waitForDeployment();

    const tx1 = dummy1Instance.getDummy();
    await expect(tx1).to.emit(dummy1Instance, "Dummy").withArgs(false);

    // https://forum.openzeppelin.com/t/cannot-transfer-ownership-of-uupsupgradeable-contract-to-gnosis-safe/7832/6?u=trejgun
    const dummy2Instance = await upgrades.upgradeProxy(await dummy1Instance.getAddress(), dummy2, {
      kind: "uups",
    });
    await dummy2Instance.waitForDeployment();

    const tx2 = dummy2Instance.getDummy();
    await expect(tx2).to.emit(dummy2Instance, "Dummy").withArgs(true);
  });
});
