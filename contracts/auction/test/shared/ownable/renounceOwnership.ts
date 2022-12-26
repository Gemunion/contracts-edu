import { expect } from "chai";
import { ethers } from "ethers";

export function shouldRenounceOwnership() {
  describe("renounceOwnership", function () {
    it("Should renounce ownership", async function () {
      const tx = this.contractInstance.renounceOwnership();
      await expect(tx)
        .to.emit(this.contractInstance, "OwnershipTransferred")
        .withArgs(this.owner.address, ethers.constants.AddressZero);
    });

    it("Should fail: not an owner", async function () {
      const tx = this.contractInstance.connect(this.receiver).renounceOwnership();
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
}
