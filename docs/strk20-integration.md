# STRK20 integration

StrkPerks uses the Starknet Wallet API route for a user-facing dapp. The
connected privacy wallet advertises Wallet API 0.10.3 or newer, prepares the
STRK20 action batch, creates the proof, submits it, and later discovers the
note. The browser does not hold the claimant's privacy keys.

The batch contains an open-note `transfer` followed by an `invoke` of the
StrkPerks anonymizer. Preparation resolves `${openNoteIds[0]}`. That exact note
ID is included in the campaign owner's onchain approval. Submission prepares
again with simulation and fails closed if the resolved note ID changed.

The Cairo helper uses `privacy::objects::OpenNoteDeposit` from the pinned
`PRIVACY-0.14.3-RC.5` source tag. It is callable only by its configured pool,
measures the ERC-20 balance delta around the campaign payout, approves exactly
that amount to the pool, and returns one deposit.

The current helper is an **UNAUDITED DRAFT** and must not be deployed as
production code without independent review. Pool address, class hash, network,
wallet support, fee behavior, and proving/discovery compatibility must be
reverified from first-party sources at deployment time.

Primary references:

- [Starknet privacy overview](https://docs.starknet.io/build/starknet-privacy/overview)
- [Starknet privacy architecture](https://docs.starknet.io/build/starknet-privacy/architecture)
- [Privacy protocol source](https://github.com/starkware-libs/starknet-privacy)
- [Starknet specifications releases](https://github.com/starkware-libs/starknet-specs/releases)
