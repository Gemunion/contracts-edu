import { expect } from "chai";
import { ethers, web3 } from "hardhat";
import { time } from "@openzeppelin/test-helpers";

import { shouldBehaveLikeOwnable } from "@gemunion/contracts-mocha";
import { amount, span } from "@gemunion/contracts-constants";

import { deployERC20, deployVesting } from "./shared/fixture";

describe("LinearVesting", function () {
  const factory = () => deployVesting(this.title);

  shouldBehaveLikeOwnable(factory);

  it("should release ETH", async function () {
    const [owner] = await ethers.getSigners();
    const vestingInstance = await factory();

    const expectedAmounts = [0n, amount * 25n, amount * 25n, amount * 25n, amount * 25n, 0n];

    for (const expectedAmount of expectedAmounts) {
      const releaseable = await vestingInstance["releaseable()"]();
      expect(releaseable).to.be.equal(expectedAmount);

      const tx = await vestingInstance["release()"]();
      await expect(tx).changeEtherBalances([vestingInstance, owner], [releaseable * -1n, releaseable]);

      const current = await time.latest();
      await time.increaseTo(current.add(web3.utils.toBN(span)));
    }
  });

  it("should release ERC20", async function () {
    const [owner] = await ethers.getSigners();
    const vestingInstance = await factory();
    const erc20Instance = await deployERC20(vestingInstance);
    const expectedAmounts = [0n, amount * 25n, amount * 25n, amount * 25n, amount * 25n, 0n];

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
      await time.increaseTo(current.add(web3.utils.toBN(span)));
    }
  });
});
