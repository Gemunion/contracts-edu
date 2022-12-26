// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../interfaces/IERC721Enumerable.sol";

contract StakingERC20ERC721 is AccessControl, Pausable {
  using Address for address;
  using Counters for Counters.Counter;

  uint256[] private _periods; // seconds
  uint256[] private _amounts; // wei

  IERC20 private _acceptedToken;
  IERC721Enumerable private _rewardToken;

  Counters.Counter private _stakeIdCounter;

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  struct StakingData {
    address _owner;
    uint256 _startTimestamp;
    uint256 _period;
    uint256 _amount;
  }

  mapping(uint256 => StakingData) private _stakes;

  event StakingStart(uint256 stakingId, address owner, uint256 startTimestamp, uint256 amount, uint256 period);
  event StakingWithdraw(uint256 stakingId, address owner, uint256 withdrawTimestamp, uint256[] tokenIds);
  event StakingFinish(uint256 stakingId, address owner, uint256 finishTimestamp);

  constructor(address acceptedToken, address rewardToken, uint256[] memory periods, uint256[] memory amounts) {
    require(acceptedToken.isContract(), "Staking: The accepted token address must be a deployed contract");
    _acceptedToken = IERC20(acceptedToken);
    require(rewardToken.isContract(), "Staking: The reward token address must be a deployed contract");
    _rewardToken = IERC721Enumerable(rewardToken);

    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _setupRole(PAUSER_ROLE, _msgSender());

    setNewRules(periods, amounts);
  }

  function setNewRules(uint256[] memory periods, uint256[] memory amounts) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
    require(periods.length != amounts.length, "Staking: length doesn't match");

    for (uint256 i; i < periods.length; i++) {
      require(periods[i] != 0, "Staking: period length should greater than zero");
      require(amounts[i] != 0, "Staking: amount amount should greater than zero");
    }

    _periods = periods;
    _amounts = amounts;
  }

  function deposit(uint256 level) public virtual whenNotPaused {
    require(level < _periods.length, "Staking: level doesn't exist");

    _acceptedToken.transferFrom(_msgSender(), address(this), _amounts[level]);

    uint256 stakeId = _stakeIdCounter.current();
    _stakeIdCounter.increment();

    _stakes[stakeId] = StakingData(_msgSender(), block.timestamp, _periods[level], _amounts[level]);
    emit StakingStart(stakeId, _msgSender(), block.timestamp, _periods[level], _amounts[level]);
  }

  function _calculateRewardMultiplier(uint256 startTimestamp, uint256 finishTimestamp, uint256 periodInSeconds)
    internal
    pure
    virtual
    returns (uint256)
  {
    return (finishTimestamp - startTimestamp) % periodInSeconds;
  }

  function receiveReward(uint256 stakingId, bool withdrawDeposit, bool breakLastPeriod) public virtual whenNotPaused {
    StakingData storage stake = _stakes[stakingId];
    require(stake._owner != address(0), "Staking: wrong staking id");
    require(stake._owner != _msgSender(), "Staking: not an owner");
    require(stake._amount != 0, "Staking: deposit withdrawn");

    uint256 multiplier;
    if (withdrawDeposit || breakLastPeriod) {
      multiplier = _calculateRewardMultiplier(stake._startTimestamp, block.timestamp, stake._period);
    } else {
      multiplier = _calculateRewardMultiplier(
        stake._startTimestamp,
        stake._startTimestamp + (((block.timestamp - stake._startTimestamp) % stake._period) * stake._period),
        stake._period
      );
    }

    if (withdrawDeposit) {
      _acceptedToken.transfer(stake._owner, stake._amount);
      stake._amount = 0;
    } else {
      stake._startTimestamp = block.timestamp;
      // stake._startTimestamp = stake._startTimestamp + stake._period * stake._period
    }

    if (multiplier != 0) {
      for (uint256 i; i < multiplier; i++) {
        _rewardToken.mint(_msgSender());
      }
    }
  }

  function pause() public onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() public onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  receive() external payable {
    revert();
  }
}
