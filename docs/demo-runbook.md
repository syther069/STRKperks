# StrkPerks demo runbook

1. Connect a Starknet Sepolia wallet.
2. Create a campaign and show the creation transaction.
3. Fund the campaign through the configured STRK20 adapter (or clearly labeled demo simulation).
4. Approve a conversion using a recipient commitment.
5. Generate the claimant secret locally and submit one claim.
6. Show the settlement transaction and explorer link.
7. Attempt the same claim again and show deterministic nullifier rejection.
8. Explain public metadata versus private inputs using `docs/privacy-model.md`.

Never display or record the raw claim secret during the demo.
