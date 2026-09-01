# StrkPerks Design System

## Status & Scope

**Planned direction:** Signal Vault is the authoritative visual and interaction
standard for StrkPerks. It defines the production product experience and the
explicitly separated `/demo` experience.

**Partially implemented:** the current Next.js app has a dark, dashboard-first
shell, wallet controls, form components, transaction-state components, and
some reduced-motion handling. Its existing surfaces, gradients, radii, and
demo-backed product routes do not yet fully conform to this document.

**Demo-only today:** synthetic campaigns, balances, transactions, receipts,
and local claim outcomes. They must remain visibly simulated and must never be
used as live proof.

This document is a design standard, not evidence of a deployed contract,
working privacy wallet, confirmed private note, or live STRK20 settlement.

---

## 1. Product Design Brief

StrkPerks is a Starknet-native reward-settlement product. It is not a
marketing-first crypto site and not a generic DeFi dashboard. The interface is
a **reward intelligence console**: an operational space where campaign owners
can inspect reward capital, approvals, settlement state, and verifiable public
evidence.

The product should borrow the clarity, confidence, restrained motion, and data
hierarchy of a strong command center without implying that AI participates in
the protocol. Every claim about Starknet or STRK20 must be factual and
verifiable.

The intended production flow is:

```text
Create campaign
-> Public ERC-20 approval
-> Fund reward pool
-> Approve exact conversion
-> Submit private reward settlement
-> Prevent duplicate claim
-> Verify on Starknet
```

Funding is public. Only a successfully verified STRK20 settlement may be
described as creating a private note.

## 2. Design North Star: Signal Vault

StrkPerks should feel deliberate, private, technically credible, and calm
under transaction pressure. It is premium through precision rather than
decoration: a compact financial operations console with a protocol-aware
evidence layer.

The signature motif is a low-contrast **Signal Field**: fine routed lines,
small coordinates, or a constrained settlement shimmer. Use it only behind
content in a dashboard empty state, page-level loading state, judge proof
panel, or confirmed claim receipt. It must not carry information, interfere
with contrast, or become a full-page wallpaper.

Do not use blurred blobs, floating orbs, noisy particles, stock 3D objects,
purple-blue Web3 auroras, rainbow borders, decorative CTA gradients, excessive
glass, or cards inside cards.

## 3. Product Truth & State Language

The interface must make the next action obvious and show the protocol rather
than treating it as a mystery box.

- Use `Draft` -> `Funded` -> `Approvals ready` -> `Claimed` -> `Verified` only
  where an authoritative state source supports the label.
- Use `Submitted` only after a wallet returns a real transaction hash.
- Use `Confirmed` only after Starknet receipt confirmation and any required
  state or event refresh.
- Use `Private note created` only when a supported STRK20 wallet reports an
  actual note result.
- Use `Simulation` or `Mocked for demo` persistently for synthetic data and
  local outcomes. Synthetic hashes never receive explorer links.
- Do not call a mocked result `private`, `shielded`, or `verified`.

Prefer plain operator language: `Reward pool`, `Settlement status`, and
`Duplicate claim blocked`. Put terms such as `nullifier` and `commitment` in a
secondary technical row with concise explanations.

Every transactional view should answer without scrolling:

1. What campaign is this?
2. What is ready now?
3. What happens after this action?
4. What evidence will be available?

## 4. Layout Architecture

The production shell uses a stable navigation rail, compact command bar, and
fluid work surface. On large screens the rail is `240px` and the command bar
is `64px`; forms retain a constrained reading width. An evidence rail may show
transaction progress, proof rows, or contextual help when the task requires
it.

```text
Left rail     Product identity, navigation, campaign context
Command bar   Network, wallet, global action, account menu
Work surface  Page title, current state, dominant action, working data
Evidence rail Transaction progress, proof, privacy disclosure, recovery
```

- Tablet: collapse the rail while preserving labels on hover and focus.
- Mobile: use a top app bar and fixed primary navigation above the safe area.
- Reflow tables into labelled rows on small screens; do not require horizontal
  scrolling for a primary flow.
- Use spacing, grouping, and dividers before adding a panel. A panel must
  frame a real object, decision, or action.
- Do not introduce a separate landing-page visual language. The first route is
  a useful operations surface.

## 5. Color System

Dark mode, **Signal Vault**, is the reference implementation.

