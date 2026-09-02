"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useCampaigns } from "../../hooks/useCampaigns";
import { PRODUCTION_CONFIG_READY } from "../../lib/utils/constants";
import { CampaignCard } from "../../components/campaign/CampaignCard";
import { Button } from "../../components/ui/Button";

export default function CampaignsPage() {
  const { campaigns, loading, error } = useCampaigns();
  return <div className="space-y-7"><header className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end"><div><p className="text-xs text-fg-muted">Starknet registry</p><h1 className="mt-1 text-3xl font-semibold">Campaigns</h1><p className="mt-2 text-sm text-fg-secondary">Only addresses returned by the verified factory are listed.</p></div><Link href="/campaigns/create"><Button leftIcon={<Plus className="size-4" />}>Create campaign</Button></Link></header>
    {!PRODUCTION_CONFIG_READY ? <p className="rounded-card border border-status-warning/40 bg-bg-surface p-6 text-sm text-fg-secondary">Configure a verified deployment to read production campaigns.</p> : error ? <p className="rounded-card border border-status-error/40 bg-bg-surface p-6 text-sm text-fg-secondary" role="alert">{error instanceof Error ? error.message : "RPC read failed"}</p> : loading ? <p className="text-sm text-fg-secondary">Reading Starknet…</p> : campaigns.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{campaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</div> : <p className="rounded-card border border-border bg-bg-surface p-6 text-sm text-fg-secondary">No registered campaigns found.</p>}
  </div>;
}
