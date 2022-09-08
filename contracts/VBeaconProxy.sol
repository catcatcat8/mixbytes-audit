// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";

import "./VotingDAOV2.sol";
import "./AccessControlled.sol";

contract VBeaconProxy is BeaconProxy, AccessControlled {
    constructor(
        address beacon,
        address miniMeToken,
        address vetoNFT,
        address acl
    ) BeaconProxy(beacon, abi.encodeWithSelector(VotingDAOV2.initialize.selector, miniMeToken, vetoNFT, acl)) {}

    function __fallback() external virtual {
        msg.sender.delegatecall("TODO: implement an emergency method to temporarily pause the contract in the future..."); // @remind WTF?? check this
    }
}
