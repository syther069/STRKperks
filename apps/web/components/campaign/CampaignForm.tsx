"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContractActions } from "../../lib/starknet/useContractActions";
import { getExplorerTxUrl } from "../../lib/starknet/explorer";
import { PRODUCTION_CONFIG_READY } from "../../lib/utils/constants";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

export function CampaignForm() {
  const router = useRouter(); const actions = useContractActions();
  const [reward, setReward] = useState("1"); const [maximum, setMaximum] = useState("100"); const [duration, setDuration] = useState("30"); const [busy, setBusy] = useState(false); const [hash, setHash] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null); setHash(null);
    try {
      const now = Math.floor(Date.now() / 1000); const days = Number(duration); const max = Number(maximum);
      if (!Number.isInteger(days) || days < 1 || !Number.isInteger(max) || max < 1) throw new Error("Duration and claim limit must be positive whole numbers");
      const tx = await actions.createCampaign({ rewardAmount: reward, maxClaims: String(max), startTime: String(now), endTime: String(now + days * 86400), salt: `0x${Date.now().toString(16)}` });
      setHash(tx);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Campaign creation failed"); }
    finally { setBusy(false); }
  };
  const url = hash ? getExplorerTxUrl(hash) : null;
  if (!PRODUCTION_CONFIG_READY) return <Card className="border-status-warning/40"><h2 className="font-semibold">Verified deployment required</h2><p className="mt-2 text-sm text-fg-secondary">Campaign creation is disabled until a verified factory manifest is configured. No local campaign will be created.</p></Card>;
  if (hash) return <Card className="space-y-5 border-status-success/40"><div><p className="text-xs text-status-success">Confirmed</p><h2 className="mt-1 text-lg font-semibold">Campaign deployment accepted</h2><p className="mt-2 text-sm text-fg-secondary">The factory deployed and wired the campaign and router. Refresh the registry to discover its returned address.</p></div>{url && <a href={url} target="_blank" rel="noreferrer" className="font-mono text-xs text-brand-privacy">{hash}</a>}<Button onClick={() => router.push("/campaigns")}>View campaigns</Button></Card>;
  return <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"><div className="space-y-5"><Card className="space-y-5"><div><h2 className="font-semibold">Reward pool</h2><p className="mt-1 text-xs text-fg-secondary">The factory’s verified token is used for every campaign.</p></div><Input label="Reward per claim" value={reward} onChange={(e) => setReward(e.target.value)} type="number" step="0.000000000000000001" min="0" isMono /><Input label="Maximum claims" value={maximum} onChange={(e) => setMaximum(e.target.value)} type="number" min="1" step="1" isMono /></Card><Card className="space-y-5"><div><h2 className="font-semibold">Claim rules</h2><p className="mt-1 text-xs text-fg-secondary">Start time is set to the confirmed creation time window.</p></div><Input label="Duration in days" value={duration} onChange={(e) => setDuration(e.target.value)} type="number" min="1" step="1" isMono /></Card>{error && <p className="rounded border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error" role="alert">{error}</p>}</div><aside className="h-fit rounded-card border border-border bg-bg-surface p-5 lg:sticky lg:top-24"><p className="text-xs text-fg-muted">Transaction preview</p><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt>Reward</dt><dd className="font-mono">{reward}</dd></div><div className="flex justify-between"><dt>Maximum</dt><dd className="font-mono">{maximum}</dd></div><div className="flex justify-between"><dt>Duration</dt><dd className="font-mono">{duration} days</dd></div></dl><p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-fg-secondary">Creation and funding are public. This action deploys contracts; it does not create a private note.</p><Button className="mt-5 w-full" type="submit" isLoading={busy} disabled={!actions.isReady || busy}>{actions.isReady ? "Create campaign" : "Connect owner wallet on Sepolia"}</Button></aside></form>;
}
