// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.20;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC677Receiver {
  function onTokenTransfer(address _sender, uint256 _value, bytes calldata _data) external;
}

interface IERC677 is IERC20 {
  function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool success);

  event Transfer(address indexed from, address indexed to, uint256 value, bytes data);
}

abstract contract ERC677Token is IERC677 {
  using Address for address;

  /**
   * @dev transfer token to a contract address with additional data if the recipient is a contact.
   * @param _to The address to transfer to.
   * @param _value The amount to be transferred.
   * @param _data The extra data to be passed to the receiving contract.
   */
  function transferAndCall(address _to, uint256 _value, bytes calldata _data) external returns (bool success) {
    this.transfer(_to, _value);

    emit Transfer(msg.sender, _to, _value, _data);

    if (_to.code.length != 0) {
      contractFallback(_to, _value, _data);
    }

    return true;
  }

  function contractFallback(address _to, uint256 _value, bytes calldata _data) private {
    IERC677Receiver receiver = IERC677Receiver(_to);
    receiver.onTokenTransfer(msg.sender, _value, _data);
  }
}
