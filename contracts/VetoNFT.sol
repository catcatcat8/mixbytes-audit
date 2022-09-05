// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./AccessControlled.sol";

contract VetoNFT is ERC721, AccessControlled {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(AccessControl acl) ERC721("VetoToken", "VETO") {
        accessControl = acl;
    }

    function mint(address user) role(VETO_MINT) external returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(user, newItemId);

        return newItemId;
    }
}
