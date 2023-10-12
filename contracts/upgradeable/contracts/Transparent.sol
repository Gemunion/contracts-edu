// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Transparent1 is Initializable {
  event Dummy(bool dummy);

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize() public initializer {}

  function getDummy() public {
    emit Dummy(false);
  }
}

contract Transparent2 is Initializable {
  event Dummy(bool dummy);

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize() public initializer {}

  function getDummy() public {
    emit Dummy(true);
  }
}
