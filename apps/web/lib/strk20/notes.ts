/**
 * Represents a private reward note settled via STRK20.
 */
export interface PrivateRewardNote {
  noteHash: string;
  amountSTRK: string;
  recipientCommitment: string;
  campaignId: string;
  settledAt: number;
  isSpent: boolean;
  viewingKeyProof: string;
}

export function generatePrivateRewardNote(
  campaignId: string,
  amountSTRK: string,
  recipientCommitment: string
): PrivateRewardNote {
  const seed = `${campaignId}:${amountSTRK}:${recipientCommitment}:${Date.now()}`;
  let hash = 0x5f3759df;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x5bd1e995);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  const noteHash = "0x0" + hex.repeat(7).slice(0, 63);

  return {
    noteHash,
    amountSTRK,
    recipientCommitment,
    campaignId,
    settledAt: Math.floor(Date.now() / 1000),
    isSpent: false,
    viewingKeyProof: `vk_proof_strk20_${hex.slice(0, 8)}`,
  };
}
