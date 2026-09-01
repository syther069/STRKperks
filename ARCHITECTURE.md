# StrkPerks Architecture

## Purpose & Status

StrkPerks is a Starknet-native reward-settlement product. Campaign owners fund fixed reward programs, approve exact conversions, and eligible recipients claim through a STRK20 private-settlement path. Campaign-scoped app nullifiers prevent replay.

This document defines the target production architecture and records the repository’s actual implementation status. It is not deployment evidence.

| Area | Status | Current truth |
| --- | --- | --- |
| Cairo campaign, registry, factory, router source | **Implemented** | Source and Foundry tests exist; the router is marked unaudited. |
| Wallet API adapter | **Partially implemented** | A narrow `starknet-strk20` alias prepares/submits actions and checks Wallet API `0.10.3+`. |
| Verified current deployment and manifest | **Blocked** | No verified current-source deployment record exists. |
| STRK20 claim, note discovery, replay proof | **Blocked** | Requires a capable wallet, current pool configuration, funded accounts, and accepted transactions. |
| Authoritative production routes | **Planned** | Root, campaign, and claim routes still use demo Zustand state and fixtures. |
| Demo isolation | **Partially implemented** | `/demo` exists, but demo modules are still imported by product routes. |

The production application must never fabricate a wallet, transaction hash, campaign balance, note ID, contract state, explorer evidence, or private-note outcome.

## Architecture Principles

### Starknet Is Authoritative

On production routes, deployed Cairo contracts and Starknet RPC reads determine campaign ownership, funding, approval validity, claim limits, app-nullifier consumption, payout accounting, and settlement events. Browser state may cache presentation data; it must not create confirmed protocol state.

### Privacy Belongs to the Wallet & STRK20

A privacy-capable wallet owns signing keys, viewing keys, proof creation, private inputs, and note discovery. StrkPerks must not request, receive, log, or persist viewing keys, seed phrases, proof witnesses, or raw private-note ownership data.

**Current exception to resolve:** the claim panel accepts a local app-level claim secret to derive an app nullifier. It is held in React state and not sent to the helper, but it must not be confused with a viewing key or persisted.

### Production & Demo Are Separate Surfaces

Production uses connected wallets, verified deployed addresses, live RPC reads, wallet-returned hashes, and confirmed receipts. `/demo` may model a guided simulation only with persistent Simulation labeling and no synthetic explorer links.

### Every Claim Is Verifiable

`Submitted` means the wallet returned a real Starknet transaction hash. `Confirmed` requires an accepted receipt plus the necessary state/event refresh. A UI success state alone is never finality.

## System Context

| Layer | Responsibility | Trusted for |
| --- | --- | --- |
| Starknet account wallet | Public account connection, signatures, writes | User-authorized public actions |
| Privacy-capable wallet | STRK20 capability, proofs, note ownership/discovery | Recipient privacy operations |
| Next.js app | UI, validation, calldata preparation, receipt tracking | Presentation/orchestration only |
| Starknet RPC | Contract reads, receipts, events, chain identity | Public chain state |
| Cairo reward contracts | Lifecycle, accounting, approvals, replay protection | Protocol correctness |
| STRK20 pool | Calls router and credits returned open-note deposit | Private payout destination |
| Explorer | Independent public transaction inspection | Human-verifiable public evidence |

**Not implemented:** an offchain approval service. The current approval API fails closed with HTTP `501`; campaign owners approve via onchain `RewardCampaign.approve_claim`.

## Onchain Components

### CampaignFactory

**Implemented:** `create_campaign` registers a non-zero, unregistered campaign address and exposes index/count lookup. It emits the registered campaign and caller.

**Planned:** factory-owned deployment, configuration validation, campaign metadata, and production discovery through verified events. The current factory does not deploy a campaign or prove a registered address has the expected class.

### RewardCampaign

**Implemented:** `RewardCampaign` pins owner, reward token, and registry at construction. It supports owner-only ERC-20 funding, one-time anonymizer configuration, exact onchain approval, active-window, pause/close, budget, and max-claim checks. Its approval commitment binds the contract address, conversion ID, app nullifier, open-note ID, token, fixed reward amount, domain tag, and expiry. It prevents repeated conversions, consumes the app nullifier, and transfers a fixed reward to the configured router.

Funding measures balance before/after `transfer_from`; only received tokens increase budget. Closed campaigns permit owner-only unspent-fund withdrawal.

