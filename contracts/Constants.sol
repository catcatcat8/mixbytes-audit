// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Constants {
    uint32 constant FIXED_SUPPLY = 100e6; // totalSupply
    uint8 constant DECIMALS = 6;

    // Proposal becomes completed (“accepted” or “declined”) if > 50%
    // of votes for the same decision (“for” or “against”) is gathered
    uint32 constant MIN_QUORUM = FIXED_SUPPLY / 2 + 1;
}
