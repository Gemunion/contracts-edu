// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+opensource@gmail.com
// Website: https://ethberry.io/

pragma solidity ^0.8.20;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

import { IERC721Mintable } from "../interfaces/IERC721Mintable.sol";

contract EIP712ERC721 is EIP712, Pausable, AccessControl {
  using Address for address;

  mapping(bytes32 => bool) private _expired;

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 private immutable PERMIT_SIGNATURE =
    keccak256("EIP712(bytes32 nonce,address account,address token,uint256 tokenId)");

  constructor(string memory name) EIP712(name, "1.0.0") {
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _grantRole(MINTER_ROLE, _msgSender());
    _grantRole(PAUSER_ROLE, _msgSender());
  }

  function redeem(
    bytes32 nonce,
    address account,
    address token,
    uint256 tokenId,
    address signer,
    bytes calldata signature
  ) external {
    require(hasRole(MINTER_ROLE, signer), "EIP712ERC721: Wrong signer");

    require(_verify(signer, _hash(nonce, account, token, tokenId), signature), "EIP712ERC721: Invalid signature");

    require(!_expired[nonce], "EIP712ERC721: Expired signature");
    _expired[nonce] = true;

    IERC721Mintable(token).mint(account, tokenId);
  }

  function _hash(bytes32 nonce, address account, address token, uint256 tokenId) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(PERMIT_SIGNATURE, nonce, account, token, tokenId)));
  }

  function _verify(address signer, bytes32 digest, bytes memory signature) internal view returns (bool) {
    return SignatureChecker.isValidSignatureNow(signer, digest, signature);
  }

  function pause() public virtual onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() public virtual onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  receive() external payable {
    revert();
  }
}
