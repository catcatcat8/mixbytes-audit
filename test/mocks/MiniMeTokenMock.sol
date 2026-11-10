// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IMiniMeToken} from "contracts/IMiniMeToken.sol";

/// @notice Minimal stand-in for MiniMeToken: balances are checkpointed per block,
/// so `balanceOfAt` returns historical balances the same way MiniMe does.
/// Only the parts that VotingDAOV2 uses are implemented.
contract MiniMeTokenMock is IMiniMeToken {
    struct Checkpoint {
        uint128 fromBlock;
        uint128 value;
    }

    uint256 public immutable totalSupply;
    uint8 public immutable decimals;

    mapping(address => Checkpoint[]) private _balances;

    constructor(uint256 supply, uint8 decimals_) {
        totalSupply = supply;
        decimals = decimals_;
        _update(msg.sender, supply);
    }

    function balanceOf(address owner) public view returns (uint256) {
        return balanceOfAt(owner, block.number);
    }

    function balanceOfAt(address owner, uint256 blockNumber) public view returns (uint256) {
        Checkpoint[] storage checkpoints = _balances[owner];
        for (uint256 i = checkpoints.length; i > 0; --i) {
            if (checkpoints[i - 1].fromBlock <= blockNumber) return checkpoints[i - 1].value;
        }
        return 0;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        uint256 fromBalance = balanceOf(msg.sender);
        require(fromBalance >= amount, "INSUFFICIENT_BALANCE");
        _update(msg.sender, fromBalance - amount);
        _update(to, balanceOf(to) + amount);
        return true;
    }

    function _update(address owner, uint256 value) private {
        Checkpoint[] storage checkpoints = _balances[owner];
        uint256 length = checkpoints.length;
        if (length > 0 && checkpoints[length - 1].fromBlock == block.number) {
            checkpoints[length - 1].value = uint128(value);
        } else {
            checkpoints.push(Checkpoint(uint128(block.number), uint128(value)));
        }
    }
}
