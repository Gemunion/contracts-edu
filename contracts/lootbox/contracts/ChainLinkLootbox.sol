// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.20;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

import {ERC721ABEC} from "@gemunion/contracts-erc721e/contracts/preset/ERC721ABEC.sol";

import {IERC721ChainLink} from "./interfaces/IERC721ChainLink.sol";

contract ChainLinkLootboxMock is ERC721ABEC, Pausable {
  using Address for address;

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  IERC721ChainLink _factory;

  constructor(string memory name, string memory symbol) ERC721ABEC(name, symbol, 1000) {
    _grantRole(PAUSER_ROLE, _msgSender());
  }

  receive() external payable {
    revert();
  }

  function setFactory(address factory) external onlyRole(DEFAULT_ADMIN_ROLE) {
    require(factory.code.length != 0, "LootBox: the factory must be a deployed contract");
    _factory = IERC721ChainLink(factory);
  }

  function unpack(uint256 _tokenId) public whenNotPaused {
    require(_isAuthorized(_ownerOf(_tokenId), _msgSender(), _tokenId), "LootBox: unpack caller is not owner nor approved");
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
