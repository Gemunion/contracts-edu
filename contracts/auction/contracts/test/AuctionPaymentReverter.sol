// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Address.sol";

interface IAuctionETH {
  function makeBid(uint256 auctionId) external payable;
}

contract AuctionPaymentReverter {
  using Address for address;

  IAuctionETH private _auction;

  constructor(address auction) {
    require(auction.isContract());
    _auction = IAuctionETH(auction);
  }

  function makeBid(uint256 auctionId) public payable {
    _auction.makeBid{ value: msg.value }(auctionId);
  }

  receive() external payable {
    revert();
  }
}
