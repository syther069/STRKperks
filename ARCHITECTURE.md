StrkPerks Architecture

Private rewards and referral settlement for STRK20 communities on Starknet.

1. Architecture Summary

StrkPerks is a Starknet-native rewards protocol that lets projects create private reward campaigns, fund them through STRK20, approve valid conversions, and settle rewards into recipient-owned private notes.

The architecture is designed for a hackathon MVP, but it should still look like the first version of a real protocol.

The main goal is to demonstrate one complete, verifiable flow:

Campaign owner connects a Starknet wallet.
Campaign owner creates a private rewards campaign.
Campaign owner funds the campaign using STRK20.
A recipient is registered through a commitment.
Campaign owner approves a conversion.
Recipient receives a private reward note.
Duplicate claims are rejected through nullifier protection.
Demo shows Starknet transaction proof and explains privacy boundaries.
2. Architecture Goals
Use Starknet as the core execution layer.
Use STRK20 as the privacy and reward settlement layer.
Keep the MVP focused on one working end-to-end flow.
Make privacy useful for a real business use case, not just a generic mixer.
Provide clear proof for hackathon judges through deployed contracts, transaction links, and a working UI.
Keep the codebase modular so future campaigns, reward types, and integrations can be added later.
3. High-Level System Design

StrkPerks has four main layers:

Layer	Responsibility
Frontend	User dashboard, wallet connection, campaign creation, claim flow, transaction timeline
Starknet Contracts	Campaign creation, campaign rules, reward authorization, nullifier checks
STRK20 Privacy Layer	Shielded campaign funding, private note creation, private reward settlement
Optional Backend	Demo metadata, offchain conversion simulation, campaign indexing, signed approvals

The smart contracts own the critical settlement and replay-protection logic.
The frontend owns user experience and transaction orchestration.
The backend is optional and should never be trusted for final reward settlement.

4. Core Components
4.1 Campaign Factory

The CampaignFactory contract creates new reward campaigns.

Responsibilities:

Deploy or register new campaign contracts.
Store campaign owner address.
Emit campaign creation events.
Keep campaign IDs unique.
Provide campaign discovery for the frontend.
4.2 Reward Campaign

The RewardCampaign contract stores the rules for a single campaign.

Responsibilities:

Store campaign configuration.
Validate campaign owner actions.
Track campaign status.
Approve reward conversions.
Route valid settlements to the reward router.
Enforce campaign budget and claim limits.

Campaign configuration includes:

Campaign name hash or metadata URI
Campaign owner
Reward token
Fixed reward amount
Start time
End time
Maximum claims
Campaign status
Nullifier namespace
4.3 Nullifier Registry

The NullifierRegistry prevents duplicate reward claims.

Responsibilities:

Store used conversion nullifiers.
Reject repeated nullifiers.
Scope nullifiers by campaign.
Emit events when a nullifier is consumed.

This is required for the hackathon demo because judges should clearly see that the same conversion cannot be claimed twice.

4.4 Reward Router

The RewardRouter connects campaign approval logic with STRK20 settlement.

Responsibilities:

Validate approved reward settlement requests.
Route settlement calls into the STRK20 flow.
Connect campaign treasury balance with recipient private note output.
Emit minimal public events without exposing recipient identity.

The router should avoid leaking unnecessary recipient data.

4.5 Frontend Dashboard

The frontend is the main demo surface.

Responsibilities:

Wallet connection
Campaign creation
Campaign funding
Conversion approval
Claim flow
Transaction status tracking
Recipient receipt display
Duplicate claim demo
Explorer link display

The frontend should make the privacy model understandable without requiring judges to deeply understand STRK20 internals.

4.6 Optional Indexing API

The optional backend API can support UX and demo readability.

Responsibilities:

Store campaign metadata
Store demo conversion data
Prepare signed approval payloads
Cache public campaign events
Provide transaction history for the frontend

The backend must not be required for final trust. Starknet contracts should remain the source of truth for settlement validity.

