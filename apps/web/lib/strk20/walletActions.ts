import type { STRK20_ACTION, STRK20_CALL_AND_PROOF, WalletAccountV6 } from "starknet-strk20";
import { toFelt } from "../campaign/nullifier";

export type PrivateClaimActionParams = {
  anonymizerAddress: string;
  rewardToken: string;
  claimantAddress: string;
  conversionId: string;
  nullifier: string;
  authorizationExpiry: string;
};

export type PreparedPrivateClaim = {
  actions: STRK20_ACTION[];
  prepared: STRK20_CALL_AND_PROOF;
  noteId: string;
};

function feltEquals(left: unknown, right: string): boolean {
  try {
    return BigInt(String(left)) === BigInt(right);
  } catch {
    return false;
  }
}

export function buildPrivateClaimActions(params: PrivateClaimActionParams): STRK20_ACTION[] {
  const conversionId = toFelt(params.conversionId);
  return [
    {
      type: "transfer",
      token: params.rewardToken,
      amount: "OPEN",
      recipient: params.claimantAddress,
    },
    {
      type: "invoke",
      contract: params.anonymizerAddress,
      calldata: [
        conversionId,
        params.nullifier,
        "${openNoteIds[0]}",
        params.authorizationExpiry,
      ],
    },
  ];
}

/**
 * Extracts the wallet-resolved note id from the prepared pool call by locating
 * the exact helper calldata window. It fails closed if the upstream encoding
 * changes or the match is ambiguous.
 */
export function extractPreparedOpenNoteId(
  prepared: STRK20_CALL_AND_PROOF,
  params: PrivateClaimActionParams,
): string {
  const calldata = Array.from(prepared.call.calldata ?? []).map(String);
  const conversionId = toFelt(params.conversionId);
  const matches: string[] = [];

  for (let index = 0; index + 3 < calldata.length; index += 1) {
    if (
      feltEquals(calldata[index], conversionId) &&
      feltEquals(calldata[index + 1], params.nullifier) &&
      feltEquals(calldata[index + 3], params.authorizationExpiry)
    ) {
      matches.push(calldata[index + 2]);
    }
  }

  const unique = Array.from(
    new Set(matches.map((match) => `0x${BigInt(match).toString(16)}`)),
  );
  if (unique.length !== 1 || BigInt(unique[0]) === BigInt(0)) {
    throw new Error(
      "Unable to resolve one exact open-note ID from the prepared Wallet API call; submission is blocked",
    );
  }
  return unique[0];
}

export async function preparePrivateClaim(
  account: WalletAccountV6,
  params: PrivateClaimActionParams,
  simulate: boolean,
): Promise<PreparedPrivateClaim> {
  const actions = buildPrivateClaimActions(params);
  const prepared = await account.strk20PrepareInvoke(actions, simulate);
  return {
    actions,
    prepared,
    noteId: extractPreparedOpenNoteId(prepared, params),
  };
}

export async function submitPrivateClaim(
  account: WalletAccountV6,
  params: PrivateClaimActionParams,
  expectedNoteId: string,
): Promise<{ transactionHash: string; noteId: string }> {
  const checked = await preparePrivateClaim(account, params, true);
  if (!feltEquals(checked.noteId, expectedNoteId)) {
    throw new Error("Prepared open-note ID changed after approval; refusing to redirect the reward");
  }
  const result = await account.strk20InvokeTransaction(checked.actions);
  if (!result.transaction_hash) throw new Error("Privacy wallet returned no transaction hash");
  const waiter = (account as unknown as {
    waitForTransaction?: (hash: string) => Promise<unknown>;
  }).waitForTransaction;
  if (waiter) {
    await Promise.race([
      waiter.call(account, result.transaction_hash),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Transaction confirmation timed out; keep the hash and retry status polling")), 120_000),
      ),
    ]);
  }
  return { transactionHash: result.transaction_hash, noteId: checked.noteId };
}
