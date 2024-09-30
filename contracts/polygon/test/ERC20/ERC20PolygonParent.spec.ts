import { DEFAULT_ADMIN_ROLE, PREDICATE_ROLE } from "@ethberry/contracts-constants";
import { shouldBehaveLikeAccessControl } from "@ethberry/contracts-access";
import { shouldBehaveLikeERC20 } from "@ethberry/contracts-erc20";

import { deployErc20 } from "../../src/fixtures";

describe("ERC20PolygonParentTest", function () {
  const factory = () => deployErc20(this.title);

  shouldBehaveLikeAccessControl(factory)(DEFAULT_ADMIN_ROLE, PREDICATE_ROLE);

  shouldBehaveLikeERC20(factory, { minterRole: PREDICATE_ROLE });
});
