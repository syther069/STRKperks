import type { Call } from "starknet";
import { CONTRACT_ADDRESSES } from "../utils/constants";
import { toFelt } from "../campaign/nullifier";

export type CampaignConfig = {
  owner: string;
  rewardToken: string;
  rewardAmount: string;
  maxClaims: string;
  startTime: string;
  endTime: string;
};

function requireAddress(address: string, name: string): string {
  if (!address) throw new Error(`${name} is not configured`);
  return address;
}

export function buildFactoryCreateCall(campaignAddress: string): Call {
  return {
    contractAddress: requireAddress(CONTRACT_ADDRESSES.campaignFactory, "CampaignFactory"),
    entrypoint: "create_campaign",
    calldata: [campaignAddress],
  };
}

export function buildFundCall(campaignAddress: string, amount: string): Call {
  return { contractAddress: campaignAddress, entrypoint: "fund", calldata: [amount] };
}

export function buildErc20FundCall(campaignAddress: string, amount: string): Call {
  return { contractAddress: campaignAddress, entrypoint: "fund_with_erc20", calldata: [amount] };
}

export function buildErc20ApproveCall(spenderAddress: string, amount: string): Call {
  return {
    contractAddress: requireAddress(CONTRACT_ADDRESSES.strkToken, "STRK token"),
    entrypoint: "approve",
    // u256 calldata is serialized as low and high limbs.
    calldata: [spenderAddress, amount, "0"],
  };
}

export function buildApproveConversionCall(campaignAddress: string, conversionId: string): Call {
  return { contractAddress: campaignAddress, entrypoint: "approve_conversion", calldata: [toFelt(conversionId)] };
}

export function buildClaimCall(campaignAddress: string, registryAddress: string, routerAddress: string, conversionId: string, nullifier: string, recipientCommitment: string, noteId: string, amount: string): Call {
  return {
    contractAddress: campaignAddress,
    entrypoint: "claim_reward",
    calldata: [requireAddress(registryAddress, "NullifierRegistry"), requireAddress(routerAddress, "RewardRouter"), toFelt(conversionId), nullifier, recipientCommitment, noteId, amount],
  };
}

export function buildPrivateSettlementCall(routerAddress: string, campaignAddress: string, recipientCommitment: string, amount: string, noteId: string): Call {
  return { contractAddress: requireAddress(routerAddress, "RewardRouter"), entrypoint: "settle_private_reward", calldata: [campaignAddress, recipientCommitment, amount, noteId] };
}
