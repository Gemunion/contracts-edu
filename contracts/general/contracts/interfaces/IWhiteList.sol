// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.20;

interface IWhiteList {
  error WhiteListError(address account);

  event Whitelisted(address indexed account);

  event UnWhitelisted(address indexed account);

  function whitelist(address account) external;

  function unWhitelist(address account) external;

  function isWhitelisted(address account) external view returns (bool);
}
