import { expect } from "chai";

import { DEFAULT_ADMIN_ROLE } from "@gemunion/contracts-constants";

export function shouldRevokeRole() {
  describe("shouldRevokeRole", function () {
    it("Should revoke role (has no role)", async function () {
      const tx1 = await this.contractInstance.revokeRole(DEFAULT_ADMIN_ROLE, this.receiver.address);
      await expect(tx1).to.not.emit(this.contractInstance, "RoleRevoked");
    });

    it("Should revoke role", async function () {
      const tx1 = await this.contractInstance.grantRole(DEFAULT_ADMIN_ROLE, this.receiver.address);
      await expect(tx1)
        .to.emit(this.contractInstance, "RoleGranted")
        .withArgs(DEFAULT_ADMIN_ROLE, this.receiver.address, this.owner.address);

      const tx2 = await this.contractInstance.revokeRole(DEFAULT_ADMIN_ROLE, this.receiver.address);
      await expect(tx2)
        .to.emit(this.contractInstance, "RoleRevoked")
        .withArgs(DEFAULT_ADMIN_ROLE, this.receiver.address, this.owner.address);
    });

    it("should fail: account is missing role", async function () {
      const tx1 = this.contractInstance.connect(this.receiver).revokeRole(DEFAULT_ADMIN_ROLE, this.receiver.address);
      await expect(tx1).to.be.revertedWith(
        `AccessControl: account ${this.receiver.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
      );
    });
  });
}
