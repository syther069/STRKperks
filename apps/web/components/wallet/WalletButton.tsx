"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useNetwork } from "@starknet-react/core";
import { Wallet } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { shortenAddress } from "../../lib/utils/format";
import { useStrk20Wallet } from "./Strk20WalletProvider";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const privacy = useStrk20Wallet();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex min-h-9 items-center gap-2 rounded-btn border border-border bg-bg-raised px-3 font-mono text-xs text-fg-primary">
        <Wallet className="size-4 text-brand-primary" />
        <span>{isConnected ? shortenAddress(address || "", 5) : "Connect"}</span>
        {privacy.supported && <span className="rounded border border-brand-privacy/30 px-1.5 py-0.5 text-[9px] text-brand-privacy">STRK20</span>}
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Wallet connections" description="Public account writes and privacy-wallet actions are capability-separated.">
        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-xs font-semibold text-fg-muted">Public account wallet</h3>
            {isConnected ? (
              <div className="flex items-center justify-between rounded border border-border bg-bg-surface p-3 text-sm">
                <div><p className="font-mono text-xs">{shortenAddress(address || "", 8)}</p><p className="mt-1 text-[10px] text-fg-muted">{chain?.name || "Unknown network"}</p></div>
                <Button size="sm" variant="ghost" onClick={() => disconnect()}>Disconnect</Button>
              </div>
            ) : connectors.map((connector) => (
              <button key={connector.id} className="mb-2 flex w-full items-center justify-between rounded border border-border bg-bg-surface p-3 text-sm" onClick={() => connect({ connector })}>
                <span>{connector.name}</span><span className="text-brand-primary">Connect</span>
              </button>
            ))}
          </section>
          <section className="border-t border-border pt-4">
            <h3 className="mb-2 text-xs font-semibold text-fg-muted">Privacy-aware wallet</h3>
            {privacy.account ? (
              <div className="flex items-center justify-between rounded border border-brand-privacy/30 bg-bg-surface p-3 text-sm">
                <div><p>{privacy.walletName}</p><p className="mt-1 font-mono text-[10px] text-fg-muted">{shortenAddress(privacy.address || "", 8)}</p></div>
                <Button size="sm" variant="ghost" onClick={() => void privacy.disconnect()}>Disconnect</Button>
              </div>
            ) : privacy.wallets.length ? privacy.wallets.map((wallet) => (
              <button key={wallet.name} disabled={privacy.connecting} className="mb-2 flex w-full items-center justify-between rounded border border-brand-privacy/30 bg-bg-surface p-3 text-sm disabled:opacity-50" onClick={() => void privacy.connect(wallet.name).catch(() => undefined)}>
                <span>{wallet.name}</span><span className="text-brand-privacy">Check capability</span>
              </button>
            )) : <p className="text-xs text-fg-secondary">No Wallet API wallet was discovered.</p>}
            <p className="mt-2 text-[10px] leading-4 text-fg-muted">Requires Wallet API 0.10.3+ on Starknet Sepolia. StrkPerks never requests a viewing key.</p>
            {privacy.error && <p className="mt-2 text-xs text-status-error">{privacy.error}</p>}
          </section>
        </div>
      </Modal>
    </>
  );
}
