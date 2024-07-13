// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.20;

import {  SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {  VestingWallet } from "@openzeppelin/contracts/finance/VestingWallet.sol";
import {  SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {  IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {  ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import {  CoinWallet, NativeWallet } from "@gemunion/contracts-mocks/contracts/Wallet.sol";

/**
 * @title Daily Vesting
 * @dev Basic preset of Vesting contract that includes the following extensions:
 *      - Ownable (OpenZeppelin)
 *      - VestingWallet (OpenZeppelin)
 *      - TopUp (Gemunion)
 *      This contract abstracts all common functions and is used as an foundation for other vesting contracts
 */
contract DailyVesting is VestingWallet, CoinWallet {
	using SafeCast for uint256;
	using SafeERC20 for IERC20;

	uint64 public constant _dayInSeconds = 86400; // The number of seconds in a day
  uint16 private immutable _cliffInDays; // The number of days before the cliff period ends
  uint16 private immutable _dailyRelease; // The amount of tokens that can be released daily

	constructor(
    address beneficiary,
		uint64 startTimestamp,
		uint16 cliffInDays,
		uint16 dailyRelease
	) VestingWallet(beneficiary, startTimestamp, (10000000 * _dayInSeconds) / dailyRelease) {
		_cliffInDays = cliffInDays;
		_dailyRelease = dailyRelease;
	}

	/**
	 * @dev Computes the vesting schedule based on the total allocation and the timestamp.
   * @param totalAllocation The total allocation of tokens for vesting
   * @param timestamp The timestamp for which the vesting schedule is computed
   * @return The vesting schedule for the given total allocation and timestamp
   */
	function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view override returns (uint256) {
    uint256 _start = start() + _cliffInDays * _dayInSeconds;
    uint256 period = timestamp > _start ? (timestamp - _start) / _dayInSeconds : 0;

		if (timestamp < _start) {
			return 0;
		} else if (timestamp > _start + duration()) {
			return totalAllocation;
		} else {
      return (totalAllocation * period * _dailyRelease) / 10000000;
		}
	}

	/**
	 * @dev Restrict the contract to receive Ether (receive via topUp function only).
   */
	receive() external payable override(VestingWallet, NativeWallet) {
		revert();
	}

	/**
	 * @dev See {IERC165-supportsInterface}.
   */
	function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
		return super.supportsInterface(interfaceId);
	}

	/**
   * @dev Allows to top-up the contract with tokens (NATIVE and ERC20 only).
   * @param token contract address
   * @param amount amount in wei
   */
	function topUp(address token, uint256 amount) external payable virtual {
		SafeERC20.safeTransferFrom(IERC20(token), _msgSender(), address(this), amount);
	}
}
