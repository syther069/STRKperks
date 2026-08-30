# rules.md

# StrkPerks Project Rules

Project rules, standards, and engineering guidelines for building and maintaining StrkPerks.

StrkPerks is a Starknet-native private rewards and referral settlement product using STRK20 privacy infrastructure. These rules exist to keep the application secure, maintainable, judge-ready, and aligned with the hackathon requirements.

---

## 1. What To Use

### Approved Core Stack

| Area | Approved Tooling | Purpose |
|---|---|---|
| Frontend | Next.js | Web application framework |
| Language | TypeScript | Type safety across frontend and utilities |
| Styling | Tailwind CSS | Fast, consistent UI styling |
| Wallet Integration | Starknet React | Starknet wallet connection |
| Starknet Client | starknet.js | Contract reads, writes, and transaction handling |
| Contracts | Cairo | Starknet smart contract development |
| Contract Package Manager | Scarb | Cairo package management |
| Contract Testing | Starknet Foundry | Cairo testing and contract validation |
| Validation | Zod | Runtime validation for forms and payloads |
| Async State | TanStack Query | Fetching, caching, and transaction status polling |
| Local State | Zustand | Lightweight UI state management |
| Testing | Vitest, Playwright | Unit and end-to-end testing |
| Formatting | Prettier | Consistent code formatting |
| Linting | ESLint | Code quality and rule enforcement |

### Approved Architecture Patterns

- Use Starknet as the main execution layer.
- Use STRK20 as the core private reward settlement layer.
- Keep settlement and replay-protection logic inside Cairo contracts.
- Keep frontend logic focused on user flow, validation, and transaction orchestration.
- Use small, focused modules instead of large mixed-purpose files.
- Keep privacy explanations clear and accurate.
- Build the MVP around one complete demo flow.

### Required Product Flow

The application must support this core flow:

