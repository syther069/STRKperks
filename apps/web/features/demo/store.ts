import { create } from "zustand";
import { Campaign, Conversion, ProtocolStats, TxRecord, ClaimReceipt } from "../../lib/types";
import {
  INITIAL_CAMPAIGNS,
  INITIAL_CONVERSIONS,
  INITIAL_STATS,
  INITIAL_TRANSACTIONS,
} from "./fixtures";
import { deriveNullifier } from "../../lib/campaign/nullifier";
import { generatePrivateRewardNote } from "./notes";
import { DEMO_RECIPIENT_SECRET } from "./constants";

interface DemoState {
  // Protocol Data
  stats: ProtocolStats;
  campaigns: Campaign[];
  conversions: Conversion[];
  transactions: TxRecord[];
  consumedNullifiers: Set<string>;

  // Wallet Simulation / Overrides
  simulatedWalletConnected: boolean;
  simulatedAddress: string;
  simulatedBalanceSTRK: string;

  // Demo Wizard State (Steps 1 - 7)
  demoStep: number;
  isDemoMode: boolean;
  activeReceipt: ClaimReceipt | null;
  lastError: string | null;

  // Actions
  toggleWalletConnection: (force?: boolean) => void;
  setDemoStep: (step: number) => void;
  toggleDemoMode: (enabled?: boolean) => void;
  createCampaign: (data: {
    name: string;
    description: string;
    rewardAmount: string;
    maxClaims: number;
    durationDays: number;
    nullifierNamespace: string;
  }) => Promise<{ campaignId: string; txHash: string }>;
  fundCampaign: (campaignId: string, amountSTRK: string) => Promise<{ txHash: string }>;
  approveConversion: (data: {
    campaignId: string;
    conversionId: string;
    recipientCommitment: string;
    rewardTier: string;
    recipientSecret?: string;
  }) => Promise<{ txHash: string }>;
  claimReward: (data: {
    campaignId: string;
    conversionId: string;
    recipientSecret: string;
  }) => Promise<{ receipt?: ClaimReceipt; error?: string; isDuplicate?: boolean }>;
  attemptDuplicateClaim: (campaignId: string, conversionId: string, recipientSecret?: string) => Promise<{
    error: string;
    nullifier: string;
    txHash: string;
  }>;
  resetDemo: () => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  stats: INITIAL_STATS,
  campaigns: INITIAL_CAMPAIGNS,
  conversions: INITIAL_CONVERSIONS,
  transactions: INITIAL_TRANSACTIONS,
  consumedNullifiers: new Set(),

  simulatedWalletConnected: false,
  simulatedAddress: "0x01a93b482f018749ab8295c1029487fa92305819ad74e928",
  simulatedBalanceSTRK: "1420.50",

  demoStep: 1,
  isDemoMode: true,
  activeReceipt: null,
  lastError: null,

  toggleWalletConnection: (force) => {
    set((state) => ({
      simulatedWalletConnected: force !== undefined ? force : !state.simulatedWalletConnected,
    }));
  },

  setDemoStep: (step) => set({ demoStep: step }),

  toggleDemoMode: (enabled) =>
    set((state) => ({
      isDemoMode: enabled !== undefined ? enabled : !state.isDemoMode,
    })),

  createCampaign: async (data) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const campaignId = `camp_${data.nullifierNamespace}_${Date.now().toString().slice(-4)}`;
    const totalBudget = (parseFloat(data.rewardAmount) * data.maxClaims).toFixed(1);
    const txHash = "";

    const newCampaign: Campaign = {
      source: "simulation",
      isFixture: true,
      id: campaignId,
      name: data.name,
      description: data.description,
      ownerAddress: get().simulatedAddress,
      rewardToken: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      tokenSymbol: "STRK",
      rewardAmount: data.rewardAmount,
      totalBudget: totalBudget,
      remainingBudget: totalBudget,
      maxClaims: data.maxClaims,
      settledClaims: 0,
      duplicateBlockedCount: 0,
      startTime: timestamp,
      endTime: timestamp + data.durationDays * 86400,
      status: "active",
      nullifierNamespace: data.nullifierNamespace,
      isShielded: false,
      createdAt: timestamp,
    };

