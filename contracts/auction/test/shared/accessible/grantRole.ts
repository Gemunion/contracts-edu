import { expect } from "chai";

import { DEFAULT_ADMIN_ROLE } from "@gemunion/contracts-constants";

export function shouldGrantRole() {
  describe("grantRole", function () {
    it("Should grant role", async function () {
      const tx1 = await this.contractInstance.grantRole(DEFAULT_ADMIN_ROLE, this.receiver.address);
      await expect(tx1)
        .to.emit(this.contractInstance, "RoleGranted")
        .withArgs(DEFAULT_ADMIN_ROLE, this.receiver.address, this.owner.address);
    });

    it("should fail: account is missing role", async function () {
      const tx1 = this.contractInstance.connect(this.receiver).grantRole(DEFAULT_ADMIN_ROLE, this.receiver.address);
      await expect(tx1).to.be.revertedWith(
        `AccessControl: account ${this.receiver.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
      );
    });
  });
}
