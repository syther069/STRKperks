# StrkPerks architecture

## Settlement path

```text
privacy-capable wallet
  -> STRK20 privacy pool
     -> creates an open reward-token note
     -> RewardRouter.privacy_invoke(...)
        -> RewardCampaign.claim_reward(...)
           -> verifies exact owner approval and expiry
           -> consumes the campaign nullifier
           -> transfers the fixed reward to RewardRouter
        -> RewardRouter measures its token balance delta
        -> approves the pool for exactly that delta
        -> returns one OpenNoteDeposit
     -> pool pulls the reward into the prepared note
```

`RewardRouter` is the app-specific STRK20 anonymizer. It pins the privacy pool,
campaign, and reward token at construction. `RewardCampaign` pins its registry
and accepts payout calls only from its one-time configured anonymizer.

The owner approval is bound to campaign address, conversion ID, app nullifier,
open-note ID, reward token, reward amount, and expiry. A changed destination
therefore fails before funds move. Registry consumption and token movement are
atomic under Starknet transaction semantics.

## Client boundary

The existing Starknet React stack remains on starknet.js 6.x. A narrow aliased
starknet.js 10.4.0 adapter supplies `WalletAccountV6` without forcing a broad UI
migration. Wallet discovery and Wallet Standard are pinned to 6.0.2, and the
STRK20 schema is pinned to Wallet API 0.10.3.

The wallet owns signing keys, viewing keys, note discovery, and proof creation.
StrkPerks receives only capability data, public authorization fields, and the
submitted transaction hash. The app never asks for a viewing key.

## Funding and privacy

Campaign funding is a normal public ERC-20 approval plus `fund_with_erc20`.
Only the payout output is credited to an STRK20 open note. Open-note token and
amount, app calldata, contract addresses, and transaction timing are public;
the note owner is hidden. See [docs/privacy-model.md](docs/privacy-model.md).
