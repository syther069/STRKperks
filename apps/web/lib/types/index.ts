export type CampaignStatus = "active" | "paused" | "expired" | "closed";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  ownerAddress: string;
  rewardToken: string;
  tokenSymbol: string;
  rewardAmount: string; // e.g. "50.0" STRK
  totalBudget: string;  // e.g. "5000.0" STRK
  remainingBudget: string;
  maxClaims: number;
  settledClaims: number;
  duplicateBlockedCount: number;
  startTime: number; // Unix timestamp in seconds
  endTime: number;
  status: CampaignStatus;
  nullifierNamespace: string;
  isShielded: boolean;
  /** True when the record is local demo data and not chain state. */
  isFixture?: boolean;
  contractAddress?: string;
  createdAt: number;
}

export type ConversionStatus = "pending" | "approved" | "claimed" | "rejected";

export interface Conversion {
  id: string;
  campaignId: string;
  recipientCommitment: string;
  rewardAmount: string;
  rewardTier: string;
  status: ConversionStatus;
  approvedAt?: number;
  expiresAt: number;
  nullifier: string;
  recipientAddress?: string; // Only stored locally or simulated for demo display
  claimTxHash?: string;
  /** True when the record is local demo data and not chain state. */
  isFixture?: boolean;
}

export interface ClaimReceipt {
  id: string;
  campaignId: string;
  campaignName: string;
  rewardAmount: string;
  tokenSymbol: string;
  conversionId: string;
  nullifier: string;
  recipientNoteHash: string;
  txHash: string;
  timestamp: number;
  status: "submitted" | "settled" | "shielded_note_ready";
  blockNumber?: number;
  shieldedBalanceVerified: boolean;
  /** True when the receipt is local demo data and not chain evidence. */
  isFixture?: boolean;
}

export type TxType =
  | "create_campaign"
  | "fund_shielded"
  | "approve_conversion"
  | "claim_reward"
  | "duplicate_claim_attempt";

export type TxStatus = "pending" | "accepted_l2" | "rejected" | "failed" | "simulated";

export interface TxRecord {
  hash: string;
  type: TxType;
  status: TxStatus;
  timestamp: number;
  summary: string;
  campaignId?: string;
  nullifier?: string;
  errorReason?: string;
  contractAddress?: string;
  /** True when the record is local demo data and not chain state. */
  isFixture?: boolean;
}

export interface ProtocolStats {
  totalCampaigns: number;
  totalBudgetSTRK: string;
  rewardsSettledSTRK: string;
  remainingBudgetSTRK: string;
  approvedConversions: number;
  completedClaims: number;
  duplicateClaimsBlocked: number;
}

export interface DemoStep {
  id: number;
  title: string;
  shortDesc: string;
  actionName: string;
  status: "idle" | "running" | "completed" | "failed";
  proofAvailable: boolean;
}
