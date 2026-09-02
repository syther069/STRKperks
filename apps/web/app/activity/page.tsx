"use client";

import { useTransactionRecovery } from "../../hooks/useTransactionRecovery";
import { getExplorerTxUrl } from "../../lib/starknet/explorer";
import { shortenAddress, shortenHash } from "../../lib/utils/format";

export default function ActivityPage() {
  const records = useTransactionRecovery();
  return <div className="space-y-7"><header className="border-b border-border pb-6"><p className="text-xs text-fg-muted">Public evidence</p><h1 className="mt-1 text-3xl font-semibold">Activity</h1><p className="mt-2 text-sm text-fg-secondary">Wallet-returned transaction hashes and current Starknet receipt states. Private wallet material is never stored here.</p></header>{records.length ? <ol className="divide-y divide-border overflow-hidden rounded-card border border-border bg-bg-surface">{records.map((record) => { const url = record.hash ? getExplorerTxUrl(record.hash) : null; return <li key={record.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto]"><div><div className="flex items-center gap-2"><span className="font-medium text-fg-primary">{record.action.replaceAll("_", " ")}</span><span className="rounded border border-border px-2 py-0.5 text-[10px] uppercase text-fg-muted">{record.status}</span></div><p className="mt-2 font-mono text-xs text-fg-muted">Target {shortenAddress(record.target, 6)}</p>{record.error && <p className="mt-2 text-xs text-status-warning">{record.error}</p>}</div>{url && <a href={url} target="_blank" rel="noreferrer" className="font-mono text-xs text-brand-privacy">{shortenHash(record.hash!, 7)}</a>}</li>; })}</ol> : <p className="rounded-card border border-border bg-bg-surface p-6 text-sm text-fg-secondary">No production transactions have been submitted in this browser.</p>}</div>;
}
