// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+opensource@gmail.com
// Website: https://ethberry.io/

pragma solidity ^0.8.20;

import { OwnableDelegateProxy } from "./OwnableDelegateProxy.sol";

contract ProxyRegistry {
  mapping(address => OwnableDelegateProxy) public proxies;
}
