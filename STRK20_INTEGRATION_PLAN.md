# STRK20 Integration Plan

Last reviewed: 2026-08-30

## Outcome

StrkPerks should integrate STRK20 through the Starknet Wallet API and a reviewed
StrkPerks anonymizer contract. The claimant's privacy-capable wallet creates the
open note, manages viewing keys and note discovery, obtains the proof, and
submits the private action batch. The privacy pool calls the anonymizer, the
anonymizer releases an approved reward from the campaign treasury, and the pool
credits that reward to the claimant's open note atomically.

The production claim must have this shape:

```text
claimant wallet
  -> STRK20 privacy pool
     -> open reward-token note for claimant
     -> call StrkPerks anonymizer.privacy_invoke(...)
        -> validate and consume the campaign claim
        -> transfer reward token from campaign to anonymizer
        -> anonymizer approves the pool
     -> pool pulls the exact balance delta into the open note
```

This route keeps user key material in the wallet and uses STRK20 in the actual
settlement path. It does not require the browser or StrkPerks backend to hold a
viewing key, discover notes, or construct a proof.

## Decisions

1. **Wallet route:** use the Starknet Wallet API for the user-facing app. Do
   not put the low-level Privacy SDK or claimant key material in the browser.
2. **Custom anonymizer:** implement a Cairo helper because this is a
   campaign-to-open-note payout, not a simple wallet-to-wallet transfer or an
   AVNU swap.
3. **Funding boundary:** keep campaign funding as a public ERC-20 treasury
   edge for this version. The claim output enters the pool atomically. Do not
   describe the existing `fund_with_erc20` flow as shielded funding.
4. **Exact authorization binding:** bind every approved claim to the exact open
   note that will receive it. A conversion ID or recipient commitment alone
   does not prevent another party from redirecting an approved payout.
5. **One source of truth:** store the NullifierRegistry and anonymizer addresses
   in campaign configuration. They must not be supplied by an untrusted caller
   to `claim_reward`.
6. **No invented interface:** use the privacy types and selector behavior from
   the matching `starkware-libs/starknet-privacy` release. Do not deploy a
   guessed `privacy_invoke` ABI.

## Implementation status

| Area | Implemented state | Remaining launch gate |
| --- | --- | --- |
| Web dependencies | Existing UI remains on starknet.js 6.x; an aliased, pinned 10.4.0 adapter uses Wallet Standard/discovery 6.0.2 and schema 0.10.3 | Verify at least one real compatible wallet and deployed pool end to end. |
| Capability | Connected wallet is queried through `supportedWalletApi`; 0.10.3+ is required without reading balances or keys | Test rejection and account-change behavior against real wallets. |
| Wallet boundary | Typed `STRK20_ACTION[]` prepare and submit flow resolves and rechecks the exact note ID | Add confirmation timeout/resume and first-use fee/setup UX after network testing. |
| Demo isolation | Fabricated settlement/client/shield modules were removed; the remaining note generator is explicitly a demo fixture | Keep production-mode reachability covered as the demo evolves. |
| Campaign treasury | `fund_with_erc20` requires a successful real token transfer | Funding is public and must stay labelled as such. |
| RewardRouter | Pool-only `privacy_invoke` returns the upstream `OpenNoteDeposit` after exact balance-delta accounting | Independent Cairo review and real pool compatibility test required. |
| Claim routing | Registry is constructor-pinned and only the one-time configured anonymizer can release rewards | Review factory/deployment governance before production. |
| Claim authorization | Stored Poseidon commitment binds the exact note and payout-critical fields | Demonstrate prepare/rebuild note-ID stability with a real wallet. |
| Nullifiers | StrkPerks derives an app-level campaign nullifier | Keep it distinct in code and docs from STRK20 note nullifiers, which the privacy protocol creates when spending notes. |

Earlier deployed contracts remain evidence of the obsolete prototype only.
They are not compatible with the current classes and are not evidence of a live
STRK20 claim.

## Claim authorization design

Before submission, construct a commitment over every value that can redirect
or replay a payout:

