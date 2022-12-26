// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./AuctionHelper.sol";

contract AuctionERC721ETHTemplate is AuctionHelper {
  constructor(
    address owner,
    address collection,
    uint256 tokenId,
    uint256 startPrice,
    uint256 bidStep,
    uint256 buyoutPrice,
    uint256 startTimestamp,
    uint256 finishTimestamp
  ) {
    require(collection != address(0), "Auction: collection address cannot be zero");
    require(startTimestamp < finishTimestamp, "Auction: auction start time should be less than end time");

    // this is questionable
    require(startPrice > 0, "Auction: auction start price should be greater than zero");

    require(startPrice <= buyoutPrice, "Auction: auction start price should less than buyout price");
    require(block.timestamp < finishTimestamp, "Auction: auction should finished in future");

    _collection = collection;
    _tokenId = tokenId;
    _startPrice = startPrice;
    _bidStep = bidStep;
    _buyoutPrice = buyoutPrice;

    if (startTimestamp == 0) {
      _startTimestamp = block.timestamp;
    } else {
      _startTimestamp = startTimestamp;
    }

    _finishTimestamp = finishTimestamp;

    _transferOwnership(owner);
  }

  function getHighestBid() public view returns (uint256) {
    return _fundsByBidder[_highestBidder];
  }

  function makeBid() public payable onlyAfterStart onlyBeforeEnd onlyNotCanceled onlyNotOwner {
    require(msg.value > 0, "Auction: bid value is not increased");

    uint256 newBid = _fundsByBidder[_msgSender()] + msg.value;
    uint256 _highestBid = _fundsByBidder[_highestBidder];

    require(_startPrice <= newBid, "Auction: proposed bid can not be less than start price");
    require(_highestBid < newBid, "Auction: proposed bid must be bigger than current bid");

    if (_bidStep > 0) {
      require((newBid - _startPrice) % _bidStep == 0, "Auction: bid must be a multiple of the bid step");
    }

    _highestBidder = _msgSender();
    _fundsByBidder[_msgSender()] = newBid;

    emit AuctionBid(_msgSender(), newBid);
  }

  function cancelAuction() public onlyOwner onlyBeforeEnd onlyNotCanceled {
    _canceled = true;
    emit AuctionCanceled();
  }

  function withdrawAsset() public onlyEndedOrCanceled {
    address receiver = _highestBidder;

    if (_canceled || _highestBidder == address(0)) {
      receiver = owner();
    }

    IERC721(_collection).safeTransferFrom(address(this), receiver, _tokenId);
  }

  function withdrawMoney() public onlyEndedOrCanceled {
    address receiver = _msgSender();
    uint256 amount = _fundsByBidder[receiver];

    if (receiver == owner()) {
      if (!_canceled) {
        amount = _fundsByBidder[_highestBidder];
        _fundsByBidder[_highestBidder] = 0;
      } else {
        return;
      }
    } else if (receiver == _highestBidder) {
      if (!_canceled) {
        return;
      }
    }

    (bool success, ) = receiver.call{ value: amount }("");
    require(success, "Auction: transfer failed");
  }
}
