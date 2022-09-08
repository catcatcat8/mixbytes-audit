# VotingDAOV2 Audit Report

## Project overview
The project consists of several smart contracts for the implementation of the DeFi DAO (Decentralized Autonomous Organization) with a use of Beacon Proxy pattern (upgradeable contracts). 

The DAO is governed entirely by its individual members who collectively submit proposals (empty or ERC-20/ETH transfer). Each voting token holder (MiniMeToken) has the right to create proposals and vote for them. The number of votes is determined by the balance of the voting token holder at the time the proposal is created. Everyone can execute an accepted proposal.

In addition, the project has the ERC-721 token contract and the access control contract for delegating the right to create these tokens. ERC-721 token holders are capable to veto proposals.

The project has libraries for safe uint conversion, outputting errors and describing properties of the voting token.

## Finding Severity breakdown

All vulnerabilities discovered during the audit are classified based on their potential severity and have the following classification:

Severity | Description
--- | ---
Critical | Bugs leading to assets theft, fund access locking, or any other loss funds to be transferred to any party. 
High     | Bugs that can trigger a contract failure. Further recovery is possible only by manual modification of the contract state or replacement.
Medium   | Bugs that can break the intended contract logic or expose it to DoS attacks, but do not cause direct loss funds.
Low | Other non-essential issues and recommendations reported to/ acknowledged by the team.

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

#### 2. ERC-20 poisoned token
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
