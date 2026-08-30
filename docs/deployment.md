# Deployment

## Current status

Contracts are implemented under `contracts/`; Scarb 2.20.1 and Starknet Foundry 0.63.0 are installed in WSL. `scarb build` and all 19 `snforge test` cases pass. The following Sepolia deployments and post-deployment wiring have been verified with read-only calls.

## Verified Sepolia deployment (2026-08-30)

| Contract | Deployed class hash | Address | Deployed transaction |
| --- | --- | --- | --- |
| NullifierRegistry | `0x0231614ff8e30d40e2175adbf57fd8e3c7dd3f431142db03f2c2acdd94c8b88d` | `0x071ddcd5a25a6c927121f13d835078b8c09722616d9f207e850c74e0c62fc127` | [0x03e188…](https://sepolia.voyager.online/tx/0x03e18828b6ee0a87f3386300ba1f763e05de85acaab525c79b38e74c25bf5b0f) |
| RewardRouter | `0x07a1f321e040e305858b990a67099aa1cf970f4bc9387d1d25c0a267c6515d85` | `0x054ac9694b172309e2ec9dbcade501fdc759e63794dc9c9fde6620cf99abbfab` | [0x018d8e…](https://sepolia.voyager.online/tx/0x018d8e7bd343f5e68cd3da652b79dc197f78b5dc3bab790803fb03fc097c023d) |
| CampaignFactory | `0x03c379781f8536a707c5804a89b2b4eac268237a97c2068ce584a9391ed0a3a1` | `0x00b80bf30c77940aa1893b5abc2aef51c92d10c8ba6895ffe60cc0cb27e65361` | [0x067971…](https://sepolia.voyager.online/tx/0x0679718e92148531f798a0a6f028da1f4de717cfed412368a1429751ca3040da) |
| RewardCampaign | `0x01bf43112f74c05cd60de919ae961ff9217c5a1f30fe77e9bd0c057cde715159` | `0x07d639662c9840f2dd0dc19c01f352bb098d3a11975e6be99caa98d7e627727a` | [0x04235c…](https://sepolia.voyager.online/tx/0x04235c32f7a535db59a6e1b31787b261cdc35de835194ebbf789c5cd9194840a) |

The RewardRouter authorization view returns `true` for the deployed campaign, and CampaignFactory registers the same campaign at index `0`. The campaign was deployed with a 1 STRK reward, 100 maximum claims, and a 30-day window. It is funded with 100 STRK on Sepolia (the ERC20 approval and `fund_with_erc20` transactions are recorded below).

Funding transactions:

- ERC20 approval: [0x0563f1…](https://sepolia.voyager.online/tx/0x0563f14597b4f17b2a67c5ead85548e7360f9c8d2fde6a0b5f31e29e4f398b85)
- Campaign funding: [0x01b0b5…](https://sepolia.voyager.online/tx/0x01b0b5c8b0ccca469d10661c5ccc15532ec4b10e7e2f0f8f1ee3b886d9960103)

Read-only verification returned a campaign budget of `100000000000000000000` (100 STRK). The current live claim flow records the campaign claim and emits the router settlement request; a production STRK20 private-note settlement adapter is not yet connected.

## Required environment

Copy `apps/web/.env.example` to `apps/web/.env.local` and set the verified Sepolia RPC, explorer URL, and deployed contract addresses. Do not commit `.env.local`, account keys, or seed phrases.

## Windows toolchain setup

The official Starknet guide recommends WSL for Windows:

```powershell
wsl --install
```

Inside Ubuntu, install Scarb and Starknet Foundry using `asdf`, then verify:

```bash
scarb --version
snforge --version
```

## Repository verification

If the global Windows `npm` launcher is unavailable, run the repository-local verification script from PowerShell:

```powershell
.\scripts\verify.ps1
```

It runs the frontend typecheck, lint, unit checks, production build, and the Cairo build/test suite without requiring a global npm installation.
If WSL is blocked by local policy, run the script from an elevated PowerShell session or run the Cairo commands manually inside Ubuntu.

## Planned commands

```text
scarb build --manifest-path contracts/Scarb.toml
cd contracts && snforge test
```

Deployment scripts must be run only with a funded disposable testnet account and verified STRK20 ABI/configuration.

Before calling `fund_with_erc20`, the owner must approve the campaign contract to spend the configured reward token. The contract checks the token's `transfer_from` result before increasing its budget.