5. Recommended Tech Stack
Frontend
Tool	Purpose
Next.js	Full-stack React framework
TypeScript	Type safety
Tailwind CSS	UI styling
Starknet React	Wallet connection and Starknet hooks
starknet.js	Starknet contract calls and transaction handling
TanStack Query	Async state, transaction polling, caching
Zustand	Lightweight local UI state
Zod	Form and payload validation
Smart Contracts
Tool	Purpose
Cairo	Starknet smart contract language
Scarb	Cairo package manager
Starknet Foundry	Contract testing
OpenZeppelin Cairo	Ownable, access control, ERC interfaces where useful
Starknet Sepolia/Mainnet	Deployment target depending on hackathon requirements
STRK20 Integration
Resource	Purpose
STRK20 shielded balances	Private campaign funding
STRK20 private notes	Private reward receipt
STRK20 private transfer helpers	Reward settlement
STRK20 wallet-compatible flow	User signing and transaction execution
STRK20 docs/demo references	Submission credibility and judge explanation
Backend
Tool	Purpose
Next.js API Routes	Lightweight API for hackathon MVP
Prisma	Optional database ORM
SQLite	Local demo database
PostgreSQL	Production-ready database option
Redis	Optional queue/cache for indexing

For the hackathon MVP, avoid unnecessary backend complexity unless it improves the demo.

Testing And Quality
Tool	Purpose
Starknet Foundry	Cairo contract tests
Vitest	Frontend and utility tests
Playwright	End-to-end demo flow tests
ESLint	Code quality
Prettier	Formatting
GitHub Actions	CI checks
6. File Structure
strkperks/
├── README.md
├── ARCHITECTURE.md
├── PRD.md
├── package.json
├── pnpm-lock.yaml
├── .env.example
├── .gitignore
│
├── apps/
│   └── web/
│       ├── app/
│       │   ├── page.tsx
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   │
│       │   ├── campaigns/
│       │   │   ├── page.tsx
│       │   │   ├── create/
│       │   │   │   └── page.tsx
│       │   │   └── [campaignId]/
│       │   │       └── page.tsx
│       │   │
│       │   ├── claim/
│       │   │   └── [campaignId]/
│       │   │       └── page.tsx
│       │   │
│       │   ├── demo/
│       │   │   └── page.tsx
│       │   │
│       │   └── api/
│       │       ├── campaigns/
│       │       │   └── route.ts
│       │       ├── conversions/
│       │       │   └── route.ts
│       │       └── approvals/
│       │           └── route.ts
│       │
│       ├── components/
│       │   ├── campaign/
│       │   │   ├── CampaignCard.tsx
│       │   │   ├── CampaignForm.tsx
│       │   │   ├── CampaignStats.tsx
│       │   │   └── FundingPanel.tsx
│       │   │
│       │   ├── claim/
│       │   │   ├── ClaimPanel.tsx
│       │   │   ├── RecipientReceipt.tsx
│       │   │   └── DuplicateClaimWarning.tsx
│       │   │
│       │   ├── demo/
│       │   │   ├── DemoTimeline.tsx
│       │   │   └── JudgeProofPanel.tsx
│       │   │
│       │   ├── wallet/
│       │   │   ├── WalletButton.tsx
│       │   │   └── WalletProvider.tsx
│       │   │
│       │   └── ui/
│       │       ├── Button.tsx
│       │       ├── Card.tsx
│       │       ├── Input.tsx
│       │       ├── Modal.tsx
│       │       └── Toast.tsx
│       │
│       ├── lib/
│       │   ├── starknet/
│       │   │   ├── contracts.ts
│       │   │   ├── calls.ts
│       │   │   ├── wallet.ts
│       │   │   └── explorer.ts
│       │   │
│       │   ├── strk20/
│       │   │   ├── client.ts
│       │   │   ├── shield.ts
│       │   │   ├── notes.ts
│       │   │   └── settlement.ts
│       │   │
│       │   ├── campaign/
│       │   │   ├── createCampaign.ts
│       │   │   ├── approveConversion.ts
│       │   │   ├── claimReward.ts
│       │   │   └── nullifier.ts
│       │   │
│       │   ├── validation/
│       │   │   ├── campaignSchema.ts
│       │   │   └── conversionSchema.ts
│       │   │
│       │   └── utils/
│       │       ├── format.ts
│       │       └── constants.ts
│       │
│       ├── hooks/
│       │   ├── useCampaign.ts
│       │   ├── useCampaigns.ts
│       │   ├── useClaimReward.ts
│       │   ├── useStarknetTx.ts
│       │   └── useWallet.ts
│       │
│       └── tests/
│           ├── campaign.test.ts
│           ├── claim.test.ts
│           └── nullifier.test.ts
│
├── contracts/
│   ├── Scarb.toml
│   ├── src/
│   │   ├── lib.cairo
│   │   ├── campaign_factory.cairo
│   │   ├── reward_campaign.cairo
│   │   ├── nullifier_registry.cairo
│   │   ├── reward_router.cairo
│   │   └── interfaces/
│   │       ├── i_campaign_factory.cairo
│   │       ├── i_reward_campaign.cairo
│   │       ├── i_nullifier_registry.cairo
│   │       └── i_reward_router.cairo
│   │
│   ├── tests/
│   │   ├── test_campaign_factory.cairo
│   │   ├── test_reward_campaign.cairo
│   │   ├── test_nullifier_registry.cairo
│   │   └── test_reward_router.cairo
│   │
│   └── scripts/
│       ├── declare.ts
│       ├── deploy.ts
│       └── seed-demo-campaign.ts
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types.ts
│       │   ├── campaign.ts
│       │   ├── conversion.ts
│       │   └── constants.ts
│       └── package.json
│
├── docs/
│   ├── demo-script.md
│   ├── judging-alignment.md
│   ├── privacy-model.md
│   ├── strk20-integration.md
│   └── deployment.md
│
└── scripts/
    ├── setup.sh
    ├── test.sh
    └── verify-submission.sh
