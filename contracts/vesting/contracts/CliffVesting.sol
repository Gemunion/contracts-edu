// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./AbstractVesting.sol";

contract CliffVesting is AbstractVesting {
  constructor(
    address account,
    uint64 startTimestamp,
    uint64 duration
  ) AbstractVesting(account, startTimestamp, duration) {}

  function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view override returns (uint256) {
    if (timestamp > start() + duration()) {
      return totalAllocation;
    } else {
      return 0;
    }
  }
}
