"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createStore } from "@starknet-io/get-starknet-discovery";
import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";
import {
  RpcProvider,
  WalletAccountV6,
  compareVersions,
  walletV6,
} from "starknet-strk20";
import { APP_CONFIG } from "../../lib/utils/constants";

export type Strk20WalletOption = {
  name: string;
  icon: string;
};

type Strk20WalletContextValue = {
  wallets: Strk20WalletOption[];
  account: WalletAccountV6 | null;
  address: string | null;
  walletName: string | null;
  versions: string[];
  chainId: string | null;
  supported: boolean;
  connecting: boolean;
  error: string | null;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
};

const Strk20WalletContext = createContext<Strk20WalletContextValue | null>(null);

export function Strk20WalletProvider({ children }: { children: React.ReactNode }) {
  const [discovered, setDiscovered] = useState<WalletWithStarknetFeatures[]>([]);
  const [selected, setSelected] = useState<WalletWithStarknetFeatures | null>(null);
  const [account, setAccount] = useState<WalletAccountV6 | null>(null);
  const [versions, setVersions] = useState<string[]>([]);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const store = createStore();
    let active = true;
    const update = (wallets: readonly WalletWithStarknetFeatures[]) => {
      if (active) setDiscovered([...wallets]);
    };
    const unsubscribe = store.subscribe(update);
    Promise.resolve(store.getWallets()).then(update);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const disconnect = useCallback(async () => {
    account?.unsubscribeChange();
    if (selected) {
      await selected.features["standard:disconnect"].disconnect();
    }
    setAccount(null);
    setSelected(null);
    setVersions([]);
    setChainId(null);
    setError(null);
  }, [account, selected]);

  const connect = useCallback(
    async (walletName: string) => {
      const wallet = discovered.find((candidate) => candidate.name === walletName);
      if (!wallet) throw new Error("Selected privacy wallet is no longer available");
      setConnecting(true);
      setError(null);
      try {
        const advertised = (await walletV6.supportedWalletApi(wallet)).map(String);
        if (!advertised.some((version) => compareVersions(version, "0.10.3") >= 0)) {
          throw new Error(`${wallet.name} does not advertise Wallet API 0.10.3+ STRK20 support`);
        }
        const provider = new RpcProvider({ nodeUrl: APP_CONFIG.rpcUrl });
        const connected = await WalletAccountV6.connect(provider, wallet);
        const selectedAccount = wallet.accounts.find(
          (candidate) => BigInt(candidate.address) === BigInt(connected.address),
        );
        const connectedChain = selectedAccount?.chains.find((chain) => /SN_SEPOLIA/i.test(chain));
        if (!connectedChain) {
          connected.unsubscribeChange();
          await wallet.features["standard:disconnect"].disconnect();
          throw new Error(`${wallet.name} is not connected to Starknet Sepolia`);
        }
        connected.onChange(() => {
          connected.unsubscribeChange();
          setAccount(null);
          setSelected(null);
          setVersions([]);
          setChainId(null);
          setError("Privacy wallet account or network changed. Reconnect on Starknet Sepolia before continuing.");
        });
        setSelected(wallet);
        setVersions(advertised);
        setChainId(connectedChain);
        setAccount(connected);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Privacy wallet connection failed";
        setError(message);
        throw cause;
      } finally {
        setConnecting(false);
      }
    },
    [discovered],
  );

  const value = useMemo<Strk20WalletContextValue>(
    () => ({
      wallets: discovered.map((wallet) => ({ name: wallet.name, icon: wallet.icon })),
      account,
      address: account?.address ?? null,
      walletName: selected?.name ?? null,
      versions,
      chainId,
      supported: versions.some((version) => compareVersions(version, "0.10.3") >= 0),
      connecting,
      error,
      connect,
      disconnect,
    }),
    [account, chainId, connect, connecting, discovered, disconnect, error, selected, versions],
  );

  return <Strk20WalletContext.Provider value={value}>{children}</Strk20WalletContext.Provider>;
}

export function useStrk20Wallet(): Strk20WalletContextValue {
  const value = useContext(Strk20WalletContext);
  if (!value) throw new Error("useStrk20Wallet must be used inside Strk20WalletProvider");
  return value;
}
