"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { useCampaign } from "../../../hooks/useCampaigns";
import { FundingPanel } from "../../../components/campaign/FundingPanel";
import { ConversionApprovalTable } from "../../../components/campaign/ConversionApprovalTable";
import { CampaignControls } from "../../../components/campaign/CampaignControls";
import { StatusBadge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { getExplorerContractUrl } from "../../../lib/starknet/explorer";
import { formatDate, formatSTRK, shortenAddress } from "../../../lib/utils/format";

export default function CampaignDetailPage() {
  const { address } = useParams<{ address: string }>();
  const campaign = useCampaign(address);
  if (campaign.isLoading) return <p className="text-sm text-fg-secondary">Reading campaign from Starknet…</p>;
  if (campaign.error || !campaign.data) return <section className="rounded-card border border-status-error/40 bg-bg-surface p-6" role="alert"><h1 className="font-semibold">Campaign unavailable</h1><p className="mt-2 text-sm text-fg-secondary">{campaign.error instanceof Error ? campaign.error.message : "No contract state was returned for this address."}</p><Link href="/campaigns" className="mt-4 inline-block text-sm text-brand-primary">Back to campaigns</Link></section>;
  const item = campaign.data;
  const explorer = getExplorerContractUrl(address);
  return <div className="space-y-7"><header className="border-b border-border pb-6"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><StatusBadge status={item.status} /><h1 className="mt-3 text-3xl font-semibold">{item.name}</h1><p className="mt-2 font-mono text-xs text-fg-muted">{address}</p></div><div className="flex gap-2">{explorer && <a href={explorer} target="_blank" rel="noreferrer"><Button variant="secondary" rightIcon={<ExternalLink className="size-4" />}>View contract</Button></a>}<Link href={`/claim/${address}`}><Button variant="privacy">Open claim</Button></Link></div></div></header>
    <section className="grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2 xl:grid-cols-4"><Metric label="Available budget" value={`${formatSTRK(item.remainingBudget)} ${item.tokenSymbol}`} /><Metric label="Reward per claim" value={`${formatSTRK(item.rewardAmount)} ${item.tokenSymbol}`} /><Metric label="Confirmed claims" value={`${item.settledClaims} / ${item.maxClaims}`} /><Metric label="Campaign ends" value={formatDate(item.endTime)} /></section>
    <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><div className="space-y-6"><FundingPanel campaign={item} /><CampaignControls campaign={item} /><dl className="rounded-card border border-border bg-bg-surface p-5 text-sm"><Row label="Owner" value={shortenAddress(item.ownerAddress, 7)} /><Row label="Reward token" value={shortenAddress(item.rewardToken, 7)} /><Row label="Settlement router" value={shortenAddress(item.routerAddress || "", 7)} /><Row label="Data source" value="Starknet RPC" /></dl></div><ConversionApprovalTable campaign={item} /></section>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="bg-bg-surface p-5"><p className="text-xs text-fg-muted">{label}</p><p className="mt-2 font-mono text-lg text-fg-primary">{value}</p></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0"><dt className="text-fg-muted">{label}</dt><dd className="font-mono text-fg-primary">{value}</dd></div>; }