```text
claim_commitment = Poseidon(
  DOMAIN,
  campaign_address,
  conversion_id,
  app_nullifier,
  open_note_id,
  reward_token,
  reward_amount,
  authorization_expiry
)
```

The campaign owner either stores this commitment onchain or signs it with a
domain-separated SNIP-12-compatible authorization that the campaign verifies.
For the hackathon path, storing the commitment is simpler and easier to audit.

The first implementation spike is a blocking feasibility gate: establish
whether the selected wallet can expose a deterministic `open_note_id` before
submission, and whether rebuilding after approval preserves it. The placeholder
string is not itself the final ID. If the Wallet API cannot support this
handshake, stop and replace the authorization design (for example with a
reviewed operator/SDK delivery route); never ship an approval that is not bound
to its payout destination.

The anonymizer supplies the same fields to the campaign. The campaign rebuilds
the commitment, checks approval and expiry, consumes the app nullifier, updates
the budget and claim count, and transfers the fixed reward to the anonymizer.
Changing the open note causes the claim to fail. Copying an unchanged payload
can only credit the already-authorized note, and replay is rejected by the
registry.

Do not send a raw claimant secret, viewing key, or wallet address in helper
calldata. Remove `recipient_commitment` from settlement events unless it has a
separately documented and tested security purpose.

## Cairo work

### 1. Pin campaign dependencies

Change `RewardCampaign` so its constructor or factory-controlled initializer
stores:

- the canonical `NullifierRegistry` address;
- the reviewed StrkPerks anonymizer address;
- the reward token and fixed reward amount already stored today.

Remove `registry` and `router` from public claim calldata. Only the configured
anonymizer may execute the payout leg. Keep checks and state updates before the
ERC-20 transfer, with the whole call reverting atomically on any downstream
failure.

### 2. Replace the event-only router with an anonymizer

Implement `privacy_invoke` using the matching privacy package's
`OpenNoteDeposit` type. Its responsibilities are:

1. assert that the caller is the configured privacy pool;
2. validate non-zero addresses and amount and require the configured reward
   token;
3. record the anonymizer's reward-token balance before the campaign call;
4. call the configured campaign claim entry point with the exact authorization
   fields;
5. compute `balance_after - balance_before` as `u256`;
6. checked-convert the delta to `u128` and reject zero output;
7. approve the privacy pool to pull exactly that amount; and
8. return exactly one `OpenNoteDeposit { note_id, token, amount }` in a
   `Span<OpenNoteDeposit>`.

Return no additional values or trailing data. Let campaign, token, and pool
reverts abort the entire transaction. Pin the pool, campaign, and token in
configuration so the helper cannot become a generic withdrawal surface.

### 3. Minimize public events

Campaign and registry events may include campaign, conversion ID, app
nullifier, amount, and status when the product requires them. They must not
include a recipient address, raw secret, viewing key, or an app-generated claim
receipt pretending to be an STRK20 note.

## Wallet and frontend work

### 1. Perform a separate dependency migration

The current direct `starknet@^6.11.0` dependency cannot support this flow.
Choose and pin one coherent, tested set of starknet.js, wallet-standard,
discovery, React, and StarkZap versions. STRK20 Wallet API support begins on the
starknet.js 10.x integration line; the current privacy repository release also
pins its own compatible version. Verify the exact matrix again immediately
before installation and commit the lockfile.

Do not combine a floating starknet.js major with old wallet-standard pins. If
StarkZap or starknet-react blocks the migration, keep them for existing calls
and create a narrow Wallet API adapter at the `WalletAccountV6` layer.

### 2. Gate by capability

Use `supportedWalletApi()` and require the selected stable STRK20 schema
(`>= 0.10.3` for the currently documented transfer/invoke route). Detect the
connected wallet's advertised support; a compatible library does not make an
incompatible wallet private-capable.

Unsupported wallets must receive an explicit unsupported state or a separately
labelled transparent claim path. Never probe `strk20Balances` merely to detect
support, and never request a viewing key.

### 3. Build and prepare the private action batch

The claim batch is:

