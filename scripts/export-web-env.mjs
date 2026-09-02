import fs from "node:fs";

const path = process.argv[2];
if (!path || path === "--help" || path === "-h") {
  console.log("Usage: node scripts/export-web-env.mjs <verified-manifest.json>");
  process.exit(path ? 0 : 1);
}
const value = JSON.parse(fs.readFileSync(path, "utf8"));
if (value.verification?.status !== "verified") throw new Error("Refusing to export an unverified deployment");
const lines = [
  "NEXT_PUBLIC_STARKNET_NETWORK=sepolia",
  `NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS=${value.addresses.campaignFactory}`,
  `NEXT_PUBLIC_NULLIFIER_REGISTRY_ADDRESS=${value.addresses.nullifierRegistry}`,
  `NEXT_PUBLIC_REWARD_ROUTER_ADDRESS=${value.addresses.rewardRouter}`,
  `NEXT_PUBLIC_REWARD_CAMPAIGN_ADDRESS=${value.addresses.rewardCampaign}`,
  `NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=${value.rewardToken}`,
  `NEXT_PUBLIC_STRK20_PRIVACY_POOL_ADDRESS=${value.privacyPool}`,
  "NEXT_PUBLIC_ENABLE_LIVE_CONTRACTS=true",
];
process.stdout.write(`${lines.join("\n")}\n`);
