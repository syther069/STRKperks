"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCampaign } from "../../../hooks/useCampaigns";
import { LivePrivateClaimPanel } from "../../../components/claim/LivePrivateClaimPanel";

export default function ClaimPage() {
  const { campaignAddress } = useParams<{ campaignAddress: string }>();
  const campaign = useCampaign(campaignAddress);
  if (campaign.isLoading) return <p className="text-sm text-fg-secondary">Reading claim configuration…</p>;
  if (campaign.error || !campaign.data) return <section className="rounded-card border border-status-error/40 bg-bg-surface p-6" role="alert"><h1 className="font-semibold">Claim unavailable</h1><p className="mt-2 text-sm text-fg-secondary">A verified campaign contract could not be read at this address.</p><Link href="/campaigns" className="mt-4 inline-block text-brand-primary">Back to campaigns</Link></section>;
  return <div className="mx-auto max-w-2xl space-y-5"><Link href={`/campaigns/${campaignAddress}`} className="text-sm text-fg-muted">← Campaign workspace</Link><LivePrivateClaimPanel campaign={campaign.data} /></div>;
}
