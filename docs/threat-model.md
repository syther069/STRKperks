# Threat model

| Threat | Implemented control |
| --- | --- |
| Replay | Campaign-scoped nullifier consumed atomically by the fixed registry |
| Payout redirection | Owner approval binds the exact open-note ID and all payout-critical fields |
| Alternate registry/helper injection | Registry is constructor-pinned; only the one-time configured anonymizer may claim |
| Arbitrary helper caller | `privacy_invoke` accepts only the configured privacy pool |
| Budget accounting without funds | Budget increases only after successful ERC-20 `transfer_from` |
| Wrong helper output | Balance-delta accounting, checked `u256 -> u128`, zero rejection, exact pool approval |
| Expired or disabled campaign | Start/end, expiry, pause, close, budget, and claim-limit guards |
| Key leakage | Wallet owns keys/proofs; frontend never requests a viewing key |
| Fabricated live receipt | Live flow uses only wallet-returned hash and prepared open-note ID |

Residual risks include unaudited Cairo, wallet/prover/discovery correctness,
malicious or non-standard ERC-20 behavior, metadata correlation, transaction
timeouts, and changes in upstream deployments or schemas. This repository is
not a security audit.
