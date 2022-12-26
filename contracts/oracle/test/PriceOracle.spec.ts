import { expect, use } from "chai";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";

import { shouldBehaveLikeOwnable } from "@gemunion/contracts-mocha";

import { deployPriceOracle } from "./shared/fixtures";

use(solidity);

describe("PriceOracle", function () {
  const factory = () => deployPriceOracle(this.title);

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
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
