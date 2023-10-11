// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "../interfaces/IERC1155Mintable.sol";

contract EIP712ERC1155 is AccessControl, Pausable, EIP712 {
  using Address for address;

  mapping(bytes32 => bool) private _expired;

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 private immutable PERMIT_SIGNATURE =
    keccak256("EIP712(bytes32 nonce,address account,address token,uint256[] tokenIds,uint256[] amounts)");

  constructor(string memory name) EIP712(name, "1.0.0") {
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _grantRole(MINTER_ROLE, _msgSender());
    _grantRole(PAUSER_ROLE, _msgSender());
  }

  function redeem(
    bytes32 nonce,
    address account,
    address token,
    uint256[] memory tokenIds,
    uint256[] memory amounts,
    address signer,
    bytes calldata signature
  ) external {
    require(hasRole(MINTER_ROLE, signer), "EIP712ERC1155: Wrong signer");

    require(
      _verify(signer, _hash(nonce, account, token, tokenIds, amounts), signature),
      "EIP712ERC1155: Invalid signature"
    );

    require(!_expired[nonce], "EIP712ERC1155: Expired signature");
    _expired[nonce] = true;

    IERC1155Mintable(token).mintBatch(account, tokenIds, amounts, "0x");
  }

  function _hash(bytes32 nonce, address account, address token, uint256[] memory tokenIds, uint256[] memory amounts)
    internal
    view
    returns (bytes32)
  {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            PERMIT_SIGNATURE,
            nonce,
            account,
            token,
            keccak256(abi.encodePacked(tokenIds)),
            keccak256(abi.encodePacked(amounts))
          )
        )
      );
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
