"use client";

import { useAccount } from "@starknet-react/core";
import { confirmTransaction, executeContractCalls } from "./wallet";
import { buildApproveConversionCall, buildClaimCall, buildErc20ApproveCall, buildErc20FundCall, buildFactoryCreateCall } from "./contracts";
import { parseTokenAmount } from "./amounts";
import { deriveNullifier, deriveRecipientCommitment } from "../campaign/nullifier";
import { CONTRACT_ADDRESSES } from "../utils/constants";

function requireConfigured(address: string, label: string): string {
  if (!address) throw new Error(`${label} address is not configured`);
  return address;
}

export function useContractActions() {
  const { account, address, isConnected } = useAccount();
  return {
    isReady: Boolean(account && address && isConnected),
    createCampaign: async (campaignAddress: string) => {
      if (!account) throw new Error("Wallet not connected");
      requireConfigured(CONTRACT_ADDRESSES.campaignFactory, "CampaignFactory");
      return confirmTransaction(account, await executeContractCalls(account, buildFactoryCreateCall(campaignAddress)));
    },
    fundCampaign: async (campaignAddress: string, amount: string) => {
      if (!account) throw new Error("Wallet not connected");
      requireConfigured(CONTRACT_ADDRESSES.strkToken, "STRK token");
      const rawAmount = parseTokenAmount(amount);
      return confirmTransaction(account, await executeContractCalls(account, [
        buildErc20ApproveCall(campaignAddress, rawAmount),
        buildErc20FundCall(campaignAddress, rawAmount),
      ]));
    },
    approveConversion: async (campaignAddress: string, conversionId: string) => {
      if (!account) throw new Error("Wallet not connected");
      requireConfigured(campaignAddress, "Campaign");
      return confirmTransaction(account, await executeContractCalls(account, buildApproveConversionCall(campaignAddress, conversionId)));
    },
    claimReward: async (campaignAddress: string, namespace: string, conversionId: string, recipientSecret: string, amount: string) => {
      if (!account) throw new Error("Wallet not connected");
      requireConfigured(campaignAddress, "Campaign");
      requireConfigured(CONTRACT_ADDRESSES.nullifierRegistry, "NullifierRegistry");
      requireConfigured(CONTRACT_ADDRESSES.rewardRouter, "RewardRouter");
      const nullifier = deriveNullifier(namespace, recipientSecret);
      const commitment = deriveRecipientCommitment(recipientSecret);
      return confirmTransaction(account, await executeContractCalls(account, buildClaimCall(campaignAddress, CONTRACT_ADDRESSES.nullifierRegistry, CONTRACT_ADDRESSES.rewardRouter, conversionId, nullifier, commitment, "0", parseTokenAmount(amount))));
    },
  };
}
