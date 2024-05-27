// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.20;

import { ERC721, IERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {
  AccessControl,
  AccessControlEnumerable
} from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

import { ERC721ABERS } from "@gemunion/contracts-erc721e/contracts/preset/ERC721ABERS.sol";

import { ProxyRegistry } from "./utils/ProxyRegistry.sol";

abstract contract ERC721OpenSea is ERC721ABERS, AccessControlEnumerable {
  event PermanentURI(string _value, uint256 indexed _id);

  using Address for address;
  ProxyRegistry private _proxyRegistry;

  error ProxyRegistryAbsent();

  function setProxyRegistry(address proxyRegistry) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (address(this).code.length == 0) {
      revert ProxyRegistryAbsent();
    }
    _proxyRegistry = ProxyRegistry(proxyRegistry);
  }

  function owner() public view virtual returns (address) {
    return getRoleMember(DEFAULT_ADMIN_ROLE, 0);
  }

  /**
   * @dev Set a static URI for a token
   */
  function setTokenURI(uint256 tokenId, string memory tokenURI) public override onlyRole(DEFAULT_ADMIN_ROLE) {
    _setTokenURI(tokenId, tokenURI);
    emit PermanentURI(tokenURI, tokenId);
  }

  /**
   * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
   */
  function isApprovedForAll(
    address _owner,
    address operator
  ) public view virtual override(IERC721, ERC721) returns (bool) {
    // Whitelist OpenSea proxy contract for easy trading.
    if (address(_proxyRegistry.proxies(_owner)) == operator) {
      return true;
    }

    return super.isApprovedForAll(_owner, operator);
  }

  /**
   * @dev Overload {_grantRole} to track enumerable memberships
   */
  function _grantRole(
    bytes32 role,
    address account
  ) internal virtual override(AccessControl, AccessControlEnumerable) returns (bool) {
    return super._grantRole(role, account);
  }

  /**
   * @dev Overload {_revokeRole} to track enumerable memberships
   */
  function _revokeRole(
    bytes32 role,
    address account
  ) internal virtual override(AccessControl, AccessControlEnumerable) returns (bool) {
    return super._revokeRole(role, account);
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC721ABERS, AccessControlEnumerable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
