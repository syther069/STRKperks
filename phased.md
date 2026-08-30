# phases.doc.md

# StrkPerks Project Phases

Private rewards and referral settlement for STRK20 communities on Starknet.

## Overview

This document breaks StrkPerks into manageable development phases for the hackathon MVP and post-MVP foundation.

The goal is to build one complete, judge-ready product flow:

A campaign owner creates and funds a STRK20 private rewards campaign, approves a valid conversion, settles a private reward to a recipient, and proves that duplicate claims are blocked through campaign-scoped nullifiers.

Each phase should produce a usable milestone, not just isolated code.

---

## Phase 1: Project Foundation, Wallet Login & Authentication

### Goal

Set up the project foundation and allow users to connect with a Starknet wallet.

### Core Work

- Initialize the frontend application.
- Set up TypeScript, Tailwind CSS, linting, formatting, and environment files.
- Configure Starknet wallet connection.
- Add wallet login and logout flow.
- Detect connected account and network.
- Add unsupported wallet/network handling.
- Set up basic route protection for dashboard pages.
- Prepare shared types for campaign, conversion, claim, and transaction states.

### Key Features

- Connect wallet
- Disconnect wallet
- Display connected Starknet address
- Detect network
- Show wallet connection errors
- Protect campaign dashboard behind wallet connection

### Acceptance Criteria

- User can connect a Starknet wallet.
- User can disconnect wallet.
- App shows connected wallet address.
- App warns users if they are on the wrong network.
- Dashboard actions are disabled when wallet is not connected.

### Suggested Files

