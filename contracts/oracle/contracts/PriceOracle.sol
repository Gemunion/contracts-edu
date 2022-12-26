// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceOracle is Ownable {
  uint256 public _price = 0.0000000000001 ether;

  event PriceChanged(uint256 price);

  function updatePrice(uint256 price) public onlyOwner {
    require(price > 0, "PriceOracle: price should be greater than zero");
    _price = price;
    emit PriceChanged(price);
  }
}
