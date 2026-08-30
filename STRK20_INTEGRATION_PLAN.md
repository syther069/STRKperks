# STRK20 Integration Plan

## Current boundary

The deployed StrkPerks contracts provide campaign funding, conversion approval,
campaign-scoped nullifiers, and a permissioned settlement request. The current
web app's note-generation utilities are demo-only and must not be presented as
proofs or live private settlement.

## Required production route

Use the Starknet Wallet API for a user-facing dapp. The connected privacy-capable
wallet must construct and submit the STRK20 private action batch, including the
private transfer and the app helper's `privacy_invoke` call. The wallet/prover
owns viewing keys, note discovery, screening, and proof submission.

## Launch gates

- Verify the current Wallet API version and connected-wallet support.
- Verify the STRK20 pool address and exact Sepolia ABI from first-party docs.
- Deploy and verify an app-specific Cairo helper implementing `privacy_invoke`
  and returning `Span<OpenNoteDeposit>`.
- Configure proving, screening, and note-discovery services without storing
  user viewing keys in the app backend.
- Replace the placeholder note id in the live claim path with the wallet API
  result.
- Execute and record one real claim, then replay the same conversion and verify
  rejection by `NullifierRegistry`.
- Update UI copy only after the above transaction and proof links are verified.

## Privacy claims to preserve

Deposits, withdrawals, timing, registration events, and nullifiers remain public.
Only in-pool movement is private. The app must describe the system as private by
default and selectively disclosable, never as fully invisible or anonymous.
