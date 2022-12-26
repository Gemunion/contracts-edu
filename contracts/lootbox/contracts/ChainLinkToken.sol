// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";

import "@gemunion/contracts-chain-link/contracts/extensions/ERC721ChainLink.sol";
import "@gemunion/contracts-erc721-enumerable/contracts/preset/ERC721ABCE.sol";

contract ChainLinkTokenMock is ERC721ChainLink, IERC721ChainLink, ERC721ABCE {
  using Counters for Counters.Counter;

  // tokenId => rarity
  mapping(uint256 => uint256) private _rarity;
  // requestId => owner
  mapping(bytes32 => address) private _queue;

  constructor(
    string memory name,
    string memory symbol,
    address link,
    address vrf,
    bytes32 keyHash,
    uint256 fee
  ) ERC721ABCE(name, symbol, 1000) ERC721ChainLink(link, vrf, keyHash, fee) {}

  function mintRandom(address to) external override onlyRole(MINTER_ROLE) {
    _queue[getRandomNumber()] = to;
  }

  event MintRandom(address owner, bytes32 requestId);

  function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
    _rarity[_tokenIdTracker.current()] = (randomness % 100) + 1;
    emit MintRandom(_queue[requestId], requestId);
    mint(_queue[requestId]);
    delete _queue[requestId];
  }

  event RandomRequest(bytes32 requestId);

  function getRandomNumber() internal override returns (bytes32 requestId) {
    requestId = super.getRandomNumber();
    emit RandomRequest(requestId);
    return requestId;
  }

  function mint(address to) public override onlyRole(MINTER_ROLE) {
    _safeMint(to, _tokenIdTracker.current());
    _tokenIdTracker.increment();
  }

  receive() external payable {
    revert();
  }
}