**Planned:** full public configuration/lifecycle reads and a deployment-proven campaign discovery model. A local fixture ID is not a production campaign.

### NullifierRegistry

**Implemented:** storage is Poseidon-scoped by campaign address and app nullifier. Only a campaign may consume its own nullifier; a second consume reverts. The registry exposes read/count methods.

The app nullifier is not an STRK20 note-spend nullifier and must never be documented as one.

### RewardRouter

**Implemented, unaudited:** `RewardRouter` pins the privacy pool, campaign, and reward token. `privacy_invoke` checks its pool caller, calls the campaign, measures balance delta, rejects zero/overflow output, approves exactly that delta to the pool, and returns exactly one `OpenNoteDeposit`.

The router does not accept arbitrary campaign, token, pool, destination, or reward amount from calldata. It needs independent Cairo review and a real compatible-network test before funded deployment.

## Target Private Settlement Path

```text
privacy-capable wallet
  -> STRK20 privacy pool
     -> prepares recipient-owned open reward-token note
     -> RewardRouter.privacy_invoke(...)
        -> RewardCampaign.claim_reward(...)
           -> verifies exact owner approval and expiry
           -> consumes campaign-scoped app nullifier
           -> transfers fixed reward to RewardRouter
        -> RewardRouter measures token balance delta
        -> RewardRouter approves pool for exactly that delta
        -> RewardRouter returns one OpenNoteDeposit
     -> privacy pool credits the prepared open note
```

The current commitment binds the campaign through contract address, conversion ID, app nullifier, open-note ID, token, fixed amount, expiry, and `STRKPERKS_CLAIM_V2`. **Planned:** explicit chain-context binding if approvals become portable offchain signatures. Current approval is an onchain owner write to one campaign instance.

Nullifier consumption and downstream token movement share one Starknet transaction. Failure reverts the complete transition.

## Public & Private Boundaries

Public or observable: campaign/router/registry/pool/token addresses, ERC-20 approval and funding, open-note token and amount, app calldata, app nullifier, conversion ID, open-note ID, expiry, timing, fees, receipts, and relevant events.

Wallet/pool boundary: viewing keys, proof witnesses, private wallet inputs, and private note ownership/discovery subject to the exact deployed STRK20 system.

StrkPerks does not claim full anonymity, zero-knowledge eligibility, hidden campaign participation, or hidden timing. Use **private by default and selectively disclosable** only where it matches the deployed protocol. See the [privacy model](docs/privacy-model.md) and [threat model](docs/threat-model.md).

## Funding Path

```text
campaign owner wallet
  -> ERC-20.approve(RewardCampaign, amount)
  -> wait for approval confirmation
  -> RewardCampaign.fund_with_erc20(amount)
  -> refresh confirmed campaign state
```

Funding is public. The current UI can build an approval/funding wallet multicall when live configuration is enabled. Production must show each submitted hash and confirmed state, or accurately describe a supported multicall. Funding is not STRK20 shielding.

## Client Architecture

| Concern | Current implementation | Production target |
| --- | --- | --- |
| Framework | Next.js + TypeScript | Same |
| Public wallet stack | `@starknet-react/core`, `starknet` 6.x | Connected wallet plus validated chain/account changes |
| STRK20 boundary | Aliased `starknet-strk20` 10.4.0, Wallet API `0.10.3` check | Narrow adapter; no direct product-component imports |
| Wallet discovery | Wallet Standard/discovery `6.0.2` | Capability-driven compatible wallet selection |
| Validation | Zod schemas | Validate all public payloads before writes |
| Server state | TanStack Query provider | Live reads, invalidation, receipt recovery |
| Local state | Zustand demo store | Presentation-only product state; isolated demo store |
| Contract testing | Foundry test source | Pinned reproducible toolchain and passing suite |

The wallet owns keys, viewing material, proof creation, note discovery, and authorization. The app may receive a connected address, chain ID, capability metadata, public authorization fields, wallet hash, and public receipt/event data; it must not log or persist private wallet material.

### Target Read & Write Model

Production reads use deployed contract calls or indexed events for campaign configuration, funding/accounting, claim state, app-nullifier status, and activity. TanStack Query owns caching, invalidation, and refetching. Zustand owns filters and nonsensitive form drafts only.

