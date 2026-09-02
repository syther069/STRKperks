"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { PRODUCTION_CONFIG_READY } from "../lib/utils/constants";
import { readCampaign, readCampaignAddresses } from "../lib/starknet/readCampaign";

export function useCampaignAddresses() {
  return useQuery({
    queryKey: ["starknet", "campaign-addresses"],
    queryFn: () => readCampaignAddresses(),
    enabled: PRODUCTION_CONFIG_READY,
    refetchInterval: 30_000,
  });
}

export function useCampaigns() {
  const addresses = useCampaignAddresses();
  const campaigns = useQueries({
    queries: (addresses.data ?? []).map((address) => ({
      queryKey: ["starknet", "campaign", address],
      queryFn: () => readCampaign(address),
      staleTime: 15_000,
    })),
  });
  return {
    addresses,
    campaigns: campaigns.map((query) => query.data).filter((value) => value !== undefined),
    loading: addresses.isLoading || campaigns.some((query) => query.isLoading),
    error: addresses.error ?? campaigns.find((query) => query.error)?.error ?? null,
  };
}

export function useCampaign(address: string) {
  return useQuery({
    queryKey: ["starknet", "campaign", address],
    queryFn: () => readCampaign(address),
    enabled: PRODUCTION_CONFIG_READY && /^0x[0-9a-f]+$/i.test(address),
    refetchInterval: 20_000,
  });
}
