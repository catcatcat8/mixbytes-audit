// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import 'contracts/Uint256Helpers.sol';
import 'contracts/Constants.sol';

struct Payment {
    address token;
    address destination;
    uint256 amount;
    bool sendETH;
}

struct Proposal {
    uint256 hash;
    uint32 createdTimestamp; // until 2105 year
    uint32 createdBlockNumber;
    Payment payment;
    // init zeros:
    uint32 updatedBlockNumber; // @ low: never used, only useless updating
    uint32 yeas;
    uint32 nays;
    bool isExecuted;
    bool vetoed;
}

library ProposalLibrary {
    using Uint256Helpers for uint256;

    // time-to-live(TTL) of proposal is 3 days
    // after that time proposal becomes “discarded” if not enough votes are gathered
    uint32 constant PROPOSAL_TTL = 3 days;

    function emptyPayment() internal pure returns (Payment memory) {
        return Payment({token: address(0), destination: address(0), amount: 0, sendETH: false});
    }

    function isExpired(Proposal storage proposal) internal view returns (bool) {
        return proposal.createdTimestamp + PROPOSAL_TTL < block.timestamp;
    }

    function isQuorumReached(Proposal storage proposal) internal view returns (bool) {
        return isAccepted(proposal) || isRejected(proposal);
    }

    function isRejected(Proposal storage proposal) internal view returns (bool) {
        return proposal.nays >= Constants.MIN_QUORUM;
    }

    function isAccepted(Proposal storage proposal) internal view returns (bool) {
        return proposal.yeas >= Constants.MIN_QUORUM;
    }

    function isActive(Proposal storage proposal) internal view returns (bool) {
        // @audit-done HIGH: add !proposal.isExpired (expired proposals will never be deleted) + !proposal.isVetoed (vetoed proposals will never be deleted)
        return
            proposal.createdBlockNumber > 0 &&
            !isRejected(proposal) &&
            !proposal.isExecuted &&
            !isAccepted(proposal) &&
            !proposal.vetoed;
    }

    function vote(
        Proposal storage proposal,
        bool support,
        uint32 votingPower
    ) internal {
        if (support) {
            proposal.yeas += votingPower;
        } else {
            proposal.nays += votingPower;
        }
        proposal.updatedBlockNumber = block.number.toUint32();
    }

    function isSupported(Proposal storage proposal) internal view returns (bool) {
        return proposal.yeas > proposal.nays;
    }
}
