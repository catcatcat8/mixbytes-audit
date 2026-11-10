# Slither summary

Slither was used as a cross-check during the review. The table below comes from a re-run on the audited contracts and maps every result to the report.

- Tool: Slither 0.11.5
- Command: `slither . --filter-paths "lib|test"`
- Scope: `contracts/` (OpenZeppelin, forge-std and the test files are excluded)

## Results

| Impact | Detector | Location | Verdict |
|---|---|---|---|
| High | `controlled-delegatecall` | `VBeaconProxy.__fallback()` | True positive → [C-3](../README.md#c-3-arbitrary-delegatecall-in-vbeaconproxy) |
| High | `reentrancy-eth` | `VotingDAOV2.execute()` | True positive → [C-1](../README.md#c-1-reentrancy-in-eth-withdrawal), [C-2](../README.md#c-2-poisoned-or-non-erc-20-compatible-payment-token) |
| High | `unchecked-transfer` | `VotingDAOV2._withdrawToken()`, `token.transfer` | True positive → [C-2](../README.md#c-2-poisoned-or-non-erc-20-compatible-payment-token) |
| High | `uninitialized-state` | `AccessControlled.accessControl` | False positive: set in the `VetoNFT` constructor and, for the proxy, by `VotingDAOV2.initialize()` through delegatecall into the same slot |
| Medium | `unchecked-lowlevel` | `VBeaconProxy.__fallback()` | Part of [C-3](../README.md#c-3-arbitrary-delegatecall-in-vbeaconproxy) |
| Medium | `unchecked-lowlevel` | `VotingDAOV2._withdrawETH()`, `destination.call` | True positive, related to [C-1](../README.md#c-1-reentrancy-in-eth-withdrawal): if the call fails, the proposal is still marked as executed. The C-1 recommendation (use `transfer` or check the result) fixes it |
| Medium | `incorrect-equality` | `ProposalQueue.find()`, `VotingDAOV2.initialize()` | False positive: exact equality is intended (hash lookup, fixed supply check) |
| Low | `reentrancy-events` | `VotingDAOV2.execute()` | Part of [C-1](../README.md#c-1-reentrancy-in-eth-withdrawal) |
| Low | `timestamp` | `ProposalLibrary.isExpired()` and its callers | Accepted: the proposal TTL is 3 days, so a few seconds of validator drift do not matter |
| Informational | `low-level-calls` | `_withdrawETH()`, `__fallback()` | Covered by C-1 and C-3 |
| Informational | `naming-convention` | `VBeaconProxy.__fallback()` | Covered by C-3 (the function should not exist) |
| Informational | `unused-state` | `AccessControlledRoles.ADMIN`, `VETO_MINT` | Not reported: shared role constants inherited by every access-controlled contract |
| Optimization | `constable-states`, `immutable-states` | `AccessControlled.accessControl` | False positive: the value is set in the initializer of an upgradeable contract |

## What the manual review found and Slither did not

- [H-1](../README.md#h-1-expired-proposals-can-lead-to-a-protocol-dos) and [H-2](../README.md#h-2-vetoed-proposals-can-lead-to-a-protocol-dos): the proposal queue never releases expired or vetoed proposals.
- [M-1](../README.md#m-1-veto-manipulation): one VetoNFT holder can veto any proposal, even one already accepted.
- All Low findings ([L-1](../README.md#l-1-ethtokens-can-get-stuck-on-the-vbeaconproxy-balance) … [L-6](../README.md#l-6-voting-again-for-the-same-option-only-wastes-gas)).
