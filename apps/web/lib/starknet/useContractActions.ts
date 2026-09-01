"use client";

import { useAccount, useNetwork } from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";
import { confirmTransaction, executeContractCalls } from "./wallet";
import { buildApproveClaimCall, buildErc20ApproveCall, buildErc20FundCall, buildFactoryCreateCall } from "./contracts";
import { parseTokenAmount } from "./amounts";
import { CONTRACT_ADDRESSES } from "../utils/constants";

function requireConfigured(address: string, label: string): string {
  if (!address) throw new Error(`${label} address is not configured`);
  return address;
}

export function useContractActions() {
  const { account, address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const onExpectedNetwork = chain?.id === sepolia.id;
  return {
    isReady: Boolean(account && address && isConnected && onExpectedNetwork),
    createCampaign: async (campaignAddress: string) => {
      if (!account) throw new Error("Wallet not connected");
      if (!onExpectedNetwork) throw new Error("Switch the wallet to Starknet Sepolia before submitting");
      requireConfigured(CONTRACT_ADDRESSES.campaignFactory, "CampaignFactory");
      return confirmTransaction(account, await executeContractCalls(account, buildFactoryCreateCall(campaignAddress)));
    },
    fundCampaign: async (campaignAddress: string, amount: string) => {
      if (!account) throw new Error("Wallet not connected");
      if (!onExpectedNetwork) throw new Error("Switch the wallet to Starknet Sepolia before submitting");
      requireConfigured(CONTRACT_ADDRESSES.strkToken, "STRK token");
      const rawAmount = parseTokenAmount(amount);
      return confirmTransaction(account, await executeContractCalls(account, [
        buildErc20ApproveCall(campaignAddress, rawAmount),
        buildErc20FundCall(campaignAddress, rawAmount),
      ]));
    },
    approveClaim: async (
      campaignAddress: string,
      conversionId: string,
      nullifier: string,
      noteId: string,
      authorizationExpiry: string,
    ) => {
      if (!account) throw new Error("Wallet not connected");
      if (!onExpectedNetwork) throw new Error("Switch the wallet to Starknet Sepolia before submitting");
      requireConfigured(campaignAddress, "Campaign");
      return confirmTransaction(
        account,
        await executeContractCalls(
          account,
          buildApproveClaimCall(
            campaignAddress,
            conversionId,
            nullifier,
            noteId,
            authorizationExpiry,
          ),
        ),
      );
    },
  };
}
