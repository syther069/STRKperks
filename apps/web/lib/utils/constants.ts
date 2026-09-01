export const APP_CONFIG = {
  name: "StrkPerks",
  tagline: "Starknet-Native Rewards & Referral Settlement with a STRK20 Privacy Boundary",
  network: process.env.NEXT_PUBLIC_STARKNET_NETWORK || "sepolia",
  rpcUrl:
    process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
    "https://api.cartridge.gg/x/starknet/sepolia",
  explorerBaseUrl:
    process.env.NEXT_PUBLIC_EXPLORER_BASE_URL ||
    "https://sepolia.voyager.online",
};

const LIVE_CONTRACTS_REQUESTED = process.env.NEXT_PUBLIC_ENABLE_LIVE_CONTRACTS === "true";

const isAddress = (value: string) => /^0x[0-9a-f]{1,64}$/i.test(value) && BigInt(value) !== BigInt(0);

export const CONTRACT_ADDRESSES = {
  // Empty until verified deployments are supplied; never ship fabricated addresses.
  campaignFactory: process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS || "",
  nullifierRegistry: process.env.NEXT_PUBLIC_NULLIFIER_REGISTRY_ADDRESS || "",
  rewardRouter: process.env.NEXT_PUBLIC_REWARD_ROUTER_ADDRESS || "",
  rewardCampaign: process.env.NEXT_PUBLIC_REWARD_CAMPAIGN_ADDRESS || "",
  strkToken:
    process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS ||
    process.env.NEXT_PUBLIC_STRK20_TOKEN_ADDRESS ||
    "",
  privacyPool: process.env.NEXT_PUBLIC_STRK20_PRIVACY_POOL_ADDRESS || "",
};

export const LIVE_CONTRACTS_ENABLED =
  LIVE_CONTRACTS_REQUESTED &&
  APP_CONFIG.network === "sepolia" &&
  Object.values(CONTRACT_ADDRESSES).every((value) => isAddress(value));

export const LIVE_CONTRACTS_CONFIGURED = LIVE_CONTRACTS_ENABLED;

export const DEMO_CAMPAIGN_ID = "camp_demo_1";
export const DEMO_RECIPIENT_SECRET = "priv_rcpt_sec_99481ad7f309a";
export const DEMO_CONVERSION_ID = "conv_demo_referral_771";
