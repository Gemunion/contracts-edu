// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+opensource@gmail.com
// Website: https://ethberry.io/

pragma solidity ^0.8.0;

import { console } from "hardhat/console.sol";

contract StringHashCalculator {
  constructor() {
    console.logBytes32(keccak256("TEST"));
    console.logBytes32(keccak256(bytes("TEST")));
  }
}
