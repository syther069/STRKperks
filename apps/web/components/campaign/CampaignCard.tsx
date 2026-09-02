"use client";

import Link from "next/link";
import type { Campaign } from "../../lib/types";
import { StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { formatDate, formatSTRK, shortenAddress } from "../../lib/utils/format";

export function CampaignCard({ campaign }: { campaign: Campaign; featured?: boolean }) {
  const address = campaign.contractAddress || campaign.id;
  return <article className="rounded-card border border-border bg-bg-surface p-5"><div className="flex items-start justify-between gap-4"><div><StatusBadge status={campaign.status} /><h2 className="mt-3 text-base font-semibold text-fg-primary">{campaign.name}</h2><p className="mt-1 font-mono text-xs text-fg-muted">{shortenAddress(address, 7)}</p></div><span className="rounded border border-brand-privacy/30 px-2 py-1 text-[10px] text-brand-privacy">STARKNET</span></div><dl className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-4 text-xs"><div><dt className="text-fg-muted">Reward</dt><dd className="mt-1 font-mono text-brand-reward">{formatSTRK(campaign.rewardAmount)} {campaign.tokenSymbol}</dd></div><div><dt className="text-fg-muted">Available</dt><dd className="mt-1 font-mono text-fg-primary">{formatSTRK(campaign.remainingBudget)}</dd></div><div><dt className="text-fg-muted">Claims</dt><dd className="mt-1 font-mono text-fg-primary">{campaign.settledClaims} / {campaign.maxClaims}</dd></div><div><dt className="text-fg-muted">Ends</dt><dd className="mt-1 font-mono text-fg-primary">{formatDate(campaign.endTime)}</dd></div></dl><div className="mt-4 grid grid-cols-2 gap-2"><Link href={`/campaigns/${address}`}><Button variant="secondary" className="w-full">Manage</Button></Link><Link href={`/claim/${address}`}><Button variant="privacy" className="w-full">Claim</Button></Link></div></article>;
}
