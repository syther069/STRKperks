# StrkPerks PRD (historical product specification)

> This document contains the original product scope. The current submission is a staged prototype: STRK20 settlement is not proven end to end, and any acceptance criterion below must be checked against the current implementation and deployment record.

Private reward distribution for STRK20 communities on Starknet.

## 1. Product Summary

VeilMint is a privacy-preserving rewards and referral settlement product built on the STRK20 protocol and Starknet.

It helps Web3 projects, communities, marketplaces, and merchants distribute referral rewards, loyalty points, cashback, or contributor incentives without publicly exposing the recipient wallet, reward relationship, or full payout history.

The hackathon MVP focuses on one complete flow:

A campaign owner funds a shielded reward campaign, approves a valid conversion, and settles the reward into a recipient-owned private note using STRK20 privacy primitives on Starknet.

## 2. Problem

Public reward systems leak too much information.

When a Web3 project pays affiliates, contributors, users, or community members onchain, the public chain can reveal:

- Who received the reward
- Which project paid them
- How much they earned
- How often they are paid
- Which campaign or community they are connected to
- Their wider wallet activity

This creates privacy, business, and security problems.

Affiliates may not want their earnings public. Projects may not want competitors to discover their best growth channels. Users may not want their participation connected to their main wallet.

## 3. Product Vision

Make onchain rewards useful for growth without turning users, affiliates, and campaign economics into a public surveillance graph.

VeilMint allows rewards to remain verifiable and programmable while keeping sensitive relationships private.

## 4. Target Users

### Primary Users

1. Web3 project teams  
   Teams that want to distribute private contributor rewards, referral rewards, loyalty incentives, or community payouts.

2. Affiliates and community contributors  
   Users who earn rewards but do not want their wallet identity or earnings history exposed publicly.

3. DAOs and communities  
   Communities that want private reward campaigns for ambassadors, early users, testers, or campaign participants.

### Secondary Users

- NFT communities
- Onchain games
- DeFi protocols
- Starknet ecosystem projects
- Hackathon teams and builders using STRK20

## 5. Core User Stories

### Campaign Owner

- As a campaign owner, I want to create a private rewards campaign so I can distribute incentives without exposing my growth strategy.
- As a campaign owner, I want to fund a campaign treasury using STRK20 so rewards can be settled privately.
- As a campaign owner, I want to approve a conversion so only valid users receive rewards.
- As a campaign owner, I want to prevent duplicate claims so the same conversion cannot be rewarded twice.

### Reward Recipient

- As a recipient, I want to claim or receive rewards privately so my wallet and earnings are not publicly linked.
- As a recipient, I want proof that my reward was settled successfully.
- As a recipient, I want to control when and how I open or use my private reward note.

### Judge / Reviewer

- As a hackathon judge, I want to see a working Starknet/STRK20 flow, not just a mockup.
- As a judge, I want clear proof that STRK20 resources are meaningfully integrated.
- As a judge, I want the project to have a real privacy use case, strong UX, and a feasible MVP.

## 6. MVP Scope

The MVP should prove one complete private reward settlement flow.

### Included In MVP

- Campaign creation
- Campaign funding through STRK20 shielded balance
- Reward recipient registration or invite flow
- Conversion approval
- Private reward settlement
- Duplicate claim prevention
- Recipient reward receipt
- Basic dashboard for campaign owner
- Demo mode with clear transaction steps
- Starknet wallet connection
- STRK20 integration evidence
- Open-source repository with setup instructions

### Not Included In MVP

- Full CRM system
- Full affiliate analytics platform
- Multi-chain support
- Fiat payouts
- Mobile app
- Complex identity verification
- Enterprise compliance dashboard
- Advanced AI attribution engine

## 7. Core Features

### 7.1 Campaign Creation

Campaign owners can create a reward campaign with:

- Campaign name
- Reward token
- Fixed reward amount
- Campaign budget
- Start and end time
- Maximum number of claims
- Campaign owner address
- Campaign nullifier namespace

