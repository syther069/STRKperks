# Deployment manifests

Only manifests generated from real transactions belong here. A manifest is not verified until its class hashes, receipts, constructor configuration, factory index, campaign ownership, router wiring, token, registry, and privacy-pool getters have been checked independently and `verification.status` is `verified`.

Never commit RPC credentials, private keys, account keystores, seed phrases, viewing keys, proof witnesses, or private note ownership data.

Generate a pending manifest with `contracts/run_deployment.sh`, verify it with
`contracts/verify_deployment.sh`, then run
`node scripts/validate-deployment-manifest.mjs <manifest>`. Do not hand-edit a
pending manifest into a verified one.
