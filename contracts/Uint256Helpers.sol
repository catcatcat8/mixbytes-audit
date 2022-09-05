// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Errors.sol";

library Uint256Helpers {
    uint256 private constant MAX_UINT32 = uint64(2 ** 32 - 1);

    function toUint32(uint256 a) internal pure returns (uint32) {
        require(a <= MAX_UINT32, Errors.UINT32_NUMBER_TOO_BIG);
        return uint32(a);
    }
}