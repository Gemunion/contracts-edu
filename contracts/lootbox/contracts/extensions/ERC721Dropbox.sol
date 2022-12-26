// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

abstract contract ERC721Dropbox is EIP712 {
  event Redeem(address account, uint256 tokenId);

  constructor(string memory name) EIP712(name, "1.0.0") {}

  function _safeMint(address account, uint256 tokenId) internal virtual;

  function _redeem(address account, uint256 tokenId, address signer, bytes calldata signature) internal {
    require(_verify(signer, _hash(account, tokenId), signature), "ERC721Dropbox: Invalid signature");
    _safeMint(account, tokenId);
    emit Redeem(account, tokenId);
  }

  function _hash(address account, uint256 tokenId) internal view returns (bytes32) {
    return
      _hashTypedDataV4(keccak256(abi.encode(keccak256("EIP712(address account,uint256 tokenId)"), account, tokenId)));
  }

  function _verify(address signer, bytes32 digest, bytes memory signature) internal view returns (bool) {
    return SignatureChecker.isValidSignatureNow(signer, digest, signature);
  }
}
