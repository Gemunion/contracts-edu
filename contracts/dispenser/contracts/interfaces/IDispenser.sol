// SPDX-License-Identifier: UNLICENSED

/**
 *Submitted for verification at BscScan.com on 2020-09-14
 */

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface IDispenser {
  function disperseEther(address[] calldata recipients, uint256[] calldata amounts) external payable;

  function disperseERC20(IERC20 token, address[] calldata recipients, uint256[] calldata amounts) external;

  function disperseERC721(IERC721 token, address[] calldata recipients, uint256[] calldata tokenIds) external;

  function disperseERC1155(
    IERC1155 token,
    address[] calldata recipients,
    uint256[] calldata tokenIds,
    uint256[] calldata amounts
  ) external;
}
