// SPDX-License-Identifier: UNLICENSED

/**
 *Submitted for verification at BscScan.com on 2020-09-14
 */

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "./interfaces/IDispenser.sol";

import "hardhat/console.sol";

/**
 * @title Disperse Contract
 * @dev A contract for dispersing ether, ERC20 tokens, ERC721 tokens, and ERC1155 tokens to multiple recipients.
 */
contract Dispenser is IDispenser, ERC165, Context, ReentrancyGuard {
  event TransferETH(address receiver, uint value);

  error NotEnoughBalance();

  /**
   * @dev Disperse Ether to multiple recipients.
   * @param recipients An array of recipient addresses.
   * @param amounts An array of corresponding amounts to send to each recipient.
   */
  function disperseEther(address[] calldata recipients, uint256[] calldata amounts) external payable {
    require(recipients.length == amounts.length, "Dispenser: Invalid input");
    uint remainingValue = msg.value;

    for (uint256 i = 0; i < recipients.length; ) {
      uint amount = amounts[i];
      if (remainingValue < amount) {
        revert NotEnoughBalance();
      }
      (bool success, ) = recipients[i].call{ value: amount }("");
      unchecked {
        // Gas Optimization: Using unchecked to save gas by avoiding overflow checks
        if (success) {
          // Should never underflow due to the check (remainingValue < amount)
          remainingValue -= amount;
          emit TransferETH(recipients[i], amount);
        }
        i++;
      }
    }
    if (remainingValue > 0) {
      (bool success, ) = payable(_msgSender()).call{ value: remainingValue }("");
      require(success);
    }
  }

  /**
   * @dev Disperse ERC20 tokens to multiple recipients.
   * @param token The address of the ERC20 token contract.
   * @param recipients An array of recipient addresses.
   * @param amounts An array of corresponding amounts to send to each recipient.
   */
  function disperseERC20(IERC20 token, address[] calldata recipients, uint256[] calldata amounts) external {
    require(recipients.length == amounts.length, "Dispenser: Invalid input");

    // Gas Optimization: Calculate totalAmount of all amounts
    // Transfer ERC20 to this contract and use transfer instead of transferFrom to save gas
    uint totalAmount;
    for (uint256 i = 0; i < recipients.length; ) {
      totalAmount += amounts[i];
      unchecked {
        // Gas Optimization: Using unchecked to save gas by avoiding overflow checks
        i++;
      }
    }
    token.transferFrom(_msgSender(), address(this), totalAmount);

    for (uint256 i = 0; i < recipients.length; ) {
      token.transfer(recipients[i], amounts[i]);
      unchecked {
        // Gas Optimization: Using unchecked to save gas by avoiding overflow checks
        i++;
      }
    }
  }

  /**
   * @dev Disperse ERC721 tokens to multiple recipients.
   * @param token The address of the ERC721 token contract.
   * @param recipients An array of recipient addresses.
   * @param tokenIds An array of corresponding token IDs to send to each recipient.
   */
  function disperseERC721(
    IERC721 token,
    address[] calldata recipients,
    uint256[] calldata tokenIds
  ) external nonReentrant {
    require(recipients.length == tokenIds.length, "Dispenser: Invalid input");

    for (uint256 i = 0; i < recipients.length; ) {
      // If fail, the whole transaction would not revert
      // try catch consume less gas than using call
      try token.safeTransferFrom(msg.sender, recipients[i], tokenIds[i]) {} catch {}
      unchecked {
        // Gas Optimization: Using unchecked to save gas by avoiding overflow checks
        i++;
      }
    }
  }

  /**
   * @dev Disperse ERC1155 tokens to multiple recipients.
   * @param token The address of the ERC1155 token contract.
   * @param recipients An array of recipient addresses.
   * @param tokenIds An array of corresponding token IDs to send to each recipient.
   * @param amounts An array of corresponding amounts to send to each recipient.
   */
  function disperseERC1155(
    IERC1155 token,
    address[] calldata recipients,
    uint256[] calldata tokenIds,
    uint256[] calldata amounts
  ) external nonReentrant {
    require(recipients.length == tokenIds.length && recipients.length == amounts.length, "Dispenser: Invalid input");

    for (uint256 i = 0; i < recipients.length; ) {
      // If fail, the whole transaction would not revert
      // try catch consume less gas than using call
      try token.safeTransferFrom(msg.sender, recipients[i], tokenIds[i], amounts[i], "0x") {} catch {}
      unchecked {
        // Gas Optimization: Using unchecked to save gas by avoiding overflow checks
        i++;
      }
    }
  }

  receive() external payable {
    revert();
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
    return interfaceId == type(IDispenser).interfaceId || super.supportsInterface(interfaceId);
  }
}
