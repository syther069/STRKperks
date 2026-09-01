# Deployment

The current source must be deployed and its class hashes recorded before live mode is enabled. The addresses from any earlier prototype are not compatible evidence for this source.

## Status

The current sources build and their local contract tests pass. They have **not**
been deployed or exercised end to end against a current STRK20 network in this
change. Addresses from the earlier Sepolia prototype refer to obsolete class
hashes and must not be configured for the new live flow.

The anonymizer is explicitly an unaudited draft. Obtain an independent Cairo
review before any production or funded public deployment.

## Required checks

1. Resolve the current pool address, class hash, supported network, privacy
   package tag, Wallet API schema, fee behavior, and proving/discovery services
   from first-party Starknet resources.
2. Run `.\scripts\verify.ps1` and retain the complete output.
3. Set `RPC_URL`, `ACCOUNT`, `DEPLOYER_ADDRESS`, `PRIVACY_POOL_ADDRESS`, and
   `REWARD_TOKEN_ADDRESS` in the shell. Never commit them or account secrets.
4. From `contracts/`, run `./run_deployment.sh` with a disposable funded testnet
   account. The script builds current sources, deploys in dependency order,
   performs one-time wiring, and writes `deployed_addresses.env`.
5. Verify every class hash and address independently before copying values to
   `apps/web/.env.local` or enabling live mode.
6. Approve the campaign to spend the reward token, call `fund_with_erc20`, and
   record the real transaction.
7. Execute a real prepare/approve/submit/discover claim, an altered-note attempt,
   and a replay attempt. Record explorer evidence.

Rotate any RPC credential that appeared in an earlier committed deployment
script; the replacement script contains no embedded endpoint or credential.
