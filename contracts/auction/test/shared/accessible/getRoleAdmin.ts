import { expect } from "chai";

import { DEFAULT_ADMIN_ROLE } from "@gemunion/contracts-constants";

export function shouldGetRoleAdmin(...roles: Array<string>) {
  describe("getRoleAdmin", function () {
    roles.forEach(role => {
      it(`Should get role admin for ${role}`, async function () {
        const roleAdmin = await this.contractInstance.getRoleAdmin(role);
        expect(roleAdmin).to.equal(DEFAULT_ADMIN_ROLE);
      });
    });
  });
}
