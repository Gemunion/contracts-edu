import { DEFAULT_ADMIN_ROLE, InterfaceId, MINTER_ROLE } from "@ethberry/contracts-constants";
import { shouldBehaveLikeAccessControl } from "@ethberry/contracts-access";
import { deployContract, shouldSupportsInterface } from "@ethberry/contracts-utils";
import { shouldBehaveLikeERC721 } from "@ethberry/contracts-erc721e";

import { deployERC721 } from "../../src/fixtures";

describe("ERC721OpenSeaTest", function () {
  const factory = () => deployERC721(this.title);

  shouldBehaveLikeAccessControl(factory)(DEFAULT_ADMIN_ROLE, MINTER_ROLE);

  shouldBehaveLikeERC721(async () => {
    const instance = await factory();
    const proxyRegistryInstance = await deployContract("ProxyRegistry");
    await instance.setProxyRegistry(proxyRegistryInstance);
    return instance;
  });

  shouldSupportsInterface(factory)([
    InterfaceId.IERC165,
    InterfaceId.IAccessControl,
    InterfaceId.IERC721,
    InterfaceId.IERC721Metadata,
    InterfaceId.IRoyalty,
  ]);
});
