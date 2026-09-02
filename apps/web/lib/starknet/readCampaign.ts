import type { RpcProvider } from "starknet";
import type { Campaign } from "../types";
import { formatTokenAmount } from "./amounts";
import { assertSepoliaProvider, getStarknetProvider } from "./provider";
import { CONTRACT_ADDRESSES } from "../utils/constants";

function felt(result: string[]): string {
  if (!result[0]) throw new Error("Contract read returned no value");
  return result[0];
}

async function call(provider: RpcProvider, address: string, entrypoint: string, calldata: string[] = []) {
  return provider.callContract({ contractAddress: address, entrypoint, calldata });
}

export async function readCampaignAddresses(provider = getStarknetProvider()): Promise<string[]> {
  await assertSepoliaProvider(provider);
  const factory = CONTRACT_ADDRESSES.campaignFactory;
  if (!factory) return [];
  const count = Number(BigInt(felt(await call(provider, factory, "get_campaign_count"))));
  return Promise.all(
    Array.from({ length: count }, async (_, index) =>
      felt(await call(provider, factory, "get_campaign", [`0x${index.toString(16)}`])),
    ),
  );
}

export async function readCampaign(address: string, provider = getStarknetProvider()): Promise<Campaign> {
  await assertSepoliaProvider(provider);
  const [owner, token, router, reward, budget, claimed, maximum, start, end, paused, closed] = await Promise.all([
    call(provider, address, "get_owner"),
    call(provider, address, "get_reward_token"),
    call(provider, address, "get_anonymizer"),
    call(provider, address, "get_reward_amount"),
    call(provider, address, "get_budget"),
    call(provider, address, "get_claimed_count"),
    call(provider, address, "get_max_claims"),
    call(provider, address, "get_start_time"),
    call(provider, address, "get_end_time"),
    call(provider, address, "is_paused"),
    call(provider, address, "is_closed"),
  ]);
  const now = Math.floor(Date.now() / 1000);
  const startTime = Number(BigInt(felt(start)));
  const endTime = Number(BigInt(felt(end)));
  const isPaused = BigInt(felt(paused)) !== 0n;
  const isClosed = BigInt(felt(closed)) !== 0n;
  const rewardRaw = BigInt(felt(reward));
  const budgetRaw = BigInt(felt(budget));
  const claimedCount = BigInt(felt(claimed));
  const status = isClosed ? "closed" : isPaused ? "paused" : now > endTime ? "expired" : "active";
  return {
    id: address,
    contractAddress: address,
    routerAddress: felt(router),
    source: "starknet",
    name: `Campaign ${address.slice(0, 8)}…${address.slice(-6)}`,
    description: "Campaign configuration read directly from Starknet.",
    ownerAddress: felt(owner),
    rewardToken: felt(token),
    tokenSymbol: "TOKEN",
    rewardAmount: formatTokenAmount(rewardRaw.toString()),
    totalBudget: formatTokenAmount((budgetRaw + rewardRaw * claimedCount).toString()),
    remainingBudget: formatTokenAmount(budgetRaw.toString()),
    maxClaims: Number(BigInt(felt(maximum))),
    settledClaims: Number(claimedCount),
    duplicateBlockedCount: 0,
    startTime,
    endTime,
    status,
    nullifierNamespace: address,
    isShielded: false,
    createdAt: startTime,
  };
}

export async function readNullifierUsed(campaign: string, nullifier: string, provider = getStarknetProvider()) {
  await assertSepoliaProvider(provider);
  if (!CONTRACT_ADDRESSES.nullifierRegistry) throw new Error("NullifierRegistry is not configured");
  return BigInt(felt(await call(provider, CONTRACT_ADDRESSES.nullifierRegistry, "is_nullifier_used", [campaign, nullifier]))) !== 0n;
}