```ts
const actions: STRK20_ACTION[] = [
  {
    type: "transfer",
    token: rewardToken,
    amount: "OPEN",
    recipient: claimantAddress,
  },
  {
    type: "invoke",
    contract: strkPerksAnonymizer,
    calldata: [
      campaignAddress,
      conversionId,
      appNullifier,
      "${openNoteIds[0]}",
      authorizationExpiry,
    ],
  },
];
```

The final calldata must match `privacy_invoke` exactly. Treat this snippet as
the intended shape, not a frozen ABI, until the reviewed Cairo signature is
final.

Run the wallet's prepare/dry-run flow before submission. Use the resolved open
note ID for campaign approval, then submit the exact authorized batch. If the
prepare result is not reusable after the approval transaction, rebuild and
confirm that the open-note ID remains stable; otherwise redesign the approval
handshake before continuing.

### 4. Handle real transaction states

- Read the pool fee from the pool instead of hardcoding it and fail early if
  the claimant cannot pay it.
- Account for viewing-key registration and recipient setup on first use.
- Explain that a newly created note needs protocol maturity before it can be
  spent (currently approximately 10 blocks; verify at launch).
- Bound transaction confirmation with an app timeout. A timeout means
  submitted but not yet visible, not failed.
- Preserve the real hash and resume RPC/explorer polling.
- Normalize felt addresses numerically before comparisons.
- Delete or quarantine all fabricated hashes, note objects, and
  `viewingKeyProof` strings from live code paths.

## Trust boundary

| Component | Holds or observes | Must not receive |
| --- | --- | --- |
| Privacy-capable wallet | Signing key, viewing key, discovered notes, action intent | StrkPerks backend custody or logging |
| Proving service | Proof request and virtual execution data required by the selected deployment | App secrets unrelated to the STRK20 action |
| Discovery service | Encrypted onchain state and wallet discovery queries | Campaign conversion secrets |
| FPI screening path | Public deposit/shielding address and screening inputs | A claimed ability to bypass screening with another prover |
| StrkPerks frontend | Public campaign data, wallet capability result, authorization fields, transaction hash | Viewing keys, raw claim secrets, fabricated private balances |
| StrkPerks backend | Optional public metadata and owner approval workflow | Wallet keys, note registry, proof custody |
| Anonymizer and campaign | Public helper calldata and claim state | Recipient wallet address or private note ownership |

## Privacy boundary

| Hidden or unlinkable without authorized viewing material | Public or inferable |
| --- | --- |
| Open-note owner | Campaign and anonymizer addresses |
| Claimant wallet address when a relayer/paymaster submits correctly | Reward token and open-note amount |
| STRK20 encrypted note contents and in-pool ownership graph | Campaign funding, approval, and payout timing |
| Which encrypted notes a user later spends | App nullifier and any event/calldata fields |
| Sender/receiver/amount for ordinary encrypted in-pool transfers | Deposits, withdrawals, registration events, and pool nullifiers |

Open-note amounts are public by design. Distinctive reward amounts, rapid
fund-and-claim timing, and channel setup near the claim can shrink the
anonymity set. Product copy should say **private by default, selectively
disclosable when required**, not anonymous, invisible, or untraceable.

## Verification plan

### Contract tests

- only the configured anonymizer can release a campaign reward;
- caller-supplied registry/helper substitution is impossible;
- an unapproved or expired claim fails;
- changing `open_note_id`, token, amount, campaign, nullifier, or expiry breaks
  the claim commitment;
- the app nullifier can be consumed only once;
- budget, claim limit, pause, close, and time-window checks remain enforced;
- the campaign transfers exactly the configured reward;
- the anonymizer uses balance delta, checked `u256 -> u128`, rejects zero, and
  returns exactly one valid `OpenNoteDeposit`;
- a token, campaign, or pool revert rolls the entire claim back; and
- events contain no recipient address or raw secret.

### Client tests

- Wallet API versions below the selected schema are rejected without a balance
  prompt;
- unsupported and rejected-wallet states are distinct;
- placeholder order matches the reviewed Cairo ABI;
- prepared open-note authorization cannot be redirected;
- padded and unpadded felt addresses compare equal;
- submission timeout preserves the real transaction hash; and
- no demo hash or note generator is reachable from a production configuration.