### 7.2 Shielded Campaign Treasury

The campaign owner funds a private campaign treasury using STRK20.

The treasury should support:

- Shielded balance deposit
- Campaign-specific allocation
- Reward settlement from private balance
- Basic remaining budget display

### 7.3 Conversion Approval

A campaign owner can approve a valid conversion.

Each conversion should include:

- Campaign ID
- Conversion ID
- Reward tier
- Recipient commitment
- Expiration time
- Signature or authorization proof

### 7.4 Private Reward Settlement

After approval, the reward is settled into a recipient-owned private note.

The public chain should not directly expose:

- Recipient wallet address
- Merchant-recipient relationship
- Recipient cumulative reward history

### 7.5 Duplicate Claim Protection

Each reward claim must use a campaign-scoped nullifier.

This prevents:

- Double claiming
- Replay attacks
- Reusing the same conversion proof
- Reward draining through duplicate submissions

### 7.6 Recipient Receipt

The recipient receives a private reward receipt showing:

- Campaign name
- Reward amount
- Claim status
- Settlement transaction
- Note ownership status
- Optional disclosure details

### 7.7 Campaign Dashboard

The campaign owner dashboard should show:

- Total campaign budget
- Rewards settled
- Remaining budget
- Number of approved conversions
- Number of completed settlements
- Failed or pending settlements
- Public transaction references

### 7.8 Demo Mode

The demo should clearly walk judges through:

1. Connect Starknet wallet
2. Create campaign
3. Fund campaign using STRK20
4. Register or invite recipient
5. Approve conversion
6. Settle private reward
7. Show recipient receipt
8. Show duplicate claim prevention

## 8. Starknet And STRK20 Integration

VeilMint must use Starknet and STRK20 as core infrastructure, not as a cosmetic integration.

### Required Starknet Resources

- Starknet smart contracts written in Cairo
- Starknet wallet connection
- Starknet transaction submission
- Starknet mainnet or accepted hackathon network deployment
- Starknet explorer links for proof of execution

### Required STRK20 Resources

- STRK20 shielded balance flow
- Private transfer or private note creation
- Campaign-specific reward settlement
- STRK20-compatible wallet flow where possible
- Clear explanation of what is private and what remains public

### Suggested Technical Components

- Cairo campaign contract
- Commission or reward router contract
- Nullifier registry
- Frontend dashboard
- Wallet connection layer
- STRK20 helper functions
- Demo script with transaction links

## 9. Technical Architecture

### Frontend

Recommended stack:

- Next.js
- TypeScript
- Tailwind CSS
- Starknet React wallet connector
- Clean dashboard UI
- Transaction status timeline

Frontend pages:

- `/` campaign dashboard
- `/campaigns/create`
- `/campaigns/[id]`
- `/claim/[campaignId]`
- `/demo`
- `/docs` or `/about`

### Smart Contracts

Recommended contracts:

1. `CampaignFactory`
   - Creates campaign instances
   - Stores campaign metadata
   - Emits campaign creation events

2. `RewardCampaign`
   - Stores campaign configuration
   - Tracks approved conversions
   - Prevents duplicate claims
   - Routes settlement calls

3. `NullifierRegistry`
   - Stores used conversion nullifiers
   - Prevents replay attacks

4. `CommissionRouter`
   - Handles STRK20 reward settlement logic
   - Connects campaign approval with private reward output

### Backend / Optional API

A lightweight backend can be used for:

- Demo campaign metadata
- Offchain conversion simulation
- Merchant approval signatures
- UI indexing
- Submission analytics

The core settlement logic should remain on Starknet.

## 10. Privacy Model

### VeilMint Hides

- Recipient wallet identity
- Direct merchant-to-recipient relationship
- Recipient reward accumulation
- Private reward note ownership

### VeilMint Does Not Fully Hide

