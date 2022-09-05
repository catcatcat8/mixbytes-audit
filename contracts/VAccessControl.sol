// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./AccessControlledRoles.sol";

contract VAccessControl is AccessControl, AccessControlledRoles {
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(VETO_MINT, msg.sender);
    }
}