7. Data Flow
7.1 Campaign Creation Flow
Campaign owner connects Starknet wallet.
Frontend validates campaign form.
Frontend calls CampaignFactory.create_campaign.
Factory creates or registers campaign.
Campaign ID is emitted.
Frontend stores public campaign metadata.
Dashboard displays created campaign.
7.2 Campaign Funding Flow
Campaign owner selects campaign.
Campaign owner enters funding amount.
Frontend calls STRK20 shielded balance flow.
Funds are assigned to campaign settlement path.
Frontend tracks transaction status.
Dashboard updates available private reward budget.
7.3 Conversion Approval Flow
Campaign owner receives or creates a valid conversion.
Frontend generates a campaign-scoped conversion ID.
Frontend derives a nullifier from campaign ID and conversion ID.
Campaign owner signs or submits approval.
RewardCampaign stores approval state.
Conversion becomes eligible for reward settlement.
7.4 Private Reward Claim Flow
Recipient opens claim page.
Recipient connects wallet.
Frontend prepares recipient commitment.
Frontend submits claim transaction.
Contract checks campaign status.
Contract checks approval.
Contract checks nullifier is unused.
Contract marks nullifier as used.
Reward router executes STRK20 private settlement.
Recipient receives private reward note.
Frontend displays receipt and transaction proof.
7.5 Duplicate Claim Rejection Flow
Recipient or attacker submits same conversion again.
Contract checks nullifier registry.
Registry detects already-used nullifier.
Transaction is rejected.
Frontend shows duplicate claim rejection.
Demo proves replay protection to judges.
8. Smart Contract Responsibilities
CampaignFactory

Required functions:

create_campaign
get_campaign
get_campaign_count
get_owner_campaigns

Events:

CampaignCreated
RewardCampaign

Required functions:

approve_conversion
claim_reward
pause_campaign
resume_campaign
close_campaign
get_campaign_config
get_campaign_stats

Events:

ConversionApproved
RewardClaimed
CampaignPaused
CampaignClosed
NullifierRegistry

Required functions:

is_nullifier_used
consume_nullifier
get_campaign_nullifier_count

Events:

NullifierConsumed
RewardRouter

Required functions:

settle_private_reward
verify_settlement_request
get_router_config

Events:

PrivateRewardSettlementRequested
PrivateRewardSettled
9. Privacy Architecture

StrkPerks should be honest about what privacy is provided.

Hidden Or Protected
Recipient wallet identity during private reward settlement
Direct project-to-recipient reward graph
Recipient cumulative reward history
Private reward note ownership
Campaign-recipient relationship
Public Or Partially Public
Campaign contract deployment
Public transaction timing
Contract interaction count
Campaign existence
Some settlement metadata depending on STRK20 flow
Any data manually disclosed by users
Design Rule

The frontend must never claim full invisibility. It should clearly explain that StrkPerks reduces public reward graph leakage using STRK20 privacy flows.

10. Security Architecture

Security requirements:

Only campaign owner can approve conversions.
Expired campaigns cannot settle new rewards.
Closed campaigns cannot settle new rewards.
Nullifier must be consumed before or atomically during settlement.
Same conversion cannot be claimed twice.
Reward amount must match campaign configuration.
Settlement must fail if campaign budget is insufficient.
Recipient secrets must not be stored in local storage.
Frontend must validate user input before transactions.
Contract tests must cover replay attempts.

