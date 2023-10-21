// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.20;

import {ERC721} from  "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {MINTER_ROLE} from "@gemunion/contracts-utils/contracts/roles.sol";
import {ERC721ABCRS} from "@gemunion/contracts-erc721/contracts/preset/ERC721ABCRS.sol";

import {ERC721Dropbox} from "../ERC721Dropbox.sol";

contract ERC721DropboxTest is ERC721ABCRS, ERC721Dropbox {
  constructor(
    string memory name,
    string memory symbol,
    uint256 cap,
    uint96 royaltyNumerator
  ) ERC721ABCRS(name, symbol, cap, royaltyNumerator) ERC721Dropbox(name) {}

  function redeem(
    bytes32 nonce,
    address account,
    uint256 tokenId,
    address signer,
    bytes calldata signature
  ) public virtual {
    _checkRole(MINTER_ROLE, signer);
    _redeem(nonce, account, tokenId, signer, signature);
  }

  function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721ABCRS) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function _update(
    address to,
    uint256 tokenId,
    address auth
  ) internal virtual override(ERC721, ERC721ABCRS)  returns (address) {
    return super._update(to, tokenId, auth);
  }

  function _increaseBalance(address account, uint128 amount) internal virtual override(ERC721, ERC721ABCRS) {
    super._increaseBalance(account, amount);
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721ABCRS) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
