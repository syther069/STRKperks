import { StarkZap } from "starkzap";
import type { WalletInterface } from "starkzap";
import { APP_CONFIG } from "../utils/constants";

/**
 * Creates the StarkZap SDK without selecting a signer. Signer selection must
 * happen at the application trust boundary (injected wallet, Privy, or a
 * server-only signer); never place a private key in this module or client code.
 */
export function createStarkZap() {
  return new StarkZap({
    network: APP_CONFIG.network as "sepolia" | "mainnet",
    rpcUrl: APP_CONFIG.rpcUrl,
  });
}

export type StarkZapWallet = WalletInterface;

export async function ensureWalletReady(wallet: StarkZapWallet): Promise<void> {
  await wallet.ensureReady({ deploy: "if_needed" });
}
