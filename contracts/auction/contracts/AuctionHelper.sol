// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+opensource@gmail.com
// Website: https://ethberry.io/

pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC721Holder } from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

abstract contract AuctionHelper is Ownable, ERC721Holder {
  address _collection;
  uint256 _tokenId;
  uint256 _startPrice;
  uint256 _bidStep;
  uint256 _buyoutPrice;
  address _highestBidder;
  uint256 _startTimestamp;
  uint256 _finishTimestamp;
  bool _canceled;
  mapping(address => uint256) public _fundsByBidder;

  event AuctionBid(address bidder, uint256 amount);
  event AuctionCanceled();

  modifier onlyNotOwner() {
    require(owner() != _msgSender(), "Ownable: caller is the owner");
    _;
  }

  modifier onlyAfterStart() {
    require(_startTimestamp < block.timestamp, "Auction: auction is not yet started");
    _;
  }

  modifier onlyBeforeEnd() {
    require(_finishTimestamp > block.timestamp, "Auction: auction is already finished");
    _;
  }

  modifier onlyNotCanceled() {
    require(!_canceled, "Auction: auction is canceled");
    _;
  }

  modifier onlyEndedOrCanceled() {
    require(_finishTimestamp < block.timestamp || _canceled, "Auction: is still running");
    _;
  }
}
