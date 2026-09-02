import type { Call } from "starknet";
import { CONTRACT_ADDRESSES } from "../utils/constants";
import { toFelt } from "../campaign/nullifier";

export type CampaignConfig = {
  rewardAmount: string;
  maxClaims: string;
  startTime: string;
  endTime: string;
  salt: string;
};

function requireAddress(address: string, name: string): string {
  if (!address) throw new Error(`${name} is not configured`);
  return address;
}

export function buildFactoryCreateCall(config: CampaignConfig): Call {
  return {
    contractAddress: requireAddress(CONTRACT_ADDRESSES.campaignFactory, "CampaignFactory"),
    entrypoint: "create_campaign",
    calldata: [config.rewardAmount, config.maxClaims, config.startTime, config.endTime, config.salt],
  };
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

export function buildApproveClaimCall(
  campaignAddress: string,
  conversionId: string,
  nullifier: string,
  noteId: string,
  authorizationExpiry: string,
): Call {
  return {
    contractAddress: campaignAddress,
    entrypoint: "approve_claim",
    calldata: [toFelt(conversionId), nullifier, noteId, authorizationExpiry],
  };
}

export function buildCancelClaimCall(
  campaignAddress: string,
  conversionId: string,
  nullifier: string,
  noteId: string,
  authorizationExpiry: string,
): Call {
  return {
    ...buildApproveClaimCall(campaignAddress, conversionId, nullifier, noteId, authorizationExpiry),
    entrypoint: "cancel_claim",
  };
}

export function buildConfigureAnonymizerCall(
  campaignAddress: string,
  anonymizerAddress: string,
): Call {
  return {
    contractAddress: campaignAddress,
    entrypoint: "configure_anonymizer",
    calldata: [requireAddress(anonymizerAddress, "Reward anonymizer")],
  };
}

export function buildCampaignCall(campaignAddress: string, entrypoint: string, calldata: string[] = []): Call {
  return { contractAddress: campaignAddress, entrypoint, calldata };
}
