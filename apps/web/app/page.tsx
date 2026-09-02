"use client";

import Link from "next/link";
import { ArrowRight, Database, Plus, ShieldCheck } from "lucide-react";
import { useCampaigns } from "../hooks/useCampaigns";
import { PRODUCTION_CONFIG_READY } from "../lib/utils/constants";
import { CampaignCard } from "../components/campaign/CampaignCard";
import { Button } from "../components/ui/Button";

export default function DashboardPage() {
  const { campaigns, loading, error } = useCampaigns();
  const totalBudget = campaigns.reduce((total, campaign) => total + Number(campaign.remainingBudget), 0);
  const settled = campaigns.reduce((total, campaign) => total + campaign.settledClaims, 0);
  return <div className="space-y-8">
    <header className="border-b border-border pb-8">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-brand-primary">Reward operations</p>
      <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl"><h1 className="text-3xl font-semibold text-fg-primary">Campaign settlement control</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-fg-secondary">Inspect public reward capital, approve exact conversions, and follow every Starknet transaction from wallet submission to confirmed state.</p></div>
        <Link href="/campaigns/create"><Button leftIcon={<Plus className="size-4" />}>Create campaign</Button></Link>
      </div>
    </header>
    {!PRODUCTION_CONFIG_READY ? <section className="rounded-card border border-status-warning/40 bg-bg-surface p-6" role="status"><h2 className="text-base font-semibold text-fg-primary">Production deployment not configured</h2><p className="mt-2 text-sm text-fg-secondary">Verified Sepolia addresses are required. Production never falls back to demo campaigns.</p><Link href="/demo" className="mt-4 inline-flex items-center gap-2 text-sm text-brand-primary">Open labelled simulation <ArrowRight className="size-4" /></Link></section>
      : error ? <section className="rounded-card border border-status-error/40 bg-bg-surface p-6" role="alert"><h2 className="font-semibold text-fg-primary">Starknet data unavailable</h2><p className="mt-2 text-sm text-fg-secondary">{error instanceof Error ? error.message : "RPC read failed"}</p></section>
      : <><section className="grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-3" aria-label="Live campaign summary">{[["Campaigns", loading ? "—" : campaigns.length.toString(), Database], ["Available reward capital", loading ? "—" : totalBudget.toLocaleString(), ShieldCheck], ["Confirmed claims", loading ? "—" : settled.toString(), ShieldCheck]].map(([label, value, Icon]) => <div key={String(label)} className="bg-bg-surface p-5"><Icon className="size-4 text-brand-privacy" aria-hidden="true" /><p className="mt-5 text-xs text-fg-muted">{String(label)}</p><p className="mt-1 font-mono text-2xl text-fg-primary">{String(value)}</p></div>)}</section>
      <section><div className="mb-4 flex items-end justify-between"><div><p className="text-xs text-fg-muted">Live Starknet state</p><h2 className="mt-1 text-xl font-semibold">Campaigns</h2></div><Link href="/campaigns" className="text-sm text-brand-primary">View all</Link></div>{loading ? <p className="text-sm text-fg-secondary">Reading campaign registry…</p> : campaigns.length ? <div className="grid gap-4 lg:grid-cols-2">{campaigns.slice(0, 4).map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</div> : <p className="rounded-card border border-border bg-bg-surface p-6 text-sm text-fg-secondary">No registered campaigns were returned by the configured factory.</p>}</section></>}
  </div>;
}
