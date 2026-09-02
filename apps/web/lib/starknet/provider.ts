import { RpcProvider } from "starknet";
import { APP_CONFIG } from "../utils/constants";

let provider: RpcProvider | null = null;
let sepoliaCheck: Promise<void> | null = null;

export function getStarknetProvider(): RpcProvider {
  if (!provider) provider = new RpcProvider({ nodeUrl: APP_CONFIG.rpcUrl });
  return provider;
}

export function assertSepoliaProvider(rpc = getStarknetProvider()): Promise<void> {
  if (!sepoliaCheck) {
    sepoliaCheck = rpc.getChainId().then((chainId) => {
      if (BigInt(String(chainId)) !== BigInt("0x534e5f5345504f4c4941")) {
        throw new Error("Configured RPC is not Starknet Sepolia");
      }
    });
  }
  return sepoliaCheck;
}
