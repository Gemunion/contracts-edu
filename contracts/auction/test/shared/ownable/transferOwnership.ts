import { expect } from "chai";
import { ethers } from "ethers";

export function shouldTransferOwnership() {
  describe("transferOwnership", function () {
    it("Should transfer ownership", async function () {
      const tx = this.contractInstance.transferOwnership(this.receiver.address);
      await expect(tx)
        .to.emit(this.contractInstance, "OwnershipTransferred")
        .withArgs(this.owner.address, this.receiver.address);
    });

    it("Should fail: not an owner", async function () {
      const tx = this.contractInstance.connect(this.receiver).transferOwnership(this.receiver.address);
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail: transfer to zero addr", async function () {
      const tx = this.contractInstance.transferOwnership(ethers.constants.AddressZero);
      await expect(tx).to.be.revertedWith("Ownable: new owner is the zero address");
    });
  });
}
