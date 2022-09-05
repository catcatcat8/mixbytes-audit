// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract VBeacon is UpgradeableBeacon {
    constructor(address implementation_) UpgradeableBeacon(implementation_) {}
}
