# design.md

# StrkPerks Design System

UI/UX guidelines and visual design standards for the StrkPerks application.

StrkPerks is a Starknet-native private rewards product. The interface should feel sharp, private, technical, and trustworthy. It should not look like a generic Web3 landing page. The design must prioritize clarity, transaction confidence, and judge-friendly demo flow.

---

## 1. UI/UX Principles

### Core UX Goal

Users should understand exactly what is happening at every step:

```txt
Create campaign
→ Fund with STRK20
→ Approve conversion
→ Settle private reward
→ Block duplicate claim
→ Show proof

The product should feel like a serious protocol dashboard, not a marketing page.

UX Rules
Use a clean dashboard-first layout.
Keep the main action visible on every important screen.
Show transaction state clearly: idle, pending, confirmed, failed, rejected.
Always show what is public and what is private.
Avoid vague labels like Submit when a specific action is possible.
Use direct labels like Create Campaign, Fund Campaign, Approve Conversion, Claim Reward.
Do not overload users with protocol jargon.
Use helper text only where it improves confidence.
Keep the demo flow simple enough for a judge to understand in under 3 minutes.
Mobile-First Rules
Primary actions must be reachable on mobile without horizontal scrolling.
Campaign cards must stack cleanly on small screens.
Tables should become cards on mobile.
Transaction timeline must remain readable on mobile.
Wallet address should be shortened on mobile.
Avoid tiny text below 12px.
Accessibility Rules
Maintain readable contrast.
Use visible focus states.
Buttons must have clear hover, active, disabled, and loading states.
Do not rely only on color to show success or failure.
Use labels for form inputs.
Error messages must explain the fix, not just the problem.
2. Visual Direction
Design Personality

StrkPerks should feel:

Private
Precise
Founder-grade
Starknet-native
Technical but readable
Calm, not noisy
Premium without being flashy

Avoid:

Neon overload
Purple-blue generic Web3 gradients
Random glowing orbs
Glassmorphism everywhere
Cartoon crypto visuals
Giant landing-page hero sections
Fake AI dashboard clutter
Over-rounded cards
Too many shadows
Layout Style

Use a dense but clean protocol dashboard style.

Preferred layout:

Left sidebar on desktop
Top wallet/action bar
Main content panel
Cards for repeated campaign items only
Full-width sections for major views
Transaction timeline on the right or below primary action
Clear empty states
3. Color & Theme

The theme should be dark-first with a distinct Starknet/privacy identity.

Primary Theme: Obsidian Citrus

This is the main StrkPerks theme.

Token	Color	Usage
Background	#090A0A	Main app background
Surface	#111313	Cards, panels
Surface Raised	#181B1B	Modals, active cards
Border	#2A2F2E	Panel borders
Primary	#FF5A1F	Main CTA, Starknet action color
Primary Hover	#E84C14	CTA hover
Accent	#B7FF5A	Success highlights, reward signal
Secondary Accent	#3CE7C7	Privacy/note indicators
Text Primary	#F4F1EA	Main text
Text Secondary	#A7ADA8	Supporting text
Text Muted	#6F7772	Metadata
Success	#7CFF8A	Confirmed state
Warning	#FFD166	Pending/caution state
Error	#FF5C5C	Failed/rejected state
Why This Palette Works
Black/charcoal gives the product a private protocol feel.
Starknet-like orange creates ecosystem alignment.
Acid green represents rewards without looking like generic DeFi.
Cyan-teal represents shielded notes and privacy states.
Warm off-white keeps text readable and less harsh than pure white.
Light Theme: Ledger Paper

Use only if light mode is implemented.

Token	Color	Usage
Background	#F7F4ED	Main background
Surface	#FFFFFF	Cards, panels
Surface Raised	#F1EDE3	Secondary panels
Border	#D9D2C3	Dividers
Primary	#D94313	Main CTA
Primary Hover	#BA350C	CTA hover
Accent	#617A00	Reward highlight
Secondary Accent	#007C70	Privacy state
Text Primary	#151515	Main text
Text Secondary	#555D58	Supporting text
Text Muted	#7C837E	Metadata
Success	#16803A	Confirmed
Warning	#A86B00	Pending
Error	#B42318	Failed
Color Usage Rules
Primary orange is for main actions only.
Accent green is for reward value, success, and positive settlement.
Cyan/teal is for privacy-related UI: notes, shielded state, hidden recipient.
Red is only for actual errors or rejected claims.
Do not use gradients as the main design language.
Do not create a one-color UI.
Do not overuse glowing effects.
4. Typography
Font System

Use a clean technical font pairing.

Role	Font
Primary UI Font	Inter
Numeric / Code Font	JetBrains Mono
Optional Display Font	Space Grotesk
Font Usage
Use Inter for most UI text.
Use JetBrains Mono only for addresses, hashes, campaign IDs, transaction IDs, and numeric protocol data.
Use Space Grotesk only for main product title or major page headers if needed.
Type Scale
Style	Size	Weight	Usage
H1	32px	700	Main page title
H2	24px	650	Section title
H3	18px	600	Card title
Body	15px	400	Normal text
Body Small	13px	400	Supporting text
Label	12px	600	Form labels, status labels
Mono Data	13px	500	Address/hash/data
Button	14px	600	Buttons
Typography Rules
Do not use oversized hero text inside dashboard cards.
Keep line height comfortable: 1.45 to 1.6.
Do not use negative letter spacing.
Use uppercase only for small labels, not paragraphs.
Keep wallet addresses and hashes in monospace.
Avoid mixing more than two font families in the UI.
5. Components
Buttons

Button types:

Primary: main action
Secondary: less important action
Ghost: navigation or low-priority action
Danger: destructive or rejected action

Button rules:

Primary buttons use orange.
Disabled buttons must clearly look disabled.
Loading buttons should show spinner and action text.
Button text must be specific.

Good examples:

Create Campaign
Fund Campaign
Approve Conversion
Claim Reward
View Explorer
Retry Transaction

Bad examples:

Submit
Go
Continue without context
Click Here
Cards

Use cards only for:

Campaign items
Stats
Transaction proof
Recipient receipt
Claim state
Empty states

Card style:

Border radius: 8px
Border: 1px solid #2A2F2E
Background: #111313
Avoid heavy shadows
Avoid nested cards
Forms

Form rules:

Every input must have a label.
Every required field must be clear.
Validation should happen before wallet transaction.
Use helpful errors.
Use placeholders only as examples, not labels.
Status Badges

Status badges:

Status	Color
Active	Green
Pending	Yellow
Expired	Muted gray
Closed	Gray
Failed	Red
Private	Cyan
Shielded	Cyan
Claimed	Green
Duplicate Blocked	Red
Transaction Timeline

Every important transaction should show:

Step name
Current status
Transaction hash if available
Explorer link
Error message if failed
Retry option if recoverable
6. Page Design Guidelines
Dashboard Page

Must include:

Campaign overview stats
Campaign list
Main CTA: Create Campaign
Wallet status
Recent transactions
Privacy model summary
Create Campaign Page

Must include:

Campaign form
Reward configuration
Budget configuration
Validation states
Preview before transaction
Create campaign transaction state
Campaign Detail Page

Must include:

Campaign status
Campaign budget
Funding panel
Conversion approval panel
Claim count
Duplicate claims blocked
Explorer links
Claim Page

Must include:

Campaign name
Reward amount
Claim status
Wallet connection
Privacy note explanation
Claim button
Recipient receipt after success
Demo Page

Must include:

Step-by-step guided flow
Judge proof panel
Explorer links
Duplicate claim demonstration
STRK20 integration explanation
7. Memory: UI Preferences

These preferences should be remembered while building the product.

Theme Preference
Default theme: dark mode
Primary design style: protocol dashboard
Avoid generic Web3 gradients
Avoid cartoonish visuals
Avoid glassmorphism-heavy UI
Layout Preference
Desktop: sidebar + main content
Mobile: bottom or top navigation
Dashboard-first, not landing-page-first
Cards only for repeated items and focused panels
No nested cards
Typography Preference
UI font: Inter
Data font: JetBrains Mono
Optional display font: Space Grotesk
Use medium and semibold weights for structure
Avoid overly thin fonts
Interaction Preference
Clear transaction states
Explorer links after every important transaction
Plain-language privacy explanations
Strong empty states
Specific button labels
8. Final Design Rule

StrkPerks should not look like a template.

It should look like a serious privacy rewards protocol built for Starknet builders.

The best visual direction is:

Dark protocol dashboard
+ Starknet orange
+ reward acid green
+ privacy cyan
+ restrained typography
+ clear transaction proof

```md
# memory.md