```txt
Create campaign
→ Fund campaign with STRK20
→ Approve conversion
→ Claim private reward
→ Block duplicate claim
→ Show transaction proof
2. What To Avoid
Avoid Unsupported Tech Choices

Do not add technologies unless they are clearly needed for the MVP.

Avoid:

Unnecessary backend complexity
Unneeded databases
Unverified crypto libraries
Random npm packages for critical security logic
Custom cryptography unless required by STRK20 documentation
Multi-chain support during the hackathon MVP
Complex AI systems that distract from the STRK20 privacy flow
Heavy UI frameworks that slow down development
Over-engineered microservice architecture
Avoid Bad Architecture Patterns

Do not:

Put private keys, notes, commitments, or secrets in local storage.
Trust frontend-only checks for settlement validity.
Trust backend-only checks for reward claim validity.
Let the backend bypass contract-level validation.
Store sensitive recipient data in plain text.
Claim full privacy if the STRK20 flow does not provide it.
Hardcode production contract addresses directly in components.
Mix contract call logic inside UI components.
Build a broad dashboard before the core private settlement flow works.
Avoid Product Scope Creep

For the hackathon MVP, avoid building:

Full affiliate CRM
Complex analytics platform
Multi-token reward engine
Enterprise compliance suite
Mobile app
AI attribution engine
Multi-chain deployment
Full loyalty marketplace

These can be future roadmap items.

3. Libraries & Dependencies
Allowed Frontend Dependencies
Library	Purpose
next	React application framework
react	UI library
typescript	Static typing
tailwindcss	Styling
starknet	Starknet interaction
@starknet-react/core	Wallet and Starknet React hooks
@tanstack/react-query	Async state and caching
zustand	Local UI state
zod	Schema validation
lucide-react	Icons
clsx	Conditional class handling
tailwind-merge	Tailwind class merging
Allowed Dev Dependencies
Library	Purpose
eslint	Linting
prettier	Formatting
vitest	Unit testing
playwright	End-to-end testing
tsx	TypeScript scripts
dotenv	Environment variable loading
Allowed Cairo / Starknet Tools
Tool	Purpose
Cairo	Smart contract language
Scarb	Cairo package manager
Starknet Foundry	Contract tests
OpenZeppelin Cairo	Standard access control and reusable contract patterns
Dependency Rules
Add a dependency only when it has a clear purpose.
Prefer well-maintained libraries with active usage.
Do not add packages that duplicate existing functionality.
Do not add experimental crypto packages without review.
Keep versions pinned through the lockfile.
Commit the lockfile.
Remove unused dependencies before final submission.
Run audit checks where possible before deployment.
4. Error Handling
General Principles

Errors must be handled clearly, safely, and without exposing sensitive information.

The application should:

Show user-friendly error messages.
Log developer-friendly details only where safe.
Never expose private notes, secrets, keys, or raw sensitive payloads.
Provide retry options for recoverable transaction errors.
Make failed transaction states obvious.
Avoid silent failures.
User-Facing Error Messages

Use simple messages such as:

Wallet not connected. Please connect your Starknet wallet.
Wrong network. Please switch to the required Starknet network.
Transaction rejected in wallet.
Transaction failed. Please try again.
This conversion has already been claimed.
Campaign has expired. Rewards can no longer be claimed.
Campaign budget is insufficient.
You are not authorized to perform this action.
Contract Error Handling

Cairo contracts should reject invalid states early.

Required checks:

Campaign exists.
Caller is campaign owner where required.
Campaign is active.
Campaign has not expired.
Conversion is approved.
Nullifier has not been used.
Reward amount is valid.
Campaign budget is sufficient.
Settlement request is valid.
Frontend Error Handling

Frontend must handle:

Wallet disconnected
Wrong network
User rejected transaction
Pending transaction
Failed transaction
Reverted transaction
RPC failure
Invalid form input
Duplicate claim error
Missing campaign data
Logging Rules
Log transaction hashes.
Log contract addresses.
Log public campaign IDs.
Do not log private notes.
Do not log private keys.
Do not log raw secrets.
Do not log sensitive recipient data.
Do not expose internal stack traces to users.
5. Boundaries Of AI

AI can assist with development, but it must not replace protocol truth, security review, or official documentation.

AI Can Be Used For
Drafting documentation
Generating UI copy
Explaining Starknet and STRK20 flows
Suggesting test cases
Creating demo scripts
Reviewing code structure
Improving README quality
Creating placeholder data for local demos
Helping prepare hackathon submission materials
AI Must Not Be Used For
Inventing unsupported STRK20 behavior
Claiming privacy guarantees not proven by the protocol
Writing final cryptographic logic without verification
Creating fake transaction hashes
Creating fake deployment proof
Fabricating hackathon requirements
Fabricating official documentation
Making security claims without tests or evidence
Storing or handling private keys
Replacing proper contract testing
AI Output Rules

All AI-generated technical claims must be checked against:

Official STRK20 documentation
Official Starknet documentation
Actual code implementation
Contract tests
Deployment evidence
Hackathon rules and judging criteria

If a feature is not implemented, documentation must say planned, mocked, or not included in MVP.

6. General Rules
6.1 Code Style And Formatting
Use TypeScript for frontend and shared logic.
Use Cairo for Starknet contracts.
Use Prettier for formatting.
Use ESLint for frontend linting.
Keep files focused and readable.
Avoid files that mix UI, contract calls, validation, and business logic.
Prefer named exports for shared utilities.
Keep components small and composable.
Remove unused code before final submission.
Frontend Rules
UI components go in components/.
Contract call helpers go in lib/starknet/.
STRK20 helpers go in lib/strk20/.
Campaign business logic goes in lib/campaign/.
Validation schemas go in lib/validation/.
Hooks go in hooks/.
Do not place complex contract logic directly inside React components.
Contract Rules
Keep contracts modular.
Use clear interface files.
Use events for important state changes.
Write tests for critical state transitions.
Keep replay protection simple and auditable.
Avoid unnecessary contract complexity for the MVP.
6.2 Naming Conventions
Project Naming
Product name: StrkPerks
Repository name: strkperks
Main docs:
README.md
PRD.md
ARCHITECTURE.md
rules.md
phases.doc.md
File Naming
React components: PascalCase.tsx
Hooks: useSomething.ts
Utility files: camelCase.ts
Validation files: somethingSchema.ts
Cairo files: snake_case.cairo
Docs: lowercase-or-uppercase.md, but stay consistent
Variable Naming
TypeScript variables: camelCase
TypeScript types/interfaces: PascalCase
Constants: UPPER_SNAKE_CASE
Cairo functions: snake_case
Cairo storage fields: snake_case
Campaign IDs: campaignId
Conversion IDs: conversionId
Nullifiers: nullifier
6.3 Commit Message Guidelines

Use clear commit messages.

Preferred format:

type(scope): short description

Examples:

feat(wallet): add starknet wallet connection
feat(campaign): create campaign form
feat(contract): add nullifier registry
feat(strk20): add private reward settlement helper
fix(claim): handle duplicate claim error
docs: add architecture document
test(contract): add duplicate claim tests

Allowed commit types:

feat
fix
docs
test
refactor
chore
style

Rules:

Keep commits small.
Do not commit broken builds.
Do not commit .env.
Do not commit private keys.
Do not commit generated junk files.
Include docs updates when behavior changes.
6.4 Security And Data Privacy Rules
Required Security Rules
Never store private keys in the repo.
Never expose private keys in logs.
Never store private notes in local storage.
Never hardcode secrets.
Use .env.example for required variables.
Keep .env ignored.
Validate all user input.
Validate all campaign and conversion data.
Use contract-level authorization.
Use nullifiers to prevent duplicate claims.
Use official Starknet and STRK20 patterns where possible.
Privacy Rules

StrkPerks must clearly explain what it hides and what it does not hide.

Do not claim:

Complete anonymity
Perfect privacy
Untraceable transactions
Guaranteed regulatory compliance
Hidden timing data unless proven

Allowed claims:

Private reward settlement
Reduced public reward graph leakage
Recipient wallet not directly exposed in the settlement flow
Campaign-scoped duplicate claim protection
STRK20-powered private reward notes
6.5 Performance And Scalability Guidelines
Frontend Performance
Avoid unnecessary re-renders.
Use TanStack Query for cached async data.
Poll transaction status efficiently.
Avoid excessive RPC calls.
Batch reads where possible.
Use loading skeletons for slow states.
Keep pages responsive on mobile and desktop.
Avoid large client bundles.
Contract Performance
Keep storage writes minimal.
Avoid unnecessary loops.
Avoid storing large metadata onchain.
Store hashes or references instead of full text where appropriate.
Use events for indexable state.
Keep nullifier checks direct and efficient.
Scalability Direction

The MVP can use simple indexing, but future versions should support:

Event indexing
Campaign pagination
Multiple reward tiers
Merchant API
SDK integrations
Analytics without leaking sensitive user relationships
6.6 Documentation Standards

Required docs:

README.md
PRD.md
ARCHITECTURE.md
rules.md
phases.doc.md
docs/privacy-model.md
docs/strk20-integration.md
docs/demo-script.md
docs/deployment.md

Documentation must:

Be clear and practical.
Explain how to run the project locally.
Explain deployed contract addresses.
Explain STRK20 usage.
Explain privacy boundaries.
Explain demo steps.
Avoid fake claims.
Mark incomplete features clearly.

Use these labels when needed:

Implemented
Planned
Mocked for demo
Out of scope for MVP
6.7 Testing Rules
Required Before Submission

Run:

pnpm lint
pnpm test
pnpm build
snforge test
Required Test Coverage

Contract tests must cover:

Campaign creation
Owner-only conversion approval
Claim before approval rejection
Expired campaign rejection
Duplicate claim rejection
Nullifier consumption
Closed campaign rejection
Invalid reward amount rejection

Frontend tests should cover:

Wallet disconnected state
Wrong network state
Campaign form validation
Transaction pending state
Transaction success state
Transaction failure state
Duplicate claim UI
Recipient receipt UI

End-to-end demo should cover:

Create campaign
→ Fund campaign
→ Approve conversion
→ Claim reward
→ Attempt duplicate claim
→ Show rejection
6.8 UI And UX Rules
UI must be clear enough for hackathon judges to understand quickly.
Every transaction should show status.
Every failed action should explain what happened.
Explorer links must be visible after transaction submission.
Privacy claims must be written in plain language.
Avoid overly complex dashboards before the core demo works.
Use consistent spacing, typography, and button styles.
Do not hide important states behind vague loading indicators.
Do not use fake metrics unless clearly marked as demo data.
6.9 Hackathon Submission Rules

The final submission must include:

Working frontend URL
Public GitHub repository
Deployed Starknet contract addresses
Starknet explorer links
Demo video
PRD
Architecture document
Rules document
Project phases document
STRK20 integration explanation
Privacy model explanation
Setup instructions

The submission must clearly prove:

Starknet is used.
STRK20 is used meaningfully.
The private reward flow works.
Duplicate claims are blocked.
The product solves a real privacy problem.
The MVP is practical and buildable.
7. Final Engineering Rule

Do not build a broad product with weak privacy.

Build a narrow, complete, verifiable private reward settlement flow.

For StrkPerks, the strongest hackathon demo is:

Campaign created
→ Campaign funded with STRK20
→ Conversion approved
→ Reward privately settled
→ Duplicate claim rejected
→ Starknet proof shown