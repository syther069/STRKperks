"use client";

import { useAccount, useNetwork } from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";
import { useQueryClient } from "@tanstack/react-query";
import { executeContractCalls } from "./wallet";
import { buildApproveClaimCall, buildCampaignCall, buildCancelClaimCall, buildErc20ApproveCall, buildErc20FundCall, buildFactoryCreateCall } from "./contracts";
import { parseTokenAmount } from "./amounts";
import type { CampaignConfig } from "./contracts";
import { CONTRACT_ADDRESSES } from "../utils/constants";
import { useTransactionStore } from "../transactions/store";
import { classifyReceipt } from "../transactions/receipt";

async function pause(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

export function useContractActions() {
  const { account, address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const queryClient = useQueryClient();
  const onExpectedNetwork = chain?.id === sepolia.id;
  const execute = async (action: string, target: string, calls: Parameters<typeof executeContractCalls>[1]) => {
    if (!account || !address) throw new Error("Wallet not connected");
    if (!onExpectedNetwork) throw new Error("Switch the wallet to Starknet Sepolia before submitting");
    const id = useTransactionStore.getState().begin({ chainId: String(chain.id), account: address, action, target, status: "awaiting_wallet" });
    let hash = "";
    try {
      hash = await executeContractCalls(account, calls);
      useTransactionStore.getState().attachHash(id, hash);
      const deadline = Date.now() + 120_000;
      while (Date.now() < deadline) {
        const receipt = await classifyReceipt(hash);
        useTransactionStore.getState().update(id, receipt.status, receipt.error);
        if (receipt.status === "accepted") { await queryClient.invalidateQueries({ queryKey: ["starknet"] }); return hash; }
        if (receipt.status === "reverted" || receipt.status === "rejected") throw new Error(receipt.error || `Transaction ${receipt.status}`);
        await pause(3_000);
      }
      useTransactionStore.getState().update(id, "unknown", "Confirmation timed out; resume polling from Activity");
      throw new Error(`Confirmation timed out. Transaction ${hash} remains submitted and can be resumed from Activity.`);
    } catch (cause) {
      if (!hash) useTransactionStore.getState().update(id, "rejected", cause instanceof Error ? cause.message : "Wallet request failed");
      throw cause;
    }
  };
  return {
    isReady: Boolean(account && address && isConnected && onExpectedNetwork),
    createCampaign: (config: Omit<CampaignConfig, "rewardAmount"> & { rewardAmount: string }) => execute("create_campaign", CONTRACT_ADDRESSES.campaignFactory, buildFactoryCreateCall({ ...config, rewardAmount: parseTokenAmount(config.rewardAmount) })),
    fundCampaign: async (campaignAddress: string, amount: string, onStage?: (stage: "approving" | "funding", hash?: string) => void) => {
      if (!CONTRACT_ADDRESSES.strkToken) throw new Error("Reward token is not configured");
      const rawAmount = parseTokenAmount(amount);
      onStage?.("approving");
      const approvalHash = await execute("approve_reward_token", CONTRACT_ADDRESSES.strkToken, buildErc20ApproveCall(campaignAddress, rawAmount));
      onStage?.("funding", approvalHash);
      const fundingHash = await execute("fund_campaign", campaignAddress, buildErc20FundCall(campaignAddress, rawAmount));
      onStage?.("funding", fundingHash);
      return { hashes: [approvalHash, fundingHash] };
    },
    cancelFundingApproval: (campaignAddress: string) => execute("cancel_reward_token_approval", CONTRACT_ADDRESSES.strkToken, buildErc20ApproveCall(campaignAddress, "0")),
    approveClaim: (campaignAddress: string, conversionId: string, nullifier: string, noteId: string, expiry: string) => execute("approve_claim", campaignAddress, buildApproveClaimCall(campaignAddress, conversionId, nullifier, noteId, expiry)),
    cancelClaim: (campaignAddress: string, conversionId: string, nullifier: string, noteId: string, expiry: string) => execute("cancel_claim", campaignAddress, buildCancelClaimCall(campaignAddress, conversionId, nullifier, noteId, expiry)),
    pauseCampaign: (campaignAddress: string) => execute("pause_campaign", campaignAddress, buildCampaignCall(campaignAddress, "pause")),
    resumeCampaign: (campaignAddress: string) => execute("resume_campaign", campaignAddress, buildCampaignCall(campaignAddress, "resume")),
    closeCampaign: (campaignAddress: string) => execute("close_campaign", campaignAddress, buildCampaignCall(campaignAddress, "close")),
    withdrawUnspent: (campaignAddress: string, recipient: string, amount: string) => execute("withdraw_unspent", campaignAddress, buildCampaignCall(campaignAddress, "withdraw_unspent", [recipient, parseTokenAmount(amount)])),
  };
}
