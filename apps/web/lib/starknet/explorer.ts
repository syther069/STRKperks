import { APP_CONFIG } from "../utils/constants";

export function getExplorerTxUrl(txHash: string): string {
  if (!txHash) return APP_CONFIG.explorerBaseUrl;
  return `${APP_CONFIG.explorerBaseUrl}/tx/${txHash}`;
}

export function getExplorerContractUrl(contractAddress: string): string {
  if (!contractAddress) return APP_CONFIG.explorerBaseUrl;
  return `${APP_CONFIG.explorerBaseUrl}/contract/${contractAddress}`;
}

export function getExplorerTokenUrl(tokenAddress: string): string {
  if (!tokenAddress) return APP_CONFIG.explorerBaseUrl;
  return `${APP_CONFIG.explorerBaseUrl}/token/${tokenAddress}`;
}
