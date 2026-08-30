import type { Call } from "starknet";

/** Minimal wallet surface shared by injected wallets and StarkZap adapters. */
export interface StarknetWalletAdapter {
  address: string;
  ensureReady?: () => Promise<void>;
  execute: (calls: Call | Call[]) => Promise<{ transaction_hash?: string; hash?: string }>;
  waitForTransaction?: (transactionHash: string) => Promise<unknown>;
}

/** Waits for L2 acceptance when the connected account/provider supports it. */
export async function confirmTransaction(
  wallet: StarknetWalletAdapter,
  transactionHash: string,
): Promise<string> {
  if (wallet.waitForTransaction) await wallet.waitForTransaction(transactionHash);
  return transactionHash;
}

export async function executeContractCalls(
  wallet: StarknetWalletAdapter,
  calls: Call | Call[],
): Promise<string> {
  await wallet.ensureReady?.();
  const result = await wallet.execute(calls);
  const hash = result.transaction_hash || result.hash;
  if (!hash) throw new Error("Wallet returned no transaction hash");
  return hash;
}
