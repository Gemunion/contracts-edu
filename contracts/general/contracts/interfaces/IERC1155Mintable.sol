// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

interface IERC1155Mintable {
  function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) external;

  function mint(address to, uint256 id, uint256 amount, bytes memory data) external;

  function burn(address from, uint256 id, uint256 amount) external;

  function burnBatch(address from, uint256[] memory ids, uint256[] memory amounts) external;
}
