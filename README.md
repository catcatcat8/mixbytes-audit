# MixBytes Farm Audit Report

## Project overview
The project consists of several smart contracts for the implementation of a DeFi DAO (Decentralized Autonomous Organization) using the Beacon Proxy pattern (upgradeable contracts). 

The DAO is governed entirely by its individual members who collectively submit proposals (empty or ERC-20/ETH transfer). Each holder of a voting token (MiniMeToken) has the right to create proposals and vote for them. The number of votes is determined by the balance of the voting token holder at the time the proposal is created. Everyone can execute an accepted proposal.

In addition, the project has an ERC-721 token contract and an access control contract for delegating the right to create these tokens. ERC-721 token holders are capable to veto proposals.

The project has libraries for safe uint conversion, errors output and the description of a voting token properties.

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

## Summary of findings

Severity | # of Findings
--- | ---
CRITICAL| 2
HIGH    | 2
MEDIUM  | 1
LOW | 6

During the audit process, 2 CRITICAL, 2 HIGH, 1 MEDIUM and 6 LOW severity findings were spotted and acknowledged.

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
An attacker could specify a non-contract address as the destination address when creating a proposal for withdrawing ETH. Howewer, an attacker is able to deploy contract with the exact address using CREATE/CREATE2 pattern. If such a proposal is accepted and the attacker's contract has a fallback payable function which calls `execute` function again, the attacker will be able to steal all the ETH from the contract.
##### Recommendation
It's recommended to place the `proposal.isExecuted` setting before the `if` statement. Also, if `call` is not needed in this case, it can be changed to `transfer`.

***

#### 2. ERC-20 poisoned/not ERC-20 compatible payment token

##### Description
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
An attacker is able to provide a poisoned token address when creating a proposal for withdrawing ERC-20. If the proposal is accepted, then the behaviour of this token during the `transfer` operation may be unexpected. For example. the function can always `revert`, which can lead to a situation that this proposal will be impossible to delete from the current contract implementation, the function can call the `execute` function again (reentrancy) that can lead to the theft all tokens from the contract, the function can transfer nothing which will lead to the fact that users will be deceived etc.

##### Recommendation
It is recommended to add a list of whitelisted ERC-20 tokens that are allowed to be added to the proposal. To protect against reentrancy for withdrawing ERC-20, as in the previous case, the `proposal.isExecuted` must be set before the `if` statement.

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
Created proposals that were only rejected or executed are removed from the proposal queue at the time a new proposal is created. Expired proposals cannot be voted on or executed. This has the effect that if the proposal is expired and not rejected or accepted, it will never be removed from the proposal queue. With 10 such expired proposals in the proposal queue (not rejected and not executed) none of the functions of the `VotingDAOV2` contract can be called (vote, veto or execute cannot be called if the proposal is expired and it is not possible to create new proposals).

##### Recommendation
It is recommended to add an additional condition `!isExpired(proposal)` to the `return` statement of the `isActive` function of the `ProposalLibrary` to check if the proposal has expired. It allows to remove expired proposals from the proposal queue when a new proposal is created.

***

#### 2. Vetoed proposals can lead to a protocol DoS

##### Description
Files:
* `VotingDAOV2.sol` (line 104)
* `ProposalQueue.sol` (line 51)
* `ProposalLibrary.sol` (line 54-56)

Proposals that have been vetoed cannot be voted on or executed. Howewer, vetoed proposals can only be removed from the proposal queue when a new proposal is created only if the proposal was vetoed after it had been rejected. In other cases. vetoed proposal will be considered as active in `isActive` function of the `ProposalLibrary`. With 10 such vetoed proposals in the proposal queue (not rejected by users before vetoed) none of the functions of the `VotingDAOV2` contract will be able to be called (vote, veto or execute is not allowed to be called if the proposal is vetoed and it is not possible to create new proposals).

##### Recommendation
It is recommended to add additional condition `!proposal.vetoed` to the `return` statement of the `isActive` function of the `ProposalLibrary` to check if the proposal has been vetoed. It allows to remove vetoed proposals from the proposal queue when a new proposal is created.

***

### Medium

#### 1. Veto manipulations

##### Description
If the private key of some `VetoNFT` holders would be exposed or at least one NFT would fall into the worng hands, any proposal can be vetoed by the attacker at any time. Also, even if the proposal has been accepted but not executed yet, any NFT holder can veto it.

##### Recommendation
Consider adding multisig or voting pattern for the functionality of veto. If this option is not suitable consider transferring the NFT from holder, this limits number of times vetoed. Also there is possibility to add veto role to access control contract.

Consider veto forbiddance if the `proposal.isQuorumReached()` returns true.

***

### Low

#### 1. It is possible to block ETH/tokens on the balance of the contract

##### Description
There is `receive() external payable` function in `VotingDAOV2.sol`. But there is no functionality for a privileged person to return ETH/tokens not through creating a proposal in case of an emergency.

##### Recommendation
It is recommended to add functionality for the possibility of withdrawing the remaining ETH/tokens from the balance of the contract for a privileged persons.

***

#### 2. Missed events

##### Description
There are missed events for `veto`, `vote` functions in `VotingDAOV2.sol`.

##### Recommendation
It is recommended to emit the events for these functions.

***

#### 3. Unnecessary code

##### Description
* Variable `uint32 updatedBlockNumber` in `Proposal.sol`, line 20 - only updating when `vote` function is called from `VotingDAOV2`, never used.
* Function `countYeas` in `ProposalQueue.sol`, line 18 - never used.
* Require `proposal.isQuorumReached()` in `VestingDAOV2.sol`, line 167 - unnecessary check, it follows from the next line require: `proposal.isAccepted()`.
* Condition `proposal.isAccepted()` in `VestingDAOV2.sol`, line 170 - always true, it follows from the require `proposal.isAccepted()`,
* Requires `destination != address(0)` and `address(destination) != address(0)` in `VestingDAOV2.sol`, lines 235, 252 - unnecessary checks, it follows from the require `payment.destination != address(0)` in `_createProposal` function.

##### Recommendation
It is recommended to delete unnecessary code.

***

#### 4. Gas optimization in increments

##### Description
* Contract: `ProposalQueue.sol`
* Lines: 30, 39

`++i` costs less gas compared to `i++` or `i += 1` for unsigned integers. In `i++`, the compiler has to create a temporary variable to store the initial value. This is not the case with `++i` in which the value is directly incremented and returned, thus, making it a cheaper alternative.

##### Recommendation
It is recommended to change the post-increments (`i++`) to the pre-increments (`++i`).

***

#### 5. Function names may not reflect the essence

##### Description
* Contract: `VotingDAOV2.sol`
* Lines: 72, 88

It is suggested that the function names `withdrawETH` and `withdrawToken` reflect of their essence - creating a proposal for withdrawing ETH and tokens respectively. Howewer, if the parameter `amount` is set to `0`, these functions operate just like `createProposal` function, which creates an empty proposal. It is a little bit confusing and there is also a redundancy of options for creating an empty proposal.

##### Recommendation
It is recommended to add require `amount > 0` to the `withdrawETH` and `withdrawToken` functions.

***

#### 6. Revoting for the same solution only spends money for gas

##### Description
* Contract: `VotingDAOV2.sol`
* Line: 124

In case of re-voting for the same decision transaction will not be reverted and user will only spend money for gas payment. If this action would be disabled, then the probability that the user will not complete the transaction increases (due to MetaMask notification, HardHat local revert etc).

##### Recommendation
It's recommended to add reverting the transaction if the user wants to vote for the same decision.
