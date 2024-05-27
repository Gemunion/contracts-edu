// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+permission@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.2;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

import { DEPOSITOR_ROLE } from "@gemunion/contracts-utils/contracts/roles.sol";

abstract contract ERC20PolygonChild is ERC20, AccessControl {
  constructor() {
    _grantRole(DEPOSITOR_ROLE, _msgSender());
  }

  /**
   * @notice called when token is deposited on root chain
   * @dev Should be callable only by ChildChainManager
   * Should handle deposit by minting the required amount for user
   * Make sure minting is done only by this function
   * @param to user address for whom deposit is being done
   * @param depositData abi encoded amount
   */
  function deposit(address to, bytes calldata depositData) external onlyRole(DEPOSITOR_ROLE) {
    uint256 amount = abi.decode(depositData, (uint256));
    _mint(to, amount);
  }

  /**
   * @notice called when user wants to withdraw tokens back to root chain
   * @dev Should burn user's tokens. This transaction will be verified when exiting on root chain
   * @param amount amount of tokens to withdraw
   */
  function withdraw(uint256 amount) external {
    _burn(_msgSender(), amount);
  }

  /**
   * @notice Example function to handle minting tokens on matic chain
   * @dev Minting can be done as per requirement,
   * This implementation allows only admin to mint tokens but it can be changed as per requirement
   * @param to user for whom tokens are being minted
   * @param amount amount of token to mint
   */
  function mint(address to, uint256 amount) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
    _mint(to, amount);
  }
}