Main risks:

Risk	Mitigation
Duplicate claims	Campaign-scoped nullifiers
Fake conversions	Owner approval/signature
Unauthorized campaign control	Ownable/access control
Budget draining	Reward amount checks and campaign budget checks
Bad UX during pending tx	Transaction timeline and retry states
Privacy misunderstanding	Clear privacy boundary section in UI and docs
11. Frontend Architecture

The frontend should be built around the judge demo.

Main screens:

Screen	Purpose
Dashboard	View campaigns and protocol stats
Create Campaign	Create a new private reward campaign
Campaign Detail	Manage funding, approvals, and settlements
Claim Page	Recipient reward claim flow
Demo Page	Guided judge demo
Docs Page	Explain privacy, STRK20 usage, and architecture

Important UI components:

Wallet button
Campaign creation form
Funding panel
Conversion approval panel
Claim panel
Recipient receipt
Transaction timeline
Explorer link card
Duplicate claim warning
Privacy explanation panel
12. STRK20 Integration Plan

STRK20 should be used in the core reward flow.

Required integration points:

Shield campaign funding
Campaign owner funds reward budget through STRK20 shielded balance flow.
Private reward settlement
Approved reward is settled into a recipient-owned private note.
Private receipt
Recipient sees reward status without exposing the full public reward graph.
Judge evidence
Demo includes transaction links, code references, and explanation of which STRK20 features were used.

The project should avoid being a normal rewards dashboard with a privacy label. STRK20 must sit inside the actual settlement path.

13. Backend Architecture

For the MVP, backend should stay minimal.

Use backend only for:

Campaign metadata
Demo conversions
Optional approval payload generation
Event indexing
UI speed

Do not use backend for:

Final claim validity
Private key storage
Secret note storage
Reward settlement authority
Bypassing contract checks

Recommended MVP backend:

apps/web/app/api/
├── campaigns/route.ts
├── conversions/route.ts
└── approvals/route.ts
14. Testing Strategy
Contract Tests

Must test:

Campaign creation
Owner-only conversion approval
Claim before approval fails
Claim after campaign expiry fails
Duplicate claim fails
Nullifier is consumed correctly
Invalid reward amount fails
Campaign close prevents settlement
Frontend Tests

Should test:

Campaign form validation
Wallet disconnected state
Transaction pending state
Transaction success state
Claim success UI
Duplicate claim error UI
End-To-End Demo Test

Should test:

Create campaign
Fund campaign
Approve conversion
Claim reward
Attempt duplicate claim
Confirm duplicate rejection
15. Deployment Architecture
Environments
Environment	Purpose
Local	Development and contract testing
Testnet	Contract deployment and integration testing
Mainnet or required hackathon network	Final judging demo
Required Deployment Outputs
Frontend live URL
Contract addresses
Starknet explorer links
Demo campaign ID
Demo transaction hashes
README setup guide
Architecture document
STRK20 integration explanation
Short demo video
16. Hackathon Judging Alignment
Technical Implementation

Architecture includes real Starknet contracts, frontend integration, STRK20 settlement, and testable replay protection.

STRK20 Usage

STRK20 is used for the core private reward settlement path, not just branding.

Originality

Private referral and reward settlement solves a real Web3 privacy problem for communities, affiliates, contributors, and growth teams.

UX Quality

The frontend is designed around a clear judge demo with transaction timelines, receipts, and privacy explanations.

Practicality

The MVP is intentionally narrow: one campaign type, one reward flow, one private settlement path, and one clear duplicate claim demo.

Submission Strength

The architecture supports the required hackathon evidence:

Working app
Deployed contracts
STRK20 integration
Public repo
Demo video
Explorer links
Clear technical documentation
17. MVP Build Order
Create base Next.js frontend.
Add Starknet wallet connection.
Build campaign creation UI.
Write Cairo campaign contracts.
Add nullifier registry.
Add reward router interface.
Integrate STRK20 funding and settlement flow.
Build claim page.
Add duplicate claim demo.
Add transaction timeline and explorer links.
Write tests.
Record demo video.
Finalize README, PRD, and architecture docs.
18. Final Architecture Principle

StrkPerks should prove one thing extremely well:

A Starknet project can distribute rewards privately using STRK20 without exposing the recipient wallet, the reward relationship, or the user’s full earning history on the public chain.