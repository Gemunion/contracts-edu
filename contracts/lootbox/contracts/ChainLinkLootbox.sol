// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "@gemunion/contracts-erc721-enumerable/contracts/preset/ERC721ABCE.sol";

import "./interfaces/IERC721ChainLink.sol";

contract ChainLinkLootboxMock is ERC721ABCE, Pausable {
  using Address for address;

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  IERC721ChainLink _factory;

  constructor(string memory name, string memory symbol) ERC721ABCE(name, symbol, 1000) {
    _setupRole(PAUSER_ROLE, _msgSender());
  }

  receive() external payable {
    revert();
  }

  function setFactory(address factory) external onlyRole(DEFAULT_ADMIN_ROLE) {
    require(factory.isContract(), "LootBox: the factory must be a deployed contract");
    _factory = IERC721ChainLink(factory);
  }

  function unpack(uint256 _tokenId) public whenNotPaused {
    require(_isApprovedOrOwner(_msgSender(), _tokenId), "LootBox: unpack caller is not owner nor approved");
    _factory.mintRandom(_msgSender());
    _burn(_tokenId);
  }

  function pause() public virtual onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() public virtual onlyRole(PAUSER_ROLE) {
    _unpause();
  }
}