    const newTx: TxRecord = {
      isFixture: true,
      hash: txHash,
      type: "create_campaign",
      status: "simulated",
      timestamp,
      summary: `Campaign Created: ${data.name} (${totalBudget} STRK budget)`,
      campaignId,
    };

    set((state) => ({
      campaigns: [newCampaign, ...state.campaigns],
      transactions: [newTx, ...state.transactions],
      stats: {
        ...state.stats,
        totalCampaigns: state.stats.totalCampaigns + 1,
        totalBudgetSTRK: (parseFloat(state.stats.totalBudgetSTRK) + parseFloat(totalBudget)).toFixed(1),
        remainingBudgetSTRK: (parseFloat(state.stats.remainingBudgetSTRK) + parseFloat(totalBudget)).toFixed(1),
      },
    }));

    return { campaignId, txHash };
  },

  fundCampaign: async (campaignId, amountSTRK) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const txHash = "";

    const newTx: TxRecord = {
      isFixture: true,
      hash: txHash,
      type: "fund_shielded",
      status: "simulated",
      timestamp,
      summary: `Demo Public Treasury Funding: ${amountSTRK} STRK for campaign ${campaignId}`,
      campaignId,
    };

    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              totalBudget: (parseFloat(c.totalBudget) + parseFloat(amountSTRK)).toFixed(1),
              remainingBudget: (parseFloat(c.remainingBudget) + parseFloat(amountSTRK)).toFixed(1),
            }
          : c
      ),
      transactions: [newTx, ...state.transactions],
    }));

    return { txHash };
  },

  approveConversion: async (data) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const txHash = "";
    const campaign = get().campaigns.find((c) => c.id === data.campaignId);
    const nullifier = deriveNullifier(
      campaign?.nullifierNamespace || "default_ns",
      data.recipientSecret || data.conversionId,
    );

    const newConversion: Conversion = {
      id: data.conversionId,
      campaignId: data.campaignId,
      recipientCommitment: data.recipientCommitment,
      rewardAmount: campaign?.rewardAmount || "50.0",
      rewardTier: data.rewardTier,
      status: "approved",
      approvedAt: timestamp,
      expiresAt: timestamp + 30 * 86400,
      nullifier,
    };

    const newTx: TxRecord = {
      isFixture: true,
      hash: txHash,
      type: "approve_conversion",
      status: "simulated",
      timestamp,
      summary: `Conversion Approved: ${data.conversionId} (${campaign?.rewardAmount || "50.0"} STRK)`,
      campaignId: data.campaignId,
    };

    set((state) => ({
      conversions: [newConversion, ...state.conversions.filter((c) => c.id !== data.conversionId)],
      transactions: [newTx, ...state.transactions],
      stats: {
        ...state.stats,
        approvedConversions: state.stats.approvedConversions + 1,
      },
    }));

    return { txHash };
  },

  claimReward: async (data) => {
    const campaign = get().campaigns.find((c) => c.id === data.campaignId);
    if (!campaign) return { error: "Campaign not found" };
    const conversion = get().conversions.find(
      (candidate) => candidate.id === data.conversionId && candidate.campaignId === data.campaignId,
    );
    if (!conversion || conversion.status !== "approved") {
      return { error: "Conversion is not approved for this campaign" };
    }

    const nullifier = deriveNullifier(campaign.nullifierNamespace, data.recipientSecret);

    if (conversion.nullifier !== nullifier) {
      return { error: "Claim secret does not match the approved conversion" };
    }

    if (parseFloat(campaign.remainingBudget) < parseFloat(campaign.rewardAmount)) {
      return { error: "Campaign has insufficient simulated budget" };
    }

    // Check Nullifier Registry
    if (get().consumedNullifiers.has(nullifier)) {
      const errorMsg = `Replay Attack Blocked: Nullifier ${nullifier.slice(0, 10)}...${nullifier.slice(-8)} has already been consumed in NullifierRegistry.cairo!`;
      set({ lastError: errorMsg });
      return { error: errorMsg, isDuplicate: true };
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const txHash = "";
    const note = generatePrivateRewardNote(
      campaign.id,
      campaign.rewardAmount,
      `0x05f8${Math.random().toString(16).slice(2, 20)}`
    );

    const receipt: ClaimReceipt = {
      isFixture: true,
      source: "simulation",
      id: `rcpt_${Date.now()}`,
      campaignId: campaign.id,
      campaignName: campaign.name,
      rewardAmount: campaign.rewardAmount,
      tokenSymbol: campaign.tokenSymbol,
      conversionId: data.conversionId,
      nullifier,
      recipientNoteHash: note.noteHash,
      txHash,
      timestamp,
      status: "submitted",
      shieldedBalanceVerified: false,
    };

    const newTx: TxRecord = {
      isFixture: true,
      hash: txHash,
      type: "claim_reward",
      status: "simulated",
      timestamp,
      summary: `Private Reward Settled: ${campaign.rewardAmount} STRK Note Created`,
      campaignId: campaign.id,
      nullifier,
    };

    const newConsumed = new Set(get().consumedNullifiers);
    newConsumed.add(nullifier);

    set((state) => ({
      consumedNullifiers: newConsumed,
      activeReceipt: receipt,
      transactions: [newTx, ...state.transactions],
      campaigns: state.campaigns.map((c) =>
        c.id === data.campaignId
          ? {
              ...c,
              settledClaims: c.settledClaims + 1,
              remainingBudget: Math.max(0, parseFloat(c.remainingBudget) - parseFloat(c.rewardAmount)).toFixed(1),
            }
          : c
      ),
      conversions: state.conversions.map((conv) =>
        conv.id === data.conversionId ? { ...conv, status: "claimed", claimTxHash: txHash } : conv
      ),
      stats: {
        ...state.stats,
        completedClaims: state.stats.completedClaims + 1,
        rewardsSettledSTRK: (
          parseFloat(state.stats.rewardsSettledSTRK) + parseFloat(campaign.rewardAmount)
        ).toFixed(1),
        remainingBudgetSTRK: (
          parseFloat(state.stats.remainingBudgetSTRK) - parseFloat(campaign.rewardAmount)
        ).toFixed(1),
      },
    }));

    return { receipt };
  },

  attemptDuplicateClaim: async (campaignId, conversionId, recipientSecret = DEMO_RECIPIENT_SECRET) => {
    const campaign = get().campaigns.find((c) => c.id === campaignId);
    const nullifier = deriveNullifier(
      campaign?.nullifierNamespace || "default_ns",
      recipientSecret
    );

    const timestamp = Math.floor(Date.now() / 1000);
    if (!get().consumedNullifiers.has(nullifier)) {
      return { error: "No prior simulated claim exists for this nullifier", nullifier, txHash: "" };
    }
    const errorReason = `Simulation: local replay model found consumed app nullifier ${nullifier.slice(0, 10)}...${nullifier.slice(-8)}. No Starknet transaction was submitted.`;

    const newTx: TxRecord = {
      hash: "",
      type: "duplicate_claim_attempt",
      status: "simulated",
      timestamp,
      summary: `Duplicate Claim Replay Attack Blocked for conversion ${conversionId}`,
      campaignId,
      nullifier,
      errorReason,
    };

    set((state) => ({
      transactions: [newTx, ...state.transactions],
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, duplicateBlockedCount: c.duplicateBlockedCount + 1 }
          : c
      ),
      stats: {
        ...state.stats,
        duplicateClaimsBlocked: state.stats.duplicateClaimsBlocked + 1,
      },
    }));

    return {
      error: errorReason,
      nullifier,
      txHash: "",
    };
  },

  resetDemo: () => {
    set({
      stats: INITIAL_STATS,
      campaigns: INITIAL_CAMPAIGNS,
      conversions: INITIAL_CONVERSIONS,
      transactions: INITIAL_TRANSACTIONS,
      consumedNullifiers: new Set(),
      simulatedWalletConnected: false,
      demoStep: 1,
      activeReceipt: null,
      lastError: null,
    });
  },
}));
