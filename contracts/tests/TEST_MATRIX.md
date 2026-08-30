# Cairo contract test matrix

This matrix is the required Starknet Foundry suite for the compiled contracts. It is intentionally kept next to the contracts until `snforge` is available in the environment.

## NullifierRegistry

- A campaign can consume a fresh nullifier.
- The same campaign/nullifier pair reverts with `NULLIFIER_USED`.
- A different campaign may consume the same nullifier value.
- A non-campaign caller reverts with `CAMPAIGN_NOT_AUTHORIZED`.
- Per-campaign counts increment exactly once.

## RewardCampaign

- Constructor rejects zero owner/token, zero reward, zero claim limit, and invalid windows.
- Only owner may fund, approve, pause, resume, or close.
- `fund_with_erc20` credits budget only when `transfer_from` returns true.
- Claims reject before start, after expiry, while paused, and after close.
- Claims reject without approval, with a mismatched amount, at the claim limit, or over budget.
- A valid claim consumes the registry nullifier, decrements budget, increments claims, clears approval, and requests router settlement.
- Registry/router failure reverts the entire claim state transition.

## RewardRouter

- Only owner may authorize/revoke campaigns.
- Unauthorized campaigns and non-campaign callers cannot settle.
- Zero commitments and amounts are rejected.
- Valid settlement emits only campaign, commitment, amount, and note identifier metadata.

Run with:

```text
snforge test --manifest-path contracts/Scarb.toml
```

Status: pending until Starknet Foundry is installed; no test pass is claimed yet.
