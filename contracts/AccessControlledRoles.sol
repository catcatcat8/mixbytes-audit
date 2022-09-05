// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessControlledRoles {
    bytes32 constant ADMIN = 0x00;
    bytes32 constant VETO_MINT = keccak256("VETO_MINT");
}