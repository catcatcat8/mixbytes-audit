// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Errors} from "contracts/Errors.sol";

import {DAOTestBase} from "./Base.t.sol";

/// @title H-2. Vetoed proposals can lead to a protocol DoS
/// @notice `isActive` does not check `vetoed`. A proposal vetoed before it is rejected keeps
/// its queue slot forever, and nothing can be done with it.
contract H2_VetoedProposalsDoS is DAOTestBase {
    function test_H2_VetoedProposalsDoS() public {
        // Ten ordinary proposals are vetoed before anyone votes against them.
        for (uint256 i; i < MAX_ACTIVE_PROPOSALS; ++i) {
            _createProposal(bob, i);
            _veto(i);
        }

        // Vetoed proposals cannot be voted on or executed...
        for (uint256 i; i < MAX_ACTIVE_PROPOSALS; ++i) {
            vm.prank(alice);
            vm.expectRevert(bytes(Errors.ERROR_VETOED));
            dao.vote(i, false);

            vm.expectRevert(bytes(Errors.ERROR_VETOED));
            dao.execute(i);
        }

        // ...and they are never removed: the queue is full while none of them has expired yet...
        _expectQueueIsFull(alice, 100);

        // ...and it stays full after they expire.
        vm.warp(block.timestamp + 365 days);
        _expectQueueIsFull(alice, 101);
    }
}
