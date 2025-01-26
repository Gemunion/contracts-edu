import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

import { shouldBehaveLikeOwnable } from "@ethberry/contracts-access";
import { amount, span } from "@ethberry/contracts-constants";

import { deployERC20, deployVesting } from "./shared/fixture";

describe("CliffVesting", function () {
  const factory = () => deployVesting(this.title);

  shouldBehaveLikeOwnable(factory);

  it("should release ETH", async function () {
    const [owner] = await ethers.getSigners();
    const vestingInstance = await factory();

    const expectedAmounts = [0, 0, 0, 0, amount * 100n, 0];
    for (const expectedAmount of expectedAmounts) {
      const releaseable = await vestingInstance["releaseable()"]();

      expect(releaseable).to.be.equal(expectedAmount);

      const tx = await vestingInstance["release()"]();
      await expect(tx).changeEtherBalances([vestingInstance, owner], [releaseable * -1n, releaseable]);

      const current = await time.latest();
      await time.increaseTo(current + span);
    }
  });

  it("should release ERC20", async function () {
    const [owner] = await ethers.getSigners();
    const vestingInstance = await factory();
    const erc20Instance = await deployERC20(vestingInstance);

    const expectedAmounts = [0n, 0n, 0n, 0n, amount * 100n, 0n];

    for (const expectedAmount of expectedAmounts) {
      const releaseable = await vestingInstance["releaseable(address)"](await erc20Instance.getAddress());
      expect(releaseable).to.be.equal(expectedAmount);

      const tx = await vestingInstance["release(address)"](await erc20Instance.getAddress());
      await expect(tx).changeTokenBalances(
        erc20Instance,
        [await vestingInstance.getAddress(), owner.address],
        [releaseable * -1n, releaseable],
      );

      const current = await time.latest();
      await time.increaseTo(current + span);
    }
  });
});