# StrkPerks Project Memory

Project memory for tracking progress, decisions, current work, and important context.

This file should help keep the project consistent across development sessions. Update it whenever a major decision is made, a feature is completed, or a blocker is discovered.

---

## 1. Project Memory

### Project Name

`StrkPerks`

### Product Summary

StrkPerks is a Starknet-native private rewards and referral settlement product built with STRK20.

It helps Web3 projects create private reward campaigns, fund them through STRK20, approve valid conversions, and settle rewards into recipient-owned private notes while preventing duplicate claims using campaign-scoped nullifiers.

### Core Product Flow

```txt
Create campaign
→ Fund campaign with STRK20
→ Approve conversion
→ Claim private reward
→ Block duplicate claim
→ Show transaction proof
Main Users
Starknet project teams
Web3 communities
Affiliates
Contributors
DAO members
Hackathon judges reviewing the demo
Current Product Positioning

StrkPerks is not a generic rewards dashboard.

It is a private reward settlement layer for Starknet communities using STRK20.

2. Key Decisions
Product Decisions
Decision	Status	Notes
Product name changed from GhostRewards to StrkPerks	Final	Better Starknet alignment
MVP focuses on private rewards	Final	Avoid broad affiliate CRM scope
Duplicate claim prevention is required	Final	Important for judge demo
STRK20 must be core to settlement	Final	Not just branding
Dashboard-first UX	Final	Better for protocol product
Dark protocol theme	Final	Matches privacy/product identity
Technical Decisions
Decision	Status	Notes
Frontend framework: Next.js	Planned	Use TypeScript
Styling: Tailwind CSS	Planned	Keep design consistent
Wallet: Starknet React + starknet.js	Planned	Starknet wallet support
Contracts: Cairo	Planned	Starknet-native contracts
Contract testing: Starknet Foundry	Planned	Required for nullifier tests
Validation: Zod	Planned	Forms and payload validation
Async state: TanStack Query	Planned	Transaction polling and caching
Local UI state: Zustand	Planned	Lightweight state only
Design Decisions
Decision	Status	Notes
Default theme: dark	Final	Obsidian Citrus palette
Primary color: Starknet orange	Final	#FF5A1F
Reward accent: acid green	Final	#B7FF5A
Privacy accent: cyan-teal	Final	#3CE7C7
UI font: Inter	Final	Clean and readable
Data font: JetBrains Mono	Final	Addresses, hashes, numeric protocol data
Avoid generic Web3 gradient design	Final	Product should feel serious
3. What Happened

Use this section to log major updates.

Update Log
2026-08-26
Selected project idea: private rewards and referral settlement using STRK20.
Original name was GhostRewards.
Name changed to StrkPerks.
PRD content created.
Architecture document created.
Project phases document created.
Project rules document created.
Design direction defined:
Dark protocol dashboard
Starknet orange
Acid green reward accent
Cyan privacy accent
Inter + JetBrains Mono typography
Completed Documents
Document	Status
PRD.md	Drafted
ARCHITECTURE.md	Drafted
phases.doc.md	Drafted
rules.md	Drafted
design.md	Drafted
memory.md	Drafted
4. Currently Working On

Current focus:

Preparing project documentation and implementation structure for StrkPerks.

Active work items:

Finalize project docs.
Add docs into project folder.
Prepare clean implementation prompt for coding agent.
Start MVP implementation only after project docs and build plan are approved.

Current priority:

Build a narrow, complete, judge-ready MVP instead of a broad unfinished dashboard.
5. Pending Work
Documentation
Review PRD for final product name: StrkPerks.
Ensure all old GhostRewards references are replaced.
Add final hackathon criteria alignment.
Add STRK20 integration notes.
Add demo script.
Add deployment checklist.
Development
Initialize Next.js app.
Set up Starknet wallet connection.
Build dashboard layout.
Build campaign creation flow.
Write Cairo campaign contracts.
Add nullifier registry.
Add STRK20 settlement integration.
Build claim page.
Add transaction timeline.
Add duplicate claim demo.
Write tests.
Deploy demo.
Demo Preparation
Prepare demo campaign.
Prepare sample recipient flow.
Prepare duplicate claim attempt.
Prepare explorer links.
Record short demo video.
Finalize README.
6. Blockers And Risks
Current Risks
Risk	Impact	Mitigation
STRK20 docs/API uncertainty	High	Verify against official docs before implementation
Privacy overclaiming	High	Clearly explain privacy boundaries
Too much scope	High	Focus only on one settlement flow
Contract complexity	Medium	Keep Cairo contracts small and testable
Wallet compatibility	Medium	Choose one reliable Starknet wallet flow for demo
Demo instability	High	Create a guided demo page and test repeatedly
Important Rule

Do not claim a feature is implemented unless it exists in code and can be demonstrated.

Use these labels in docs when needed:

Implemented
Planned
Mocked for demo
Out of scope for MVP
7. Project Standards To Remember
Engineering Standards
Use TypeScript.
Use Cairo for contracts.
Use strict validation.
Keep modules small.
Keep contract logic separate from UI.
Keep STRK20 logic inside dedicated helper files.
Do not store secrets in frontend state or local storage.
Do not hardcode contract addresses in components.
UX Standards
Dashboard-first product.
Clear transaction states.
Clear wallet states.
Specific CTA labels.
Plain-language privacy model.
No generic crypto template UI.
No fake metrics unless labeled as demo data.
Submission Standards

Final hackathon submission must include:

Live app
Public repo
Deployed contracts
Starknet explorer links
Demo video
README
PRD
Architecture
Design system
Rules
Phases
STRK20 integration explanation
Privacy model
8. Next Steps

Recommended next work order:

Replace all old GhostRewards references with StrkPerks.
Add all documentation files to the project.
Create the frontend app structure.
Set up Starknet wallet connection.
Build campaign dashboard.
Implement Cairo campaign contracts.
Implement nullifier registry.
Connect STRK20 private settlement flow.
Build claim page and recipient receipt.
Add duplicate claim rejection demo.
Test and deploy.
9. Purpose Of This File

This file keeps project context accurate across work sessions.

Use it to:

Remember decisions.
Track what has been completed.
Track what is currently being built.
Avoid repeating old work.
Avoid changing direction without reason.
Keep product, design, and engineering decisions consistent.

Update this file whenever the project changes in a meaningful way.

---

## 9. Frontend Design Skills Usage

StrkPerks should use high-quality frontend design guidance from Skills.sh to avoid generic AI-generated UI and maintain a professional product experience.

### Required Skills.sh References

Use the following frontend design skills as design guidance before implementing or reviewing the UI:

| Skill | Purpose |
|---|---|
| `frontend-design` | Improve layout, spacing, hierarchy, component structure, and interaction quality |
| `web-design-guidelines` | Apply strong web design principles for usability, accessibility, responsiveness, and visual polish |
| `anti-ui-slop` | Prevent generic AI UI patterns, weak spacing, random gradients, fake dashboard clutter, and low-quality visual decisions |
| `design-taste-frontend` | Improve visual taste, typography, color balance, product feel, and overall UI judgment |

### Suggested Skill Sources

```txt
https://www.skills.sh/anthropics/skills/frontend-design
https://www.skills.sh/vercel-labs/agent-skills/web-design-guidelines
https://www.skills.sh/site/uizze.com/anti-ui-slop
https://www.skills.sh/leonxlnx/taste-skill/design-taste-frontend


10. Final Memory Note

The strongest version of StrkPerks is not a large product with many unfinished features.

The strongest version is a polished, working privacy rewards demo:

Campaign created
→ STRK20 funding shown
→ Conversion approved
→ Private reward settled
→ Duplicate claim blocked
→ Starknet proof displayed 

