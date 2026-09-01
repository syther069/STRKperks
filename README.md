# StrkPerks

Starknet reward campaigns with campaign-scoped replay protection and STRK20
private-note payout through the Starknet Wallet API.

## Current status

- The hardened Cairo campaign, nullifier registry, and STRK20 anonymizer compile
  and pass 24 Starknet Foundry tests.
- The web app has a Wallet API 0.10.3 adapter with prepare, exact open-note
  authorization, and submit stages.
- Campaign funding is a public ERC-20 treasury deposit. The claim output enters
  the privacy pool atomically; funding itself is not shielded.
- The anonymizer is an **unaudited draft**. Live mode must remain disabled until
  an independent Cairo review and a real supported-network end-to-end test are
  complete.
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
