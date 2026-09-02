import { getStarknetProvider } from "../starknet/provider";
import type { PublicTransactionStatus } from "../types";

function value(record: unknown, key: string): unknown {
  return typeof record === "object" && record !== null ? (record as Record<string, unknown>)[key] : undefined;
}

export async function classifyReceipt(hash: string): Promise<{ status: PublicTransactionStatus; error?: string }> {
  const provider = getStarknetProvider();
  try {
    const receipt = await provider.getTransactionReceipt(hash);
    const execution = String(value(receipt, "execution_status") ?? value(receipt, "executionStatus") ?? "");
    const finality = String(value(receipt, "finality_status") ?? value(receipt, "finalityStatus") ?? "");
    if (/REVERTED/i.test(execution)) {
      return { status: "reverted", error: String(value(receipt, "revert_reason") ?? "Transaction reverted") };
    }
    if (/ACCEPTED/i.test(finality)) return { status: "accepted" };
    if (/REJECTED/i.test(finality)) return { status: "rejected", error: "Transaction rejected" };
    return { status: "pending" };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Receipt is not visible yet";
    try {
      const transaction = await provider.getTransactionStatus(hash);
      const finality = String(value(transaction, "finality_status") ?? value(transaction, "finalityStatus") ?? "");
      const execution = String(value(transaction, "execution_status") ?? value(transaction, "executionStatus") ?? "");
      if (/REJECTED/i.test(finality)) return { status: "rejected", error: message };
      if (/REVERTED/i.test(execution)) return { status: "reverted", error: message };
      if (/ACCEPTED/i.test(finality)) return { status: "accepted" };
    } catch {
      // A submitted hash may not yet be indexed by the RPC. Keep it recoverable.
    }
    if (/not found|not received|pending/i.test(message)) return { status: "pending" };
    return { status: "unknown", error: message };
  }
}
