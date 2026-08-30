import { deriveNullifier } from "../campaign/nullifier";
import { generatePrivateRewardNote, PrivateRewardNote } from "./notes";

export interface SettlementParams {
  campaignId: string;
  campaignNamespace: string;
  conversionId: string;
  recipientCommitment: string;
  rewardAmountSTRK: string;
}

export interface SettlementResult {
  success: boolean;
  txHash: string;
  nullifier: string;
  privateNote: PrivateRewardNote;
  error?: string;
  isDuplicate?: boolean;
}

/**
 * Demo-only settlement placeholder. Live nullifier consumption and STRK20
 * private-note settlement belong in the Cairo router/verified adapter.
 */
export async function executePrivateSettlement(
  params: SettlementParams,
  consumedNullifiers: Set<string>
): Promise<SettlementResult> {
  const nullifier = deriveNullifier(params.campaignNamespace, params.conversionId);

  // Check if nullifier was already consumed (Double claim protection)
  if (consumedNullifiers.has(nullifier)) {
    return {
      success: false,
      txHash: "",
      nullifier,
      privateNote: generatePrivateRewardNote(params.campaignId, "0", params.recipientCommitment),
      isDuplicate: true,
      error: `Nullifier Collision: 0x...${nullifier.slice(-10)} has already been consumed in campaign '${params.campaignId}'. Duplicate claims are blocked by NullifierRegistry.cairo.`,
    };
  }

  // Register settlement
  const timestamp = Math.floor(Date.now() / 1000);
  const txHash = `0x06e1${Math.random().toString(16).slice(2, 10)}${timestamp.toString(16)}a9f82c403`;
  const privateNote = generatePrivateRewardNote(
    params.campaignId,
    params.rewardAmountSTRK,
    params.recipientCommitment
  );

  return {
    success: true,
    txHash,
    nullifier,
    privateNote,
  };
}
