// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import "../interfaces/IDispenser.sol";

contract ReentrancyDispenser is ERC165, ERC721Holder, ERC1155Holder {
  IDispenser Disperse;
  address Token;

  address[] receivers;
  uint256[] amounts;
  uint256[] tokenIds;
  event Reentered(bool success);

  constructor(IDispenser _disperse, address token) {
    Disperse = _disperse;
    Token = token;
    receivers.push(address(this));
    tokenIds.push(2);
    amounts.push(1000);
  }

  function onERC721Received(
    address operator,
    address from,
    uint256 tokenId,
    bytes calldata data
  ) public override returns (bytes4) {
    (bool success, ) = address(Disperse).call(
      abi.encodeWithSelector(IDispenser(Disperse).disperseERC721.selector, Token, receivers, tokenIds)
    );
    emit Reentered(success);
    return super.onERC721Received(operator, from, tokenId, data);
  }

  function onERC1155Received(
    address operator,
    address from,
    uint256 id,
    uint256 value,
    bytes calldata data
  ) public virtual override returns (bytes4) {
    (bool success, ) = address(Disperse).call(
      abi.encodeWithSelector(IDispenser(Disperse).disperseERC1155.selector, Token, receivers, tokenIds, amounts)
    );
    emit Reentered(success);
    return super.onERC1155Received(operator, from, id, value, data);
  }

  receive() external payable {
    (bool success, ) = address(Disperse).call{ value: msg.value }(
      abi.encodeWithSelector(IDispenser(Disperse).disperseEther.selector, receivers, amounts)
    );
    emit Reentered(success);
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, ERC1155Receiver) returns (bool) {
    return
    interfaceId == type(IERC721Receiver).interfaceId ||
    interfaceId == type(IERC1155Receiver).interfaceId ||
    super.supportsInterface(interfaceId);
  }
}
