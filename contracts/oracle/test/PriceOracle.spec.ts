import { expect } from "chai";
import { ethers } from "hardhat";

import { shouldBehaveLikeOwnable } from "@ethberry/contracts-access";
import { deployContract } from "@ethberry/contracts-utils";

describe("PriceOracle", function () {
  const factory = (): Promise<any> => deployContract(this.title);

  shouldBehaveLikeOwnable(factory);

  describe("updatePrice", function () {
    const price = 10 ** 10;

    it("should update price", async function () {
      const contractInstance = await factory();

      const tx = contractInstance.updatePrice(price);
      await expect(tx).to.emit(contractInstance, "PriceChanged").withArgs(price);
    });

    it("should fail: not an owner", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      const tx = contractInstance.connect(receiver).updatePrice(price);
      await expect(tx)
        .to.be.revertedWithCustomError(contractInstance, "OwnableUnauthorizedAccount")
        .withArgs(receiver.address);
    });
  });
});
