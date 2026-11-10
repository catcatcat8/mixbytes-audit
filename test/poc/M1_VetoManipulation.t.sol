// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Errors} from "contracts/Errors.sol";

import {DAOTestBase} from "./Base.t.sol";

/// @title M-1. Veto manipulations
/// @notice Any holder of a single VetoNFT can veto any proposal, including one that the
/// majority has already accepted but nobody has executed yet.
contract M1_VetoManipulation is DAOTestBase {
    uint256 internal constant HASH = 1;

    function test_M1_VetoAcceptedProposal() public {
        address recipient = makeAddr("recipient");
        vm.deal(address(dao), 1 ether);

        vm.prank(bob);
        dao.withdrawETH(HASH, recipient, 1 ether);
        _accept(HASH);

        // A holder with no voting power overrides the 60% majority.
        assertEq(votingToken.balanceOf(vetoHolder), 0);
        assertEq(vetoNFT.balanceOf(vetoHolder), 1);
        _veto(HASH);

        vm.expectRevert(bytes(Errors.ERROR_VETOED));
        dao.execute(HASH);
        assertEq(recipient.balance, 0);
    }
}