### Network integration

Run end-to-end testing on the network where a compatible pool, wallet, prover,
and discovery service are actually available. A pure local devnet test is not
sufficient for Wallet API proof behavior.

Record:

1. helper declaration and deployment;
2. campaign deployment with pinned registry/helper;
3. campaign funding;
4. exact claim approval;
5. successful prepared and submitted private claim;
6. recipient wallet discovery of the real open note;
7. altered-note redirection rejection;
8. replay rejection; and
9. all explorer links and deployed addresses in `docs/deployment.md`.

## Delivery phases

1. **Feasibility and architecture freeze:** prove the open-note authorization
   handshake with the selected wallet, then approve the
   public-treasury-to-private-note model and exact claim commitment fields.
2. **Cairo implementation:** add pinned dependencies, the payout entry point,
   and the reviewed anonymizer with unit/integration tests.
3. **Client migration:** pin a coherent Wallet API-capable dependency stack in
   a separate change and update wallet connection types.
4. **Claim handshake:** implement prepare -> exact approval -> submit, with
   capability, fee, maturity, and timeout UX.
5. **Public-network proof:** deploy to the supported test network, execute the
   success/redirection/replay cases, and capture evidence.
6. **Copy cleanup:** remove claims of shielded campaign funding and fabricated
   proof language; update architecture, privacy model, demo runbook, and UI.

## Launch gates

- [ ] Current Wallet API schema and at least one connected wallet are verified
  end to end.
- [x] Exact dependency versions are pinned for the isolated STRK20 adapter.
- [ ] Pool address, class hash, ABI, fee, proof-validity window, and supported
  network are verified from first-party deployment sources.
- [ ] The selected privacy package tag matches the deployed pool and helper
  types.
- [ ] The StrkPerks anonymizer has an independent Cairo security review; a
  generated draft is not treated as production code.
- [x] Registry and anonymizer addresses are pinned in campaign storage.
- [x] Approval binds the exact open note and all payout-critical fields.
- [ ] The wallet preparation/rebuild behavior needed for exact note binding is
  demonstrated; if it is unavailable, a separately reviewed delivery route is
  selected before implementation continues.
- [ ] Prover, discovery, paymaster/relayer, RPC, and screening assumptions are
  documented without app custody of viewing keys.
- [ ] One real claim, one redirection attempt, and one replay attempt are
  recorded with explorer evidence.
- [x] Fake transaction hashes, notes, and viewing-key proofs are unreachable
  from the live claim path.
- [x] Live claim UI and maintained integration/privacy documentation match the
  hidden-versus-public boundary above.
- [ ] No RPC key, API key, account key, seed phrase, viewing key, or claimant
  secret is staged.

## Source baseline

Use these sources again at implementation and launch time because versions,
wallet rollout, and deployments are fast-moving:

- [Starknet Privacy overview](https://docs.starknet.io/build/starknet-privacy/overview)
- [Starknet Privacy architecture](https://docs.starknet.io/build/starknet-privacy/architecture)
- [Starknet Privacy glossary](https://docs.starknet.io/build/starknet-privacy/glossary)
- [Starknet privacy protocol source and compatibility matrix](https://github.com/starkware-libs/starknet-privacy)
- [Starknet privacy releases](https://github.com/starkware-libs/starknet-privacy/releases)
- [STRK20 by Example integration index](https://strk20-by-example.org/llms.txt)
- [Wallet API route](https://strk20-by-example.org/starknet-wallet-api/overview)
- [Private DeFi action flow](https://strk20-by-example.org/starknet-wallet-api/private-defi)
- [Anonymizer `privacy_invoke` contract pattern](https://strk20-by-example.org/helpers/privacy-invoke)

The Starknet docs confirm that the privacy pool is live on mainnet, that open
notes enable anonymous DeFi interaction, and that viewing keys support
selective disclosure. The upstream repository provides the component
compatibility matrix and Cairo/TypeScript source. The integration guides supply
the Wallet API action and anonymizer patterns. None of those sources removes
the need to verify the actual testnet deployment and connected-wallet support
before calling the StrkPerks claim live.
