// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.20;

import {ChainLinkHardhat} from "@gemunion/contracts-chain-link/contracts/extensions/ChainLinkHardhat.sol";
import {ERC721ABEC} from "@gemunion/contracts-erc721e/contracts/preset/ERC721ABEC.sol";
import {MINTER_ROLE} from "@gemunion/contracts-utils/contracts/roles.sol";

import {IERC721ChainLink} from "./interfaces/IERC721ChainLink.sol";

contract ChainLinkTokenMock is ChainLinkHardhat, IERC721ChainLink, ERC721ABEC {
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
  ) ERC721ABEC(name, symbol, 1000) ChainLinkHardhat() {}

  function mintRandom(address to) external override onlyRole(MINTER_ROLE) {
    _queue[getRandomNumber()] = to;
  }

  event MintRandom(address owner, bytes32 requestId);

  function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
    _rarity[_nextTokenId] = (randomness % 100) + 1;
    emit MintRandom(_queue[requestId], requestId);
    mint(_queue[requestId]);
    delete _queue[requestId];
  }

  function mint(address to) public override onlyRole(MINTER_ROLE) {
    _safeMint(to, _nextTokenId++);
  }

  receive() external payable {
    revert();
  }
}
