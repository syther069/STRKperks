export const APP_CONFIG = {
  name: "StrkPerks",
  tagline: "Starknet-Native Rewards & Referral Settlement with a STRK20 Privacy Boundary",
  network: process.env.NEXT_PUBLIC_STARKNET_NETWORK || "sepolia",
  rpcUrl:
    process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
    "https://starknet-sepolia.public.blastapi.io/rpc/v0_7",
  explorerBaseUrl:
    process.env.NEXT_PUBLIC_EXPLORER_BASE_URL ||
    "https://sepolia.voyager.online",
};

export const LIVE_CONTRACTS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_LIVE_CONTRACTS === "true";

export const CONTRACT_ADDRESSES = {
  // Empty until verified deployments are supplied; never ship fabricated addresses.
  campaignFactory: process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS || "",
  nullifierRegistry: process.env.NEXT_PUBLIC_NULLIFIER_REGISTRY_ADDRESS || "",
  rewardRouter: process.env.NEXT_PUBLIC_REWARD_ROUTER_ADDRESS || "",
  rewardCampaign: process.env.NEXT_PUBLIC_REWARD_CAMPAIGN_ADDRESS || "",
  strkToken: process.env.NEXT_PUBLIC_STRK20_TOKEN_ADDRESS || "",
};

export const DEMO_CAMPAIGN_ID = "camp_starknet_ambassador_2026";
export const DEMO_RECIPIENT_SECRET = "priv_rcpt_sec_99481ad7f309a";
export const DEMO_CONVERSION_ID = "conv_ambassador_referral_771";
