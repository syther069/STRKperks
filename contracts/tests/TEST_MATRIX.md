# Cairo contract test matrix

The Starknet Foundry suite currently contains 24 tests (including expiry and insufficient-budget guards).

## NullifierRegistry

- fresh consume and count;
- replay rejection;
- campaign scoping; and
- unauthorized caller rejection.

## RewardCampaign

- owner-only funding and exact ERC-20 transfer accounting;
- one-time anonymizer configuration;
- exact claim approval and expiry;
- only configured anonymizer may claim;
- nullifier replay rejection;
- budget and claim-count updates; and
- pause/close/time-window guards.

## RewardRouter anonymizer

- only configured privacy pool may call;
- campaign/token/pool are constructor-pinned;
- campaign reward is measured by balance delta;
- zero output and overflow fail closed;
- pool approval equals the exact output; and
- exactly one upstream `OpenNoteDeposit` is returned.

Run from `contracts/`:

```text
scarb build
snforge test
```
