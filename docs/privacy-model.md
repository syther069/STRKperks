# StrkPerks privacy model

## Implemented intent

StrkPerks keeps raw claim secrets and recipient wallet addresses out of the campaign settlement payload. Replay protection is campaign-scoped and uses a domain-separated Starknet Poseidon nullifier derived from the campaign namespace and claimant secret. The registry stores only consumed nullifiers.

## Public data

Campaign existence/configuration, contract addresses, transaction timing, event fields, nullifier consumption, and any information a user voluntarily discloses remain public or inferable.

## Not claimed

This MVP does not provide full anonymity, untraceable transactions, hidden timing metadata, or zero-knowledge eligibility verification. STRK20 privacy properties depend on the exact deployed STRK20 implementation and adapter configuration.

## Secret handling

Secrets are generated and used client-side. They must not be sent to API routes, logged, or stored in localStorage/backend databases. A recipient commitment or signed eligibility authorization may be public; it is not the raw secret.
