# STRK20 integration status

## Verified integration direction

The official STRK20 examples specify a note-based privacy pool. Accounts register a viewing key before receiving private balances; deposits are public ERC-20 legs, while transfers inside the pool are private. Deposits are screening-gated and private operations are proven before atomic application.

For a user-facing dapp, the recommended route is the Starknet Wallet API. A private settlement is represented as a `transfer` action with `amount: "OPEN"` followed by an `invoke` action targeting an app-specific `privacy_invoke` helper. The wallet/prover owns viewing keys, note discovery, and proof submission. The helper must return `Span<OpenNoteDeposit>` and approve the pool to pull output funds.

The Sepolia privacy-pool address documented by STRK20 by Example is:

`0x0254a6b2997ef52e9f830ce1f543f6b29768295e8d17e2267d672c552cfe0d91`

The existing `apps/web/lib/strk20/*` implementations are still demo simulations and fabricate hashes; they are not proof of live settlement. `apps/web/lib/strk20/client.ts` now exposes an isolated `invokePrivateActions` boundary that accepts only a wallet implementing `strk20InvokeTransaction`. Live wiring requires a STRK20-capable wallet (Wallet API >= 0.10.3), a verified helper contract, and configured proving/discovery services. Until those are configured, simulated behavior remains `Mocked for demo`.

The Cairo `RewardRouter` is now a permissioned settlement-request boundary. It authorizes campaigns and rejects direct third-party settlement calls, but deliberately does not invent a pool ABI; the STRK20 Wallet API/private helper remains responsible for actual note creation.
