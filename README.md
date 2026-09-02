# StrkPerks

Starknet reward campaigns with campaign-scoped replay protection and STRK20
private-note payout through the Starknet Wallet API.

## Current status

- The hardened Cairo campaign, factory, nullifier registry, and STRK20
  anonymizer compile and pass 43 Starknet Foundry tests locally.
- Production routes read campaigns from the configured factory/RPC and never
  import demo fixtures. Synthetic state is isolated under `/demo`.
- The web app checks Wallet API 0.10.3+, prepares an exact open-note ID,
  persists wallet-returned hashes, resumes receipt polling, and requires a
  consented wallet balance delta before displaying wallet-private evidence.
- Campaign funding is a public ERC-20 treasury deposit. The claim output enters
  the privacy pool atomically; funding itself is not shielded.
- The anonymizer is an **unaudited draft**. A verified deployment manifest,
  independent Cairo review, and real compatible-wallet end-to-end test remain
  external submission gates.
- Earlier Sepolia deployments use obsolete contract classes and do not prove
  this STRK20 flow.

## Local development

```text
npm install
npm run dev
```

Copy `apps/web/.env.example` to `apps/web/.env.local`. Supply only addresses
verified against the current official privacy release before setting
`NEXT_PUBLIC_ENABLE_LIVE_CONTRACTS=true`.

## Verification

From PowerShell:

```powershell
.\scripts\verify.ps1
```

This runs frontend typechecking, lint, unit checks, a production build, Cairo
build, and Starknet Foundry tests.

See [STRK20_INTEGRATION_PLAN.md](STRK20_INTEGRATION_PLAN.md),
[docs/privacy-model.md](docs/privacy-model.md), and
[docs/deployment.md](docs/deployment.md).
