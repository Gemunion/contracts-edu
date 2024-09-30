// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+opensource@gmail.com
// Website: https://ethberry.io/

pragma solidity ^0.8.0;

import { console } from "hardhat/console.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

contract TokenIdCalculator {
  constructor() {
    console.log("TokenId", Strings.toHexString(100, 32));
    // 0x0000000000000000000000000000000000000000000000000000000000000064
  }
}
