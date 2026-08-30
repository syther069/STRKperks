# StrkPerks

Starknet-native private reward settlement with campaign-scoped replay protection.

## Local development

```text
npm install
npm run dev
```

The web app runs at `http://localhost:3000`.

## Status

The frontend demo flow and Starknet wallet shell exist. Cairo contracts and cryptographic nullifier utilities are being hardened. STRK20 funding/private-note settlement remains an isolated adapter until the official hackathon ABI and resource specification are verified; existing simulated paths are `Mocked for demo` and must not be treated as live transactions.

See [`docs/privacy-model.md`](docs/privacy-model.md), [`docs/threat-model.md`](docs/threat-model.md), [`docs/strk20-integration.md`](docs/strk20-integration.md), and [`docs/demo-runbook.md`](docs/demo-runbook.md).
