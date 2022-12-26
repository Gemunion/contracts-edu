// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/security/Pausable.sol";

import "@gemunion/contracts-erc721/contracts/preset/ERC721ABC.sol";

import "../extensions/ERC721Dropbox.sol";

contract ERC721DropboxTest is ERC721Dropbox, ERC721ABC, Pausable {
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  constructor(string memory name, string memory symbol, uint256 cap) ERC721ABC(name, symbol, cap) ERC721Dropbox(name) {
    _setupRole(PAUSER_ROLE, _msgSender());
  }

  function redeem(address account, uint256 tokenId, address signer, bytes calldata signature) public virtual {
    _checkRole(MINTER_ROLE, signer);
    _redeem(account, tokenId, signer, signature);
  }

  function _safeMint(address account, uint256 tokenId) internal virtual override(ERC721, ERC721Dropbox) {
    super._safeMint(account, tokenId);
  }

  function pause() public virtual onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() public virtual onlyRole(PAUSER_ROLE) {
    _unpause();
  }
}
