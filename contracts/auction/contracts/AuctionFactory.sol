// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./AuctionERC721ETHTemplate.sol";

contract AuctionFactory is AccessControl, Pausable {
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  address[] private _auctions;

  event AuctionStart(
    address auction,
    address owner,
    address collection,
    uint256 tokenId,
    uint256 buyoutPrice,
    uint256 startPrice,
    uint256 bidStep,
    uint256 startTimestamp,
    uint256 finishTimestamp
  );

  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _setupRole(PAUSER_ROLE, _msgSender());
  }

  function createAuction(
    address collection,
    uint256 tokenId,
    uint256 startPrice,
    uint256 bidStep,
    uint256 buyoutPrice,
    uint256 startTimestamp,
    uint256 finishTimestamp
  ) public whenNotPaused returns (address addr) {
    AuctionERC721ETHTemplate auction = new AuctionERC721ETHTemplate(
      _msgSender(),
      collection,
      tokenId,
      startPrice,
      bidStep,
      buyoutPrice,
      startTimestamp,
      finishTimestamp
    );

    addr = address(auction);
    _auctions.push(addr);

    emit AuctionStart(
      addr,
      _msgSender(),
      collection,
      tokenId,
      startPrice,
      bidStep,
      buyoutPrice,
      startTimestamp,
      finishTimestamp
    );

    IERC721(collection).safeTransferFrom(_msgSender(), addr, tokenId);
  }

  function allAuctions() public view returns (address[] memory) {
    return _auctions;
  }

  function pause() public onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() public onlyRole(PAUSER_ROLE) {
    _unpause();
  }
}
