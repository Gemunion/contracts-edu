// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+opensource@gmail.com
// Website: https://ethberry.io/

pragma solidity ^0.8.20;

import { ERC721ABERS } from "@ethberry/contracts-erc721e/contracts/preset/ERC721ABERS.sol";

import { ERC721OpenSea } from "../extensions/ERC721OpenSea.sol";

contract ERC721OpenSeaTest is ERC721OpenSea {
  constructor(
    string memory name,
    string memory symbol,
    uint96 royaltyNumerator
  ) ERC721ABERS(name, symbol, royaltyNumerator) {}
}
