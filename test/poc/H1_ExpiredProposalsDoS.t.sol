// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Errors} from "contracts/Errors.sol";

import {DAOTestBase} from "./Base.t.sol";

/// @title H-1. Expired proposals can lead to a protocol DoS
/// @notice `isActive` does not check expiry. A proposal that expires before it is accepted or
/// rejected keeps its queue slot forever, and nothing can be done with it.
contract H1_ExpiredProposalsDoS is DAOTestBase {
    function test_H1_ExpiredProposalsDoS() public {
        // A holder with 1% of the voting power fills the queue. Nobody votes on these proposals.
        for (uint256 i; i < MAX_ACTIVE_PROPOSALS; ++i) {
            _createProposal(attacker, i);
        }

        vm.warp(block.timestamp + PROPOSAL_TTL + 1);

        // Expired proposals cannot be voted on, vetoed or executed...
        for (uint256 i; i < MAX_ACTIVE_PROPOSALS; ++i) {
            vm.prank(alice);
            vm.expectRevert(bytes(Errors.ERROR_EXPIRED));
            dao.vote(i, false);

            vm.prank(vetoHolder);
            vm.expectRevert(bytes(Errors.ERROR_EXPIRED));
            dao.veto(i);

            vm.expectRevert(bytes(Errors.ERROR_EXPIRED));
            dao.execute(i);
        }

        // ...and they are never removed, so even the majority holder cannot create a new proposal.
        _expectQueueIsFull(alice, 100);

        vm.warp(block.timestamp + 365 days);
        _expectQueueIsFull(alice, 101);
    }
}
