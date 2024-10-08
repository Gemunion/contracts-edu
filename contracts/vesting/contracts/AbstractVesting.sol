// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+opensource@gmail.com
// Website: https://ethberry.io/

pragma solidity ^0.8.20;

import { VestingWallet } from "@openzeppelin/contracts/finance/VestingWallet.sol";
import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import { Multicall } from "@openzeppelin/contracts/utils/Multicall.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import { ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract AbstractVesting is ERC165, VestingWallet, Multicall {
  using SafeCast for uint256;

  constructor(
    address beneficiaryAddress,
    uint64 startTimestamp,
    uint64 durationSeconds
  ) VestingWallet(address(1), startTimestamp, durationSeconds) {
    _transferOwnership(beneficiaryAddress);
  }

  // Vesting beneficiary
  function beneficiary() public view virtual returns (address) {
    return owner();
  }

  function releaseable() public view virtual returns (uint256) {
    return vestedAmount(block.timestamp.toUint64()) - released();
  }

  function releaseable(address token) public view virtual returns (uint256) {
    return vestedAmount(token, block.timestamp.toUint64()) - released(token);
  }

  // Allow delegation of votes
  function delegate(IVotes token, address delegatee) public virtual onlyOwner {
    token.delegate(delegatee);
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
