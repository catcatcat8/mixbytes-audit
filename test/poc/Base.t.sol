// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test} from "forge-std/Test.sol";

import {VotingDAOV2} from "contracts/VotingDAOV2.sol";
import {VBeacon} from "contracts/VBeacon.sol";
import {VBeaconProxy} from "contracts/VBeaconProxy.sol";
import {VetoNFT} from "contracts/VetoNFT.sol";
import {VAccessControl} from "contracts/VAccessControl.sol";
import {Errors} from "contracts/Errors.sol";

import {MiniMeTokenMock} from "../mocks/MiniMeTokenMock.sol";

/// @notice Deploys the DAO the same way it is meant to run in production:
/// VotingDAOV2 implementation behind VBeacon, used through VBeaconProxy.
abstract contract DAOTestBase is Test {
    uint256 internal constant SUPPLY = 100e6; // Constants.FIXED_SUPPLY
    uint8 internal constant DECIMALS = 6; // Constants.DECIMALS
    uint256 internal constant PROPOSAL_TTL = 3 days; // ProposalLibrary.PROPOSAL_TTL
    uint256 internal constant MAX_ACTIVE_PROPOSALS = 10; // ProposalQueue.MAX_ACTIVE_PROPOSALS

    VotingDAOV2 internal dao;
    VBeacon internal beacon;
    MiniMeTokenMock internal votingToken;
    VetoNFT internal vetoNFT;
    VAccessControl internal acl;

    /// @dev Holds 60% of the voting power, enough to accept or reject any proposal alone.
    address internal alice = makeAddr("alice");
    /// @dev Holds 39% of the voting power.
    address internal bob = makeAddr("bob");
    /// @dev Holds 1% of the voting power: enough to create proposals, not enough to pass them.
    address internal attacker = makeAddr("attacker");
    /// @dev Owns one VetoNFT and no voting tokens.
    address internal vetoHolder = makeAddr("vetoHolder");

    function setUp() public virtual {
        // initialize() requires the proxy deployer to hold the whole supply.
        votingToken = new MiniMeTokenMock(SUPPLY, DECIMALS);
        acl = new VAccessControl();
        vetoNFT = new VetoNFT(acl);
        beacon = new VBeacon(address(new VotingDAOV2()));
        VBeaconProxy proxy = new VBeaconProxy(address(beacon), address(votingToken), address(vetoNFT), address(acl));
        dao = VotingDAOV2(payable(address(proxy)));

        votingToken.transfer(alice, 60e6);
        votingToken.transfer(bob, 39e6);
        votingToken.transfer(attacker, 1e6);
        vetoNFT.mint(vetoHolder);

        // Voting power is read at the proposal's creation block, so move past the distribution block.
        vm.roll(block.number + 1);
    }

    function _createProposal(address creator, uint256 hash) internal {
        vm.prank(creator);
        dao.createProposal(hash);
    }

    function _accept(uint256 hash) internal {
        vm.prank(alice);
        dao.vote(hash, true);
    }

    function _reject(uint256 hash) internal {
        vm.prank(alice);
        dao.vote(hash, false);
    }

    function _veto(uint256 hash) internal {
        vm.prank(vetoHolder);
        dao.veto(hash);
    }

    function _expectQueueIsFull(address creator, uint256 hash) internal {
        vm.prank(creator);
        vm.expectRevert(bytes(Errors.ERROR_QUEUE_IS_FULL));
        dao.createProposal(hash);
    }
}
