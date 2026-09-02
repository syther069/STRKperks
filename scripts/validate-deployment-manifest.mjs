import fs from "node:fs";

const path = process.argv[2];
if (!path || path === "--help" || path === "-h") {
  console.log("Usage: node scripts/validate-deployment-manifest.mjs <verified-manifest.json>");
  process.exit(path ? 0 : 1);
}
const value = JSON.parse(fs.readFileSync(path, "utf8"));
const felt = /^0x[0-9a-f]{1,64}$/i;
if (value.schemaVersion !== 1 || value.network !== "sepolia" || value.chainId !== "SN_SEPOLIA") throw new Error("Unsupported deployment manifest identity");
if (!/^[0-9a-f]{40}$/i.test(value.gitCommit || "")) throw new Error("Manifest Git commit is invalid");
for (const [group, entries] of Object.entries({ classHashes: value.classHashes, addresses: value.addresses })) {
  if (!entries || typeof entries !== "object") throw new Error(`${group} is missing`);
  for (const [name, entry] of Object.entries(entries)) if (!felt.test(String(entry))) throw new Error(`${group}.${name} is invalid`);
}
const transactionValues = [
  ...Object.values(value.transactions?.declare ?? {}),
  ...Object.values(value.transactions?.deploy ?? {}),
  value.transactions?.createCampaign,
  value.transactions?.wiring,
];
if (transactionValues.some((entry) => !felt.test(String(entry)))) throw new Error("Manifest contains an invalid transaction hash");
if (!value.toolVersions?.scarb || !value.toolVersions?.sncast) throw new Error("Manifest tool versions are missing");
if (value.rewardTokenDecimals !== 18) throw new Error("Only a verified 18-decimal reward token is supported");
if (!value.constructorArguments || typeof value.constructorArguments !== "object") throw new Error("Constructor arguments are missing");
if (value.explorerBaseUrl !== "https://sepolia.voyager.online") throw new Error("Unexpected explorer base URL");
if (value.verification?.status !== "verified") throw new Error("Manifest has not passed independent verification");
if (Object.keys(value.verification.receipts ?? {}).length !== transactionValues.length) throw new Error("Receipt evidence is incomplete");
console.log(`Verified manifest is structurally valid: ${path}`);
