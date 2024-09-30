// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+opensource@gmail.com
// Website: https://ethberry.io/

pragma solidity ^0.8.20;

interface IERC721Mintable {
  function mint(address to, uint256 tokenId) external;
}
