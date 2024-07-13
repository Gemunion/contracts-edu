// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.20;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";

interface IAuctionETH {
  function makeBid(uint256 auctionId) external payable;
}

contract AuctionPaymentReverter {
  using Address for address;

  IAuctionETH private _auction;

  constructor(address auction) {
    require(auction.code.length != 0);
    _auction = IAuctionETH(auction);
  }

  function makeBid(uint256 auctionId) public payable {
    _auction.makeBid{ value: msg.value }(auctionId);
  }

  receive() external payable {
    revert();
  }
}
