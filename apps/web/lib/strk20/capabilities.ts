export type Strk20Capability = {
  supported: boolean;
  versions: string[];
  reason?: string;
};

type WalletApiProbe = {
  supportedWalletApi?: () => Promise<unknown>;
};

/** Capability-only probe. It never reads balances, notes, or viewing keys. */
export async function detectStrk20WalletApi(wallet: unknown): Promise<Strk20Capability> {
  const probe = wallet as WalletApiProbe | null;
  if (!probe?.supportedWalletApi) {
    return { supported: false, versions: [], reason: "Wallet API capability query unavailable" };
  }

  try {
    const raw = await probe.supportedWalletApi();
    const versions = Array.isArray(raw)
      ? raw.filter((version): version is string => typeof version === "string")
      : [];
    const supported = versions.some((version) => {
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
      if (!match) return false;
      const [, major, minor, patch] = match.map(Number);
      return major > 0 || (minor > 10 || (minor === 10 && patch >= 3));
    });
    return { supported, versions, reason: supported ? undefined : "Wallet API 0.10.3+ not advertised" };
  } catch {
    return { supported: false, versions: [], reason: "Wallet capability query failed" };
  }
}
