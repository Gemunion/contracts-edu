// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+permission@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.2;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

import { PREDICATE_ROLE } from "@gemunion/contracts-utils/contracts/roles.sol";

abstract contract ERC20PolygonParent is ERC20, AccessControl {
  constructor() {
    _grantRole(PREDICATE_ROLE, _msgSender());
  }

  /**
   * @param to user for whom tokens are being minted
   * @param amount amount of token to mint
   */
  function mint(address to, uint256 amount) public virtual onlyRole(PREDICATE_ROLE) {
    _mint(to, amount);
  }
}
