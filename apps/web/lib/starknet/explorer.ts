import { APP_CONFIG } from "../utils/constants";

const isFelt = (value: string) => /^0x[0-9a-f]{1,64}$/i.test(value) && BigInt(value) !== 0n;

export function getExplorerTxUrl(txHash: string): string | null {
  if (!isFelt(txHash)) return null;
  return `${APP_CONFIG.explorerBaseUrl}/tx/${txHash}`;
}

export function getExplorerContractUrl(contractAddress: string): string | null {
  if (!isFelt(contractAddress)) return null;
  return `${APP_CONFIG.explorerBaseUrl}/contract/${contractAddress}`;
}

export function getExplorerTokenUrl(tokenAddress: string): string | null {
  if (!isFelt(tokenAddress)) return null;
  return `${APP_CONFIG.explorerBaseUrl}/token/${tokenAddress}`;
}