- That a campaign contract exists
- That a transaction occurred
- Timing of public transactions
- Total public interaction with contracts
- Information voluntarily disclosed by users

The product should clearly communicate these boundaries to judges and users.

## 11. Security Requirements

- Prevent duplicate claims with nullifiers
- Validate campaign ownership before settlement
- Validate reward amount and campaign budget
- Prevent expired conversion claims
- Prevent unauthorized campaign withdrawals
- Handle failed transactions safely
- Avoid storing private recipient data in frontend state
- Avoid exposing private keys, notes, or secrets
- Include clear test cases for replay protection

## 12. Success Metrics

### Hackathon MVP Metrics

- One complete working private reward settlement demo
- At least one deployed Starknet contract
- STRK20 integration shown in the live flow
- Duplicate claim prevention demonstrated
- Clear README and demo video
- Public repo with setup instructions
- Explorer links included in submission

### Product Metrics

- Number of campaigns created
- Number of rewards settled
- Settlement success rate
- Average claim completion time
- Number of duplicate claims blocked
- Campaign budget used
- Recipient claim completion rate

## 13. Judging Criteria Alignment

### Technical Implementation

VeilMint should score well by showing real Cairo contracts, Starknet transactions, STRK20 privacy flows, and working frontend integration.

### STRK20 Usage

The project should use STRK20 as the main privacy and reward settlement layer. The product should not be a generic dashboard with STRK20 added at the end.

### Originality

Private reward settlement is a practical use case that is different from generic mixers, wallets, or token dashboards. It solves a real growth and privacy problem for Web3 teams.

### User Experience

The product should make privacy understandable. Judges should be able to follow the full reward flow without needing deep protocol knowledge.

### Practicality

The MVP should be narrow enough to build during the hackathon but strong enough to become a real product after the event.

### Demo Quality

The demo should show:

- Campaign creation
- STRK20 funding
- Reward approval
- Private settlement
- Recipient receipt
- Duplicate claim rejection
- Explorer links and transaction proof

## 14. MVP Acceptance Criteria

The MVP is complete when:

- A campaign owner can create a campaign
- A campaign owner can fund the campaign
- A recipient can be added or invited
- A conversion can be approved
- A reward can be settled privately
- The same conversion cannot be claimed twice
- The frontend shows transaction status
- The README explains setup and demo steps
- The project includes Starknet/STRK20 resource usage
- The submission includes a short demo video

## 15. Demo Script

1. Open VeilMint dashboard.
2. Connect Starknet wallet.
3. Create a new private rewards campaign.
4. Fund the campaign using STRK20.
5. Generate or register a recipient commitment.
6. Approve one test conversion.
7. Settle the reward privately.
8. Open recipient receipt page.
9. Attempt the same claim again.
10. Show that duplicate claim is rejected.
11. Show Starknet explorer links.
12. Explain what was hidden and what remained public.

## 16. Roadmap

### Hackathon Version

- Single campaign type
- Fixed reward amount
- One supported token
- One STRK20 settlement path
- Basic dashboard
- Basic recipient receipt
- Replay protection

### Post-Hackathon Version

- Multiple reward tiers
- Campaign analytics
- Private loyalty points
- Merchant API
- NFT/community reward campaigns
- DAO contributor payouts
- SDK for Starknet apps
- Optional selective disclosure
- Advanced campaign templates

## 17. Open Questions

- Which wallet flow is most reliable for the live demo?
- Which STRK20 helper methods should be used for the cleanest MVP?
- Should the first version support only fixed rewards or also percentage-based commissions?
- Should recipient registration happen before or after conversion approval?
- What data should be stored onchain versus offchain for the demo?

## 18. Final Positioning

VeilMint is not just a private airdrop tool.

It is a private reward settlement layer for Starknet communities, affiliates, contributors, and Web3 growth teams.

The product uses STRK20 where privacy actually matters: hiding who earned rewards, who paid them, and how reward relationships form across the network.
