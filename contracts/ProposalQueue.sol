// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "contracts/Uint256Helpers.sol";
import "contracts/Errors.sol";
import "contracts/Proposal.sol";

contract ProposalQueue {
    using Uint256Helpers for uint256;
    using ProposalLibrary for Proposal;

    // There are no more than N=3 current proposals, new proposals cannot be added until
    // old ones will be “accepted”, “declined” or “discarded” by TTL
    uint8 public constant MAX_ACTIVE_PROPOSALS = 10;

    Proposal[MAX_ACTIVE_PROPOSALS] public proposals;

    function countYeas(uint256 hash) external view returns (uint32) {
        (bool found, uint8 index) = find(hash);

        if (!found) return 0;

        return proposals[index].yeas;
    }

    /**
    Find index of a proposal by hash that could be in any state: active, expired or finished
     */
    function find(uint256 hash) public view returns (bool, uint8) {
        for (uint8 i; i < MAX_ACTIVE_PROPOSALS; i++) { // @audit low: gas optimisation i++ -> ++i
            if (proposals[i].hash == hash) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    function findInactive() internal view returns (bool, uint8) {
        for (uint8 i = 0; i < MAX_ACTIVE_PROPOSALS; i++) { // @audit low: gas optimisation i++ -> ++i
            if (!proposals[i].isActive()) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    /**
    Append a new proposal to the queue or replace an existing inactive proposal by the new one
     */
    function enqueue(Proposal memory proposal) internal {
        (bool found, uint8 index) = findInactive();
        require(found, Errors.ERROR_QUEUE_IS_FULL);
        
        proposals[index] = proposal;
    }
}
