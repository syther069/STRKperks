# StrkPerks threat model

| Threat | Mitigation |
| --- | --- |
| Duplicate/replayed claim | Campaign-scoped domain-separated nullifier consumed atomically by the registry |
| Unauthorized conversion approval | Contract-level owner authorization and signed payload validation |
| Budget draining | Fixed reward validation, checked arithmetic, claim limits, and balance checks |
| Expired/paused/closed campaign claim | Explicit status and timestamp guards in Cairo |
| Secret/PII leakage | No raw secrets in events, APIs, logs, or backend storage |
| STRK20 mismatch | Isolated adapter; no invented ABI or privacy guarantee |
| Unsafe external calls | Checks-effects-interactions and an authorized router boundary |

The MVP is not an audit and must not be described as production-secure without independent review and deployed-test evidence.
