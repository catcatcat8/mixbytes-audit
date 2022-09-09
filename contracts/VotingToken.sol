// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '../interfaces/IMiniMeToken.sol';
import './Constants.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract VotingToken is ERC20, Ownable {
    constructor(
        string memory _name,
        string memory _symbol,
        address _owner
    ) ERC20(_name, _symbol) {
        _mint(_owner, Constants.FIXED_SUPPLY);
        transferOwnership(_owner);
    }
    function decimals() public pure override returns (uint8) {
        return Constants.DECIMALS;
    }
    function balanceOfAt(address user, uint256 blockNumber) external view returns (uint256) {
        return balanceOf(user);
    }
}