```text
validate input
  -> verify supported wallet and expected Starknet network
  -> prepare typed calldata
  -> request wallet authorization
  -> receive real transaction hash
  -> show Submitted with verified explorer link
  -> poll receipt
  -> handle accepted, reverted, rejected, or timeout
  -> refetch authoritative chain state
  -> show Confirmed only after verification
```

**Current gap:** there is no complete live read model, authoritative route data model, or durable transaction recovery. Existing timeout waits do not replace receipt tracking and post-confirmation query invalidation.

## Product & Demo Isolation

### Production Routes

```text
/
/campaigns
/campaigns/create
/campaigns/[address]
/claim/[campaignAddress]
/activity
/docs
```

These routes may render only connected wallet state, deployed addresses, live RPC/indexed data, real hashes, confirmed receipts, authentic STRK20 capability, and verified explorer links.

### Demo Route

`/demo` requires persistent `Simulation` labeling, isolated fixtures/state, no production analytics, no synthetic explorer links, and a live-product exit.

**Current gap:** `useDemoStore` and fixtures appear in root, campaign, claim, navigation, and wallet components; `/api/campaigns` and `/api/conversions` also return local fixtures. Until refactored, all affected product routes are demo-backed.

**Required enforcement:** prevent product/lib imports from demo modules; use `source: "starknet" | "simulation"` at shared boundaries; reject simulated records in explorer and verified-proof components; never fall back from an unsupported STRK20 wallet to fake success.

## Deployment & Verification

**Implemented:** `contracts/run_deployment.sh` builds, declares, deploys, and wires registry/factory/campaign/router contracts, then writes public addresses and class hashes to ignored `deployed_addresses.env`. It refuses non-Sepolia input and a mainnet-looking RPC URL.

**Blocked/Planned:** retain a machine-readable manifest with network/chain ID, RPC environment name without credentials, git commit, build timestamp, Scarb/compiler versions, class hashes, addresses, constructor arguments, declaration/deployment/wiring hashes, configuration, and explorer base URL.

A verifier must read deployed contracts, match class hashes/pinned dependencies, and fail on configuration drift. Environment values do not prove deployment. No script may invent an address or continue after a failed onchain operation.

## Security Invariants & Tests

The test suite must prove owner-only administration/funding; pool-only router entry; router-only payout; approval failure when a bound field or expiry changes; campaign-scoped app-nullifier single use and isolation; atomic reversion; budget limits; exact balance delta/allowance/deposit; lifecycle rejections; and no private material in events/errors.

**Current evidence:** Foundry test source and a matrix exist. Repository docs report 24 tests, but submission requires a rerun on a pinned compatible Cairo/Scarb toolchain and the actual result. Documentation is not a substitute for passing tests.

## Acceptance Evidence Before Submission

```text
connect real wallet
  -> deploy current reviewed classes
  -> create/register campaign via current factory behaviour
  -> public ERC-20 approval and confirmed funding
  -> exact owner approval
  -> STRK20 open-note preparation in capable wallet
  -> private settlement submission
  -> accepted receipt and state refresh
  -> wallet note discovery
  -> replay attempt and deterministic onchain rejection
```

Required artifacts: passing frontend typecheck/lint/test/build, passing Cairo build/Foundry suite, current deployment manifest, real hashes/explorer links, configuration verification, and wallet-reported note evidence. Demo footage is valid only when prominently labeled simulation.

## UI Evidence Contract

| UI label | Required evidence |
| --- | --- |
| `Submitted` | Wallet returned a real Starknet hash |
| `Confirmed` | Accepted receipt and required state reads match |
| `Funded` | Confirmed campaign accounting/token state reflects funding |
| `Claimed` | Confirmed claim/nullifier state reflects settlement |
| `Private note created` | Supported wallet reports a real note result |
| `Duplicate claim blocked` | Live replay/revert or registry state proves consumption |
| `Mocked for demo` | Simulated action/data, confined to demo |

When capability, deployment, receipt, or live state is missing, StrkPerks must degrade honestly. Explain the prerequisite and never present local success as a protocol result.

## Final Rule

StrkPerks is a real Starknet product target first and a hackathon presentation second. Production claims are driven by deployed Cairo contracts, connected wallets, confirmed RPC state, authentic STRK20 capability, and verifiable public evidence. Simulation is a teaching surface only and never leaks into production campaigns, balances, claims, receipts, explorer links, or privacy claims.
