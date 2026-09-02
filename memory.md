# StrkPerks project memory

## 2026-08-27 implementation update

- Approval received to begin implementation.
- Added initial Scarb/Cairo contract foundation for factory, campaign, nullifier registry, and router.
- Replaced the frontend pseudo-hash nullifier/commitment derivation with Starknet Poseidon over domain-separated felt inputs.
- Added privacy, threat-model, STRK20 status, deployment, and demo-runbook documentation.
- Removed fabricated contract-address defaults from runtime configuration.
- STRK20 ABI/resource details remain unverified; the adapter must stay isolated and simulated paths must be labeled `Mocked for demo`.
- Scarb and snforge are not installed in the current workspace, so Cairo compilation/tests are pending tool availability.
- Official STRK20 by Example documentation verified the Wallet API route, `privacy_invoke` helper shape, registration/proof requirements, and Sepolia pool address. See `docs/strk20-integration.md`.
- StarkZap dependency installation was attempted but cancelled; wallet integration remains dependency-free via `lib/starknet/wallet.ts` and an optional `strk20InvokeTransaction` capability.
- StarkZap `^3.0.0` is now installed and exposed through `lib/starknet/starkzap.ts`; the existing injected wallet UX remains unchanged.
- Updated the Scarb manifest target to the Cairo Book's current 2.16.1 line and added `snfoundry.toml`.
- Scarb 2.20.1 is installed in Ubuntu WSL and `scarb build` now passes. Starknet Foundry 0.63.0 download failed during archive extraction; `snforge` tests remain pending.
- Expanded `RewardCampaign` with validated funding, owner-only conversion approval/admin controls, pause/close/expiry guards, claim limits, budget accounting, and a claim path that consumes campaign-scoped Poseidon nullifiers atomically.
- Corrected `NullifierRegistry` to scope storage keys with Poseidon(campaign, nullifier); Scarb compilation passes after these changes.
- Added typed contract-call builders in `apps/web/lib/starknet/contracts.ts` for factory creation, funding, conversion approval, and claims. Builders fail closed when deployment addresses are unset.
- Added `fund_with_erc20` to `RewardCampaign`; it calls the configured ERC-20 `transfer_from` and only credits budget after a successful transfer.
- Replaced the minimal router with an owner-controlled, campaign-authorized `settle_private_reward` boundary and non-sensitive settlement event; actual STRK20 note creation remains delegated to the verified Wallet API/helper.
- Connected `RewardCampaign.claim_reward` to `RewardRouter.settle_private_reward` after registry consumption and accounting updates; router failure reverts the atomic transaction. Updated claim calldata builder accordingly.
- Added the Cairo test matrix documenting required registry, campaign, router, and atomic-rollback cases; `snforge` execution remains pending because the Foundry archive cannot be extracted in WSL.
- Added decimal-to-18-decimal token conversion and a client-only `useContractActions` hook that executes typed Starknet calls when a real wallet and deployed addresses are configured.
- Corrected the demo claim path so nullifiers are derived from the recipient secret (not the public conversion ID), matching the documented privacy model; duplicate attempts reuse the same local secret.
# 2026-09-02 hardening update

- Production routes now read factory-indexed campaign state from a Sepolia-validated RPC and never fall back to fixtures.
- Demo fixtures, notes, and Zustand state are isolated under `apps/web/features/demo`; ESLint and standalone checks enforce the boundary.
- Factory creation now atomically deploys and wires campaign/router pairs and transfers campaign ownership to the caller.
- Public writes persist wallet-returned hashes, recover timed-out receipts through `/activity`, and invalidate live Starknet queries after acceptance.
- Funding confirms ERC-20 approval before transfer, supports allowance cancellation, and provides owner-only lifecycle/unspent-fund recovery controls.
- The STRK20 Wallet API adapter checks version `0.10.3+`, binds the exact prepared open-note ID, fails closed on changes, records a pre-claim balance baseline only with consent, and distinguishes receipt, wallet-balance, and replay evidence.
- Deployment tooling emits a pending JSON manifest and independently verifies source class hashes, transaction receipts, constructor/wiring state, and an 18-decimal reward token before web environment export.
- 43 Starknet Foundry tests pass locally with Scarb/Cairo 2.20.1 and Starknet Foundry 0.63.0. Frontend typecheck, lint, standalone checks, and production build pass.
- No current deployment, accepted STRK20 claim, wallet note/balance evidence, or live replay rejection was produced. Those remain external gates, and the router remains unaudited.
