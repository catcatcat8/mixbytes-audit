// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMiniMeToken {
    function balanceOf(address owner) external view returns (uint256 balance);

    function balanceOfAt(address owner, uint256 blockNumber) external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function decimals() external view returns (uint8);
}
