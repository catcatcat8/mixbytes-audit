# VotingDAOV2 Audit Report

## Project overview
The project consists of several smart contracts for the implementation of the DeFi DAO (Decentralized Autonomous Organization) with a use of Beacon Proxy pattern (upgradeable contracts). 

The DAO is governed entirely by its individual members who collectively submit proposals (empty or ERC-20/ETH transfer). Each voting token holder (MiniMeToken) has the right to create proposals and vote for them. The number of votes is determined by the balance of the voting token holder at the time the proposal is created. Everyone can execute an accepted proposal.

In addition, the project has the ERC-721 token contract and the access control contract for delegating the right to create these tokens. ERC-721 token holders are capable to veto proposals.

The project has libraries for safe uint conversion, outputting errors and describing properties of the voting token.

***

## Finding Severity breakdown

All vulnerabilities discovered during the audit are classified based on their potential severity and have the following classification:

Severity | Description
--- | ---
Critical | Bugs leading to assets theft, fund access locking, or any other loss funds to be transferred to any party. 
High     | Bugs that can trigger a contract failure. Further recovery is possible only by manual modification of the contract state or replacement.
Medium   | Bugs that can break the intended contract logic or expose it to DoS attacks, but do not cause direct loss funds.
Low | Other non-essential issues and recommendations reported to/ acknowledged by the team.

***

## Findings

### Critical

#### 1. Reentrancy for withdrawing ETH

##### Description
* Contract: `VotingDAOV2.sol`
* Lines: 170-174, 243
```solidity
if (proposal.payment.amount > 0 && proposal.isAccepted()) {
    _withdraw(proposal.payment);
}

proposal.isExecuted = true;
```
```solidity
destination.call{value: amount}("");
```
The attacker is able to specify a non-contract address as the destination address when creating a proposal for withdrawing ETH. Howewer, the attacker is able to deploy contract with the exact address through CREATE/CREATE2 pattern. If such a proposal is accepted and the attacker's contract has a fallback payable function which calls `execute` function again, the attacker will be able to steal all ETH from the contract.
##### Recomendation
It's reccommended to place the `proposal.isExecuted` setting before the `if` statement. Also, if `call` is not needed in that case, it can be changed to `transfer`.

***

#### 2. ERC-20 poisoned/not IERC-20 compatible payment token
* Contract: `VotingDAOV2.sol`
* Lines: 170-174, 259
```solidity
if (proposal.payment.amount > 0 && proposal.isAccepted()) {
    _withdraw(proposal.payment);
}

proposal.isExecuted = true;
```
```solidity
token.transfer(destination, amount);
```
The attacker is able to specify a poisoned token address when creating a proposal for withdrawing ERC-20. If the proposal is accepted, then the behaviour of this token during `transfer` operation may be unexpected. For example. the function can always `revert`, which can lead to a situation that this proposal will be impossible to delete from the current contract implementation, the function can call `execute` function again (reentrancy) that can lead to the theft all tokens from the contract, the function can transfer nothing which will lead to the fact that users will be deceived etc.

##### Recomendation
It is recommended to add a list of whitelisted ERC-20 tokens that are allowed to be added to the proposal. For protection against reentrancy for withdrawing ERC-20, as in the previous case, the `proposal.isExecuted` should be set before the `if` statement.

***

### High

#### 1. Expired proposals can lead to a protocol DoS

##### Description
Files: 
* `ProposalQueue.sol` (line 51)
* `ProposalLibrary.sol` (line 54-56)
```solidity
function isActive(Proposal storage proposal) internal view returns (bool) {
    return proposal.createdBlockNumber > 0 && !isRejected(proposal) && !proposal.isExecuted;
}
```
Created proposals that were only rejected or executed are removed from the proposal queue at the time a new proposal is created. Expired proposals cannot be voted for or executed. This leads to the fact that if the proposal is expired and not rejected or accepted it will never be removed from the proposal queue. With 10 such expired proposals in the proposal queue (not rejected and not executed) none of the functions of the `VotingDAOV2` contract will be able to be called (vote, veto or execute is not allowed to be called if the proposal is expired and it is not possible to create new proposals).

##### Recomendation
It is recommended to add additional condition `!isExpired(proposal)` to the `return` statement of the `isActive` function of the `ProposalLibrary` to check if the proposal has expired. It allows to remove expired proposals from the proposal queue when a new proposal is created.

***

#### 2. Vetoed proposals can lead to a protocol DoS

##### Description
Files:
* `VotingDAOV2.sol` (line 104)
* `ProposalQueue.sol` (line 51)
* `ProposalLibrary.sol` (line 54-56)

Vetoed proposals cannott be voted for or executed. Howewer, vetoed proposals can be deleted from the proposal queue when new proposal is created only if the proposal was vetoed after it had been rejected. In other cases. vetoed proposal will be considered as active in `isActive` function of the `ProposalLibrary`. With 10 such vetoed proposals in the proposal queue (not rejected by users before vetoed) none of the functions of the `VotingDAOV2` contract will be able to be called (vote, veto or execute is not allowed to be called if the proposal is vetoed and it is not possible to create new proposals).

##### Recomendation
It is recommended to add additional condition `!proposal.vetoed` to the `return` statement of the `isActive` function of the `ProposalLibrary` to check if the proposal has been vetoed. It allows to remove vetoed proposals from the proposal queue when a new proposal is created.

***

### Medium

Not found

***

### Low

#### 1. It is possible to block ETH/tokens on the balance of the contract

##### Description
There is `receive() external payable` function in `VotingDAOV2.sol`. But there is no functionality for a privileged person to return ETH/tokens not through creating a proposal in case of an emergency.

##### Recomendation
It is recommended to add functionality for the possibility of withdrawing the remaining ETH/tokens from the balance of the contract.

#### 2. Missed events

##### Description
There are missed events for `veto`, `vote` functions in `VotingDAOV2.sol`.

##### Recomendation
It is recommended to emit the events for these functions.


#### 3. Unnecessary code

##### Description
* Variable `uint32 updatedBlockNumber` in `Proposal.sol`, line 20 - only updating when `vote` function is called from `VotingDAOV2`, never used.
* Function `countYeas` in `ProposalQueue.sol`, line 18 - never used.
* Require `proposal.isQuorumReached()` in `VestingDAOV2.sol`, line 167 - unnecessary check, it follows from the next line require: `proposal.isAccepted()`.
* Condition `proposal.isAccepted()` in `VestingDAOV2.sol`, line 170 - always true, it follows from the require `proposal.isAccepted()`,
* Requires `destination != address(0)` and `address(destination) != address(0)` in `VestingDAOV2.sol`, lines 235, 252 - unnecessary checks, it follows from the require `payment.destination != address(0)` in `_createProposal` function.

##### Recomendation
It is recommended to delete unnecessary code.