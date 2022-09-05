// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./AccessControlledRoles.sol";

contract AccessControlled is AccessControlledRoles {
    AccessControl public accessControl;

    modifier role(bytes32 role_) {
        require(address(accessControl) != address(0), "NO_ACL");
        require(accessControl.hasRole(role_, msg.sender), "ACCESS_DENIED");
        _;
    }
}