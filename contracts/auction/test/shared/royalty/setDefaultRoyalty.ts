import { expect } from "chai";
import { ethers } from "hardhat";

import { InterfaceId, DEFAULT_ADMIN_ROLE } from "@gemunion/contracts-constants";

export function shouldSetDefaultRoyalty() {
  describe("setDefaultRoyalty", function () {
    it("should set token royalty", async function () {
      const royalty = 5000;

      const tx = this.contractInstance.setDefaultRoyalty(this.receiver.address, royalty);
      await expect(tx).to.emit(this.contractInstance, "DefaultRoyaltyInfo").withArgs(this.receiver.address, royalty);
    });

    it("should fail: royalty fee will exceed salePrice", async function () {
      const royalty = 11000;

      const tx = this.contractInstance.setDefaultRoyalty(this.receiver.address, royalty * royalty);
      await expect(tx).to.be.revertedWith("ERC2981: royalty fee will exceed salePrice");
    });

    it("should fail: invalid parameters", async function () {
      const royalty = 5000;

      const tx = this.contractInstance.setDefaultRoyalty(ethers.constants.AddressZero, royalty);
      await expect(tx).to.be.revertedWith("ERC2981: invalid receiver");
    });

    it("should fail: account is missing role", async function () {
      const royalty = 5000;

      const supportsAccessControl = await this.contractInstance.supportsInterface(InterfaceId.IAccessControl);

      const tx = this.contractInstance.connect(this.receiver).setDefaultRoyalty(this.receiver.address, royalty);
      await expect(tx).to.be.revertedWith(
        supportsAccessControl
          ? `AccessControl: account ${this.receiver.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
          : "Ownable: caller is not the owner",
      );
    });
  });
}