| Token | Value | Purpose |
| --- | --- | --- |
| `canvas` | `#0A0D0D` | Application background |
| `surface` | `#111616` | Main panel and control surface |
| `surface-raised` | `#171D1C` | Active panel, modal, expanded state |
| `surface-inset` | `#0D1110` | Code, hashes, technical data |
| `border-subtle` | `#27302E` | Default separation |
| `border-strong` | `#3C4844` | Focused or selected separation |
| `text-primary` | `#F3F1EA` | Primary content |
| `text-secondary` | `#B4BDB7` | Supporting content |
| `text-muted` | `#77817B` | Metadata |
| `action` | `#FF6A38` | Decisive action |
| `action-hover` | `#FF8358` | Action hover |
| `action-pressed` | `#D64B21` | Action pressed |
| `reward` | `#C8FA63` | Reward value and confirmed settlement |
| `privacy` | `#50DCC5` | Privacy and proof context |
| `pending` | `#F6C85F` | Awaiting confirmation |
| `danger` | `#F06A6A` | Failure or rejected claim |
| `info` | `#79B7FF` | Neutral protocol information |

Persimmon changes state; lime denotes value or confirmed success; cyan denotes
privacy/proof context; red denotes failure or rejection. Do not use color as
the sole status signal. Essential text and controls must meet WCAG AA contrast.

**Planned light theme:** Paper Ledger, a warm technical ledger rather than an
inverted dark interface. It begins only after Signal Vault is complete.

| Token | Value |
| --- | --- |
| `canvas` | `#F6F4EE` |
| `surface` | `#FFFFFF` |
| `surface-raised` | `#EEEDE6` |
| `surface-inset` | `#E8E8E0` |
| `border-subtle` | `#D5D8CD` |
| `text-primary` | `#19201D` |
| `text-secondary` | `#59635D` |
| `text-muted` | `#7A837D` |
| `action` | `#D85228` |
| `reward` | `#50730B` |
| `privacy` | `#007F70` |
| `pending` | `#9A6300` |
| `danger` | `#B83939` |

## 6. Typography, Spacing & Data

| Role | Font | Use |
| --- | --- | --- |
| Interface | Inter | Navigation, labels, body, forms, buttons |
| Display | Space Grotesk | Page titles and key value moments only |
| Protocol data | JetBrains Mono | Addresses, hashes, IDs, code-like states |

| Style | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| Page title | `32px / 40px` | 650–700 | One per page |
| Section title | `20px / 28px` | 650 | Major group |
| Panel title | `16px / 24px` | 600 | Panel header |
| Body | `15px / 24px` | 400 | Default prose |
| Supporting | `13px / 20px` | 400–500 | Help and metadata |
| Label | `12px / 16px` | 600 | Inputs and column labels |
| Mono data | `13px / 20px` | 500 | Hashes, amounts, proof data |

Use sentence case. Never use negative letter spacing. Reserve display text for
page titles and key amounts, use tabular numerals for data columns, and align
numeric columns right. Truncate long addresses visually but always provide copy
and a hover/focus method to reveal the full value.

The spacing scale should support dense, operational work without crowding:
`8`, `12`, `16`, `24`, `32`, `48`, and `64px`. Prefer a divider or an inset
over a nested card. Panels use an `8px` radius; controls use `6px`; pills are
only for compact status or filters.

## 7. Components & Interaction

### Buttons

| Variant | Purpose | Treatment |
| --- | --- | --- |
| Primary | One decisive page action | Persimmon fill, dark text, `40px` minimum height |
| Secondary | Supporting action | Raised surface with strong border |
| Tertiary | Low-emphasis action | Text with subtle hover surface |
| Danger | Irreversible action or recovery | Restrained red; never the default |
| Icon | Familiar utility | Labelled icon, tooltip, visible focus ring |

Use specific outcome labels: `Create campaign`, `Fund reward pool`, `Approve
conversion`, `Claim reward`, `View transaction`, and `Retry claim`. A pending
button keeps its original action label, adds a compact spinner, and prevents a
duplicate request.

### Status, Proof & Timeline

Status requires an icon, words, and a color signal.

| Condition | Required copy |
| --- | --- |
| Awaiting receipt | `Pending on Starknet` |
| Confirmed receipt and state | `Confirmed` |
| Privacy capability available | `Privacy-aware` |
| Demo data/action | `Mocked for demo` or `Simulation` |
| Verified replay evidence | `Duplicate claim blocked` |
| Campaign disabled | `Paused` or `Closed` |

A proof row contains a semantic label, plain-language status, compact
monospace identifier when real public data exists, copy action, and explorer
link only for a real hash/address. It includes a privacy annotation when a
value is intentionally unavailable.

Use a vertical timeline for multi-step work. Each node has state icon, title,
timestamp or relative state, short detail, hash when submitted, and a recovery
action. Name pending work: `Waiting for wallet confirmation`, `Submitting to
Starknet`, or `Waiting for block confirmation`; do not leave a permanent vague
loader.

### Forms, Empty States & Errors

- Associate every input with a visible label and concise requirements.
- Validate before wallet interaction and show the correction beside the field.
- Show a review step with amount, asset, recipient privacy boundary, and fee
  implications before a write.
- Put advanced protocol fields behind a named disclosure, never an unexplained
  icon.
