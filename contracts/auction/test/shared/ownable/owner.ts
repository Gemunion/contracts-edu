import { expect } from "chai";

export function shouldHaveOwner() {
  describe("owner", function () {
    it("Should set the right roles to deployer", async function () {
      const owner = await this.contractInstance.owner();
      expect(owner).to.equal(this.owner.address);
    });
  });
}
