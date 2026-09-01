# Privacy model

## Hidden by the STRK20 pool

- ownership of the open reward note;
- the in-pool ownership graph for encrypted notes; and
- later linkage between private note spends, absent authorized viewing data or
  side-channel correlation.

## Public or inferable

- campaign, anonymizer, privacy-pool, and token addresses;
- the open note's token and amount;
- conversion ID, app nullifier, open-note ID, authorization expiry, and events;
- campaign funding, transaction timing, and interaction frequency; and
- deposits, withdrawals, registration, and protocol nullifiers as defined by
  the deployed privacy protocol.

The app nullifier prevents a campaign reward replay. It is not an STRK20 note
nullifier. Distinctive amounts and closely timed funding/claims can reduce the
effective anonymity set.

Claim secrets stay in browser memory only for app-nullifier derivation. The app
does not request, transmit, or store a viewing key. Viewing keys enable
selective disclosure and must remain controlled by the wallet owner.

Product language should say **private by default and selectively disclosable**,
not anonymous, invisible, or untraceable.
