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
import "@openzeppelin/contracts/access/extensions/IAccessControlEnumerable.sol";
import "@openzeppelin/contracts/access/extensions/IAccessControlDefaultAdminRules.sol";

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/interfaces/IERC2309.sol";
import "@openzeppelin/contracts/interfaces/IERC5267.sol";
import "@openzeppelin/contracts/interfaces/IERC5805.sol";
import "@openzeppelin/contracts/interfaces/IERC6372.sol";

import "@openzeppelin/contracts/governance/IGovernor.sol";

import "@gemunion/contracts-erc1363/contracts/interfaces/IERC1363.sol";
import "@gemunion/contracts-erc1363/contracts/interfaces/IERC1363Receiver.sol";

import "@gemunion/contracts-erc721/contracts/interfaces/IERC4906.sol";
import "@gemunion/contracts-erc721/contracts/interfaces/IERC4907.sol";

contract InterfaceIdCalculator {
  constructor() {
    console.log("IERC20");
    console.logBytes4(type(IERC20).interfaceId);
    console.logBytes4(type(IERC20Metadata).interfaceId);

    console.log("IERC1363");
    console.logBytes4(type(IERC1363).interfaceId);
    console.logBytes4(type(IERC1363Receiver).interfaceId);

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
    console.logBytes4(type(IERC2981).interfaceId); // erc721 royalty
    console.logBytes4(type(IERC2309).interfaceId); // erc721 consecutive, has no methods so returns 0x00000000
    console.logBytes4(type(IERC4906).interfaceId); // erc721 OpenSea metadata
    console.logBytes4(type(IERC4907).interfaceId); // erc721 rent
    console.logBytes4(type(IERC5267).interfaceId); // eip 712 domain
    console.logBytes4(type(IERC5805).interfaceId); // governance, has no methods so returns 0x00000000
    console.logBytes4(type(IERC6372).interfaceId); // governance

    console.log("IAccessControl");
    console.logBytes4(type(IAccessControl).interfaceId);
    console.logBytes4(type(IAccessControlEnumerable).interfaceId);
    console.logBytes4(type(IAccessControlDefaultAdminRules).interfaceId);

    console.log("IGovernance");
    console.logBytes4(type(IGovernor).interfaceId);
    console.logBytes4(type(IVotes).interfaceId);
  }
}
