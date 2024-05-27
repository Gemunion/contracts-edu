// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

import { DEFAULT_ADMIN_ROLE } from "@gemunion/contracts-utils/contracts/roles.sol";

import { ERC20PolygonChild } from "../ERC20/ERC20PolygonChild.sol";

contract ERC20PolygonChildTest is ERC20, AccessControl, ERC20PolygonChild {
  constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }
}
