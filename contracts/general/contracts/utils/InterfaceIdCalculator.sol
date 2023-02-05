// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/access/IAccessControlEnumerable.sol";

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/interfaces/IERC2309.sol";

contract InterfaceIdCalculator {
  constructor() {
    console.log("IERC20");
    console.logBytes4(type(IERC20).interfaceId);
    console.logBytes4(type(IERC20Metadata).interfaceId);

    console.log("IERC165");
    console.logBytes4(type(IERC165).interfaceId);

    console.log("IERC721");
    console.logBytes4(type(IERC721).interfaceId);
    console.logBytes4(type(IERC721Enumerable).interfaceId);
    console.logBytes4(type(IERC721Metadata).interfaceId);
    console.logBytes4(type(IERC721Receiver).interfaceId);

    console.log("IERC1155");
    console.logBytes4(type(IERC1155).interfaceId);
    console.logBytes4(type(IERC1155MetadataURI).interfaceId);
    console.logBytes4(type(IERC1155Receiver).interfaceId);

    console.log("IERCXXX");
    console.logBytes4(type(IERC2981).interfaceId);
    console.logBytes4(type(IERC2309).interfaceId); // has no methods so returns 0x00000000

    console.log("IAccessControl");
    console.logBytes4(type(IAccessControl).interfaceId);
    console.logBytes4(type(IAccessControlEnumerable).interfaceId);
  }
}
