import { APP_CONFIG, CONTRACT_ADDRESSES } from "../utils/constants";
import { executeShieldedDeposit, ShieldDepositParams, ShieldDepositResult } from "./shield";
import { executePrivateSettlement, SettlementParams, SettlementResult } from "./settlement";

export interface Strk20Wallet {
  /** Wallet API/STRK20-specific method; keep the concrete wallet dependency out of UI. */
  strk20InvokeTransaction?: (actions: unknown[]) => Promise<{ transaction_hash: string }>;
}

export class Strk20Client {
  private network: string;
  private tokenAddress: string;

  constructor() {
    this.network = APP_CONFIG.network;
    this.tokenAddress = CONTRACT_ADDRESSES.strkToken;
  }

  public async shieldBalance(params: ShieldDepositParams): Promise<ShieldDepositResult> {
    return executeShieldedDeposit(params);
  }

  public async settleReward(
    params: SettlementParams,
    consumedNullifiers: Set<string>
  ): Promise<SettlementResult> {
    return executePrivateSettlement(params, consumedNullifiers);
  }

  public async invokePrivateActions(wallet: Strk20Wallet, actions: unknown[]): Promise<string> {
    if (!wallet.strk20InvokeTransaction) {
      throw new Error("Connected wallet does not support the STRK20 Wallet API");
    }
    const result = await wallet.strk20InvokeTransaction(actions);
    if (!result.transaction_hash) throw new Error("STRK20 wallet returned no transaction hash");
    return result.transaction_hash;
  }
}

export const strk20Client = new Strk20Client();