```txt
apps/web/
├── app/layout.tsx
├── app/page.tsx
├── components/wallet/WalletButton.tsx
├── components/wallet/WalletProvider.tsx
├── hooks/useWallet.ts
├── lib/starknet/wallet.ts
└── lib/starknet/contracts.ts
Phase 2: Dashboard & Campaign UX
Goal

Build the main product dashboard where campaign owners can view campaigns, stats, and transaction status.

Core Work
Create dashboard layout.
Add navigation.
Add campaign overview cards.
Add campaign statistics.
Add campaign list view.
Add empty states.
Add loading, error, and success states.
Add basic data visualization for campaign activity.
Add transaction timeline component.
Key Features
Campaign dashboard
Campaign overview stats
Campaign list
Transaction status timeline
Explorer link cards
Basic privacy explanation panel
Dashboard Metrics
Total campaigns
Total campaign budget
Rewards settled
Remaining campaign budget
Approved conversions
Completed claims
Duplicate claims blocked
Acceptance Criteria
User can open dashboard after connecting wallet.
Dashboard shows campaign cards and core stats.
Empty state explains what to do next.
Transaction timeline can show pending, confirmed, failed, and rejected states.
UI clearly explains that StrkPerks uses STRK20 for private reward settlement.
Suggested Files
apps/web/
├── app/campaigns/page.tsx
├── components/campaign/CampaignCard.tsx
├── components/campaign/CampaignStats.tsx
├── components/demo/DemoTimeline.tsx
├── components/demo/JudgeProofPanel.tsx
└── lib/starknet/explorer.ts
Phase 3: Campaign Creation & Core CRUD
Goal

Allow campaign owners to create, view, update basic metadata, and manage private reward campaigns.

Core Work
Build campaign creation form.
Add campaign detail page.
Add form validation.
Add campaign metadata handling.
Add campaign status management.
Add search, filter, and sort for campaigns.
Connect frontend to CampaignFactory contract.
Add campaign creation transaction flow.
Main Entities
Campaign
Conversion
Claim
Recipient commitment
Transaction record
Campaign Fields
Campaign name
Reward token
Fixed reward amount
Campaign budget
Start time
End time
Maximum claims
Campaign status
Campaign owner
Nullifier namespace
Key Features
Create campaign
Read campaign details
Update offchain campaign metadata if needed
Close or pause campaign
Search campaigns
Filter campaigns by status
Sort campaigns by date, budget, or claim count
Acceptance Criteria
User can create a campaign from the frontend.
Campaign creation sends a Starknet transaction.
Campaign appears in dashboard after creation.
Campaign detail page shows campaign rules and stats.
Invalid forms are blocked before transaction submission.
Campaign owner can pause or close campaign if supported by contract.
Suggested Files
apps/web/
├── app/campaigns/create/page.tsx
├── app/campaigns/[campaignId]/page.tsx
├── components/campaign/CampaignForm.tsx
├── components/campaign/CampaignCard.tsx
├── lib/campaign/createCampaign.ts
├── lib/validation/campaignSchema.ts
└── contracts/src/campaign_factory.cairo
Phase 4: STRK20 Private Reward Settlement
Goal

Implement the main hackathon-winning feature: private reward settlement using STRK20.

Core Work
Add STRK20 shielded campaign funding.
Add recipient commitment flow.
Add conversion approval flow.
Add reward claim flow.
Add private note settlement.
Add campaign-scoped nullifier generation.
Add duplicate claim prevention.
Add recipient receipt page.
Add clear privacy boundary explanation.
Core Flow
Campaign owner funds reward campaign through STRK20.
Recipient generates or receives a claim commitment.
Campaign owner approves a valid conversion.
Recipient submits claim.
Contract checks campaign status.
Contract verifies conversion approval.
Contract checks nullifier.
Nullifier is consumed.
Reward is settled through STRK20.
Recipient receives a private reward note.
Key Features
STRK20 campaign funding
Private reward settlement
Recipient claim page
Conversion approval
Nullifier-based replay protection
Duplicate claim rejection
Recipient reward receipt
Public explorer proof
Acceptance Criteria
Campaign owner can fund a campaign using STRK20.
Campaign owner can approve a conversion.
Recipient can claim a private reward.
Same conversion cannot be claimed twice.
Duplicate claim attempt is rejected and visible in the demo.
Recipient receipt shows claim status and settlement reference.
UI explains what is private and what remains public.
Suggested Files
apps/web/
├── app/claim/[campaignId]/page.tsx
├── components/claim/ClaimPanel.tsx
├── components/claim/RecipientReceipt.tsx
├── components/claim/DuplicateClaimWarning.tsx
├── components/campaign/FundingPanel.tsx
├── lib/strk20/client.ts
├── lib/strk20/shield.ts
├── lib/strk20/notes.ts
├── lib/strk20/settlement.ts
├── lib/campaign/approveConversion.ts
├── lib/campaign/claimReward.ts
├── lib/campaign/nullifier.ts
├── contracts/src/reward_campaign.cairo
├── contracts/src/nullifier_registry.cairo
└── contracts/src/reward_router.cairo
Phase 5: Testing, Security & Quality Assurance
Goal

Make the MVP reliable enough for a live hackathon demo and technically credible for judges.

Core Work
Write Cairo contract tests.
Write frontend unit tests.
Add end-to-end tests for the demo flow.
Test duplicate claim rejection.
Test wallet disconnected states.
Test wrong network states.
Test failed transaction handling.
Fix bugs.
Improve loading states and empty states.
Check performance and responsiveness.
Review privacy claims for accuracy.
Contract Tests
Campaign creation succeeds.
Non-owner cannot approve conversion.
Claim before approval fails.
Claim after expiry fails.
Duplicate claim fails.
Nullifier is consumed correctly.
Closed campaign rejects new claims.
Invalid reward amount fails.
Frontend Tests
Campaign form validation works.
Wallet disconnected UI works.
Transaction pending state displays correctly.
Transaction success state displays correctly.
Transaction failure state displays correctly.
Duplicate claim error displays clearly.
Recipient receipt renders correctly.
Acceptance Criteria
Contract tests pass.
Frontend tests pass.
Demo flow works from start to finish.
Duplicate claim protection is proven.
No private secrets are stored in unsafe frontend state.
App works on desktop and mobile widths.
UI has no broken routes, dead buttons, or unclear transaction states.
Suggested Commands
pnpm lint
pnpm test
pnpm build
snforge test
Phase 6: Deployment, Demo & Hackathon Submission
Goal

Deploy a judge-ready version and prepare the final hackathon submission package.

Core Work
Deploy contracts to the required Starknet network.
Deploy frontend to production.
Add environment variables.
Verify contract addresses.
Add explorer links.
Prepare demo campaign.
Record short demo video.
Finalize README.
Finalize PRD, architecture, and STRK20 integration docs.
Create final submission checklist.
Required Submission Assets
Live app URL
Public GitHub repository
Deployed contract addresses
Starknet explorer links
Demo video
README setup guide
PRD document
Architecture document
STRK20 integration explanation
Clear explanation of privacy model
Clear explanation of judging criteria alignment
Acceptance Criteria
Frontend is live.
Contracts are deployed.
Demo campaign is ready.
Demo can be completed without manual debugging.
README explains local setup.
Submission clearly shows Starknet and STRK20 usage.
Judges can understand the product in under 3 minutes.
Final demo proves the complete reward settlement flow.
Suggested Files
docs/
├── demo-script.md
├── deployment.md
├── judging-alignment.md
├── privacy-model.md
└── strk20-integration.md
Phase 7: Post-Hackathon Improvements
Goal

Turn the hackathon MVP into a stronger product after submission.

Future Enhancements
Multiple reward tiers
Percentage-based commissions
Merchant API
Campaign analytics
DAO contributor payouts
NFT community reward campaigns
Private loyalty points
Selective disclosure
Multi-campaign recipient dashboard
SDK for Starknet apps
Advanced indexing
Better campaign templates
Audit preparation
Product Direction

StrkPerks can grow from a private rewards demo into a privacy-preserving growth infrastructure layer for Starknet projects.

The long-term product should help teams run referrals, loyalty campaigns, ambassador payouts, contributor grants, and user incentives without exposing their entire reward graph onchain.

Final Build Principle

Do not try to build every feature at once.

For the hackathon, StrkPerks should focus on one complete flow:

Create campaign → fund with STRK20 → approve conversion → settle private reward → block duplicate claim → show proof to judges.

A narrow product with a working private settlement flow will be stronger than a broad dashboard with incomplete privacy integration.