- Empty campaign list: explain the absence and offer `Create campaign`.
- Wallet disconnected: state why a wallet is needed and offer `Connect wallet`.
- Wrong network: name the required Starknet network and offer `Switch network`.
- Failed transaction: explain the failure, retain the submitted hash when one
  exists, and provide a recovery action.

## 8. Page Blueprints

### Dashboard: Reward Operations

One primary action: `Create campaign`. Show live campaign health, a prioritized
campaign list, recent settlement activity, and one concise privacy-boundary
disclosure. Never manufacture metrics. In demo mode, label the entire data
source as simulated.

### Campaign Detail: Settlement Workspace

Show campaign identity, status, asset, owner, and explorer link when verified.
Lead with the reward-pool value and remaining amount; use a single changing
action area for fund, approve, pause, or review. Pair the conversion queue
with a settlement timeline and proof rows.

### Create Campaign: Configuration Flow

Use a single-column form plus persistent desktop review panel. Group fields as
`Campaign`, `Reward pool`, and `Claim rules`; show the transaction preview and
the public/private boundary. After a live creation, show only the returned
address and transaction evidence. A simulation is explicitly `Mocked for
demo`.

### Claim: Recipient Moment

Keep focus on campaign, reward amount, eligibility, wallet capability,
privacy boundary, and claim action. Explain `client-side secret`, public app
nullifier, and wallet-reported STRK20 result distinctly. Completion is a
receipt with amount, status, evidence, and duplicate-claim rule—not a
celebratory splash screen.

### Activity & Docs

Activity is an evidence list of real submitted/confirmed transactions on
production routes. Docs explain current protocol boundaries, deployment state,
and recovery steps in plain language.

### Judge Demo

`/demo` is a guided proof narrative, not a disguised product surface. It shows
what is implemented, mocked, public, and private at every stage. Its sequence
is create, fund, approve, submit, evidence, replay attempt, and rejection. A
synthetic step never generates explorer proof.

## 9. Motion, Responsive Behaviour & Accessibility

- Use `160–220ms` ease-out transitions for controls and surfaces; motion only
  confirms state, directs attention, or preserves orientation.
- Respect `prefers-reduced-motion`; no meaning may depend on animation.
- Do not use looping decorative motion, parallax, springy cards, or confetti.
- Start mobile as one column, then add rail and evidence column progressively.
- Preserve primary actions above mobile safe areas and use `44px` minimum touch
  targets.
- Use semantic landmarks, keyboard navigation, visible `:focus-visible`
  outlines, associated labels, accessible names for icon controls, and text
  plus icon for destructive/security/transaction actions.
- Support empty, loading, error, disabled, selected, expanded, and recovery
  states. Do not depend solely on hover.

## 10. Product/Demo Boundary

**Planned production routes** are `/`, `/campaigns`, `/campaigns/create`,
`/campaigns/[address]`, `/claim/[campaignAddress]`, `/activity`, and `/docs`.
They may use only a connected Starknet wallet, deployed addresses, live RPC
reads, real hashes, confirmed receipts, authentic STRK20 capabilities, and
verified explorer links.

**Current gap:** several existing product routes import the demo Zustand store
and fixture data. Until that is removed, those routes must be treated as
demo-backed, not production evidence.

`/demo` must retain persistent Simulation labeling, an isolated store and
feature module, and an `Open live product` exit. Production components may not
import demo fixtures, local balances, synthetic wallets, receipts, hashes, or
claim-success logic. Unsupported STRK20 capability shows an unsupported-wallet
state; it never falls back to a fake settlement.

## 11. Review Gate

Before a major UI change and after implementation, review the affected surface
using these skills and the applicable repository code:

| Skill | Review purpose |
| --- | --- |
| `frontend-design` | Subject-specific hierarchy, flow, component vocabulary, and responsive states |
| `web-design-guidelines` | Semantic controls, focus, labels, contrast, motion, and usability fundamentals |
| `anti-ui-slop` | Product-specific density, restraint, honest empty states, and removal of stock patterns |
| `ui-ux-pro-max` | Accessibility, touch, responsive, typography, color, and feedback checks |
| `redesign-existing-projects` | Targeted refinement without breaking established behavior |

The review passes only when the first viewport identifies the operator’s next
action; all data sources are honest; every transaction has a named state,
error meaning, and evidence path; privacy language matches the active
integration; the system avoids generic Web3 decoration; and the mobile and
keyboard paths remain complete.

## 12. Final Standard

StrkPerks should look like a focused Starknet protocol product that understands
financial consequence. Its premium quality comes from information clarity,
disciplined signals, honest proof, and a visual language owned by the product.

Do not ship fake AI insights, fake metrics, fake scores, decorative Web3
gradients, glowing orbs, excessive glassmorphism, nested cards, ambiguous
actions, or a claim receipt that implies a real note when the result is
simulated.
