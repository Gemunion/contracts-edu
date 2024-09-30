// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+opensource@gmail.com
// Website: https://ethberry.io/

pragma solidity ^0.8.0;

import { console } from "hardhat/console.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import { IERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import { IERC721Metadata } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import { IERC1155Receiver } from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import { IERC1155MetadataURI } from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IAccessControlEnumerable } from "@openzeppelin/contracts/access/extensions/IAccessControlEnumerable.sol";
import { IAccessControlDefaultAdminRules } from "@openzeppelin/contracts/access/extensions/IAccessControlDefaultAdminRules.sol";

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import { IERC2981 } from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import { IERC2309 } from "@openzeppelin/contracts/interfaces/IERC2309.sol";
import { IERC5267 } from "@openzeppelin/contracts/interfaces/IERC5267.sol";
import { IERC5805 } from "@openzeppelin/contracts/interfaces/IERC5805.sol";
import { IERC6372 } from "@openzeppelin/contracts/interfaces/IERC6372.sol";
import { IERC20Errors, IERC721Errors, IERC1155Errors } from  "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

import { IGovernor } from "@openzeppelin/contracts/governance/IGovernor.sol";
import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";

import { IERC1363 } from "@ethberry/contracts-erc1363/contracts/interfaces/IERC1363.sol";
import { IERC1363Receiver } from "@ethberry/contracts-erc1363/contracts/interfaces/IERC1363Receiver.sol";

import { IERC4906 } from "@ethberry/contracts-erc721/contracts/interfaces/IERC4906.sol";
import { IERC4907 } from "@ethberry/contracts-erc721/contracts/interfaces/IERC4907.sol";

import { IBlackList } from "../interfaces/IBlackList.sol";
import { IWhiteList } from "../interfaces/IWhiteList.sol";

contract InterfaceIdCalculator {
  constructor() {
    console.log("IERC20");
    console.logBytes4(type(IERC20).interfaceId);
    console.logBytes4(type(IERC20Metadata).interfaceId);
    console.logBytes4(type(IERC20Errors).interfaceId); // 0x00000000

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
    console.logBytes4(type(IERC721Errors).interfaceId); // 0x00000000

    console.log("IERC1155");
    console.logBytes4(type(IERC1155).interfaceId);
    console.logBytes4(type(IERC1155MetadataURI).interfaceId);
    console.logBytes4(type(IERC1155Receiver).interfaceId);
    console.logBytes4(type(IERC1155Errors).interfaceId); // 0x00000000

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

    console.log("IAccessList");
    console.logBytes4(type(IBlackList).interfaceId);
    console.logBytes4(type(IWhiteList).interfaceId);

    console.log("IGovernance");
    console.logBytes4(type(IGovernor).interfaceId);
    console.logBytes4(type(IVotes).interfaceId);
  }
}
