import { expect } from "chai";
import { ethers } from "hardhat";

import { amount, DEFAULT_ADMIN_ROLE, DEPOSITOR_ROLE } from "@gemunion/contracts-constants";
import { shouldBehaveLikeAccessControl } from "@gemunion/contracts-access";
import { shouldBehaveLikeERC20 } from "@gemunion/contracts-erc20";

import { deployErc20 } from "../../src/fixtures";

describe("ERC20PolygonChildTest", function () {
  const factory = () => deployErc20(this.title);

  shouldBehaveLikeAccessControl(factory)(DEFAULT_ADMIN_ROLE, DEPOSITOR_ROLE);

  shouldBehaveLikeERC20(factory, { minterRole: DEFAULT_ADMIN_ROLE });

  describe("deposit", function () {
    it("should mint tokens", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mint(owner, amount);
      const tx = contractInstance.deposit(
        receiver,
        "0x0000000000000000000000000000000000000000000000000000000000000064",
      );
      await expect(tx).to.not.be.reverted;
    });

    it("should fail: AccessControlUnauthorizedAccount", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const tx = contractInstance
        .connect(receiver)
        .deposit(receiver, "0x0000000000000000000000000000000000000000000000000000000000000064");
      await expect(tx)
        .to.be.revertedWithCustomError(contractInstance, "AccessControlUnauthorizedAccount")
        .withArgs(receiver.address, DEPOSITOR_ROLE);
    });
  });
});
