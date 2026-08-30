"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDemoStore } from "@/lib/store/demoStore";
import { FundingPanel } from "@/components/campaign/FundingPanel";
import { ConversionApprovalTable } from "@/components/campaign/ConversionApprovalTable";
import { StatusBadge, PrivacyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatSTRK, formatDate, shortenAddress } from "@/lib/utils/format";
import { getExplorerContractUrl } from "@/lib/starknet/explorer";
import { ChevronLeft, ArrowUpRight, Lock, ExternalLink, ShieldCheck, UserCheck } from "lucide-react";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.campaignId as string;
  const { campaigns } = useDemoStore();

  const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0];

  if (!campaign) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="text-lg font-bold text-fg-primary">Campaign Not Found</div>
        <Link href="/campaigns">
          <Button variant="secondary">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const percentClaimed = Math.min(
    100,
    Math.round((campaign.settledClaims / (campaign.maxClaims || 1)) * 100)
  );

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Campaigns</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="p-6 rounded-card bg-bg-surface border border-border space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={campaign.status} />
              <PrivacyBadge type="shielded" />
            </div>
            <h1 className="text-2xl font-bold text-fg-primary">{campaign.name}</h1>
            <p className="text-xs text-fg-secondary max-w-2xl">{campaign.description}</p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link href={`/claim/${campaign.id}`}>
              <Button
                variant="privacy"
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                Open Recipient Claim Page
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Specs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border font-mono text-xs">
          <div>
            <span className="text-[11px] text-fg-muted uppercase tracking-wider font-sans block">
              Reward / Conversion
            </span>
            <span className="text-sm font-bold text-brand-reward mt-0.5 block">
              {formatSTRK(campaign.rewardAmount)} {campaign.tokenSymbol}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-fg-muted uppercase tracking-wider font-sans block">
              Claims Settled
            </span>
            <span className="text-sm font-bold text-fg-primary mt-0.5 block">
              {campaign.settledClaims} / {campaign.maxClaims} ({percentClaimed}%)
            </span>
          </div>
          <div>
            <span className="text-[11px] text-fg-muted uppercase tracking-wider font-sans block">
              Nullifier Namespace
            </span>
            <span className="text-sm font-bold text-brand-primary mt-0.5 block truncate">
              {campaign.nullifierNamespace}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-fg-muted uppercase tracking-wider font-sans block">
              Expires
            </span>
            <span className="text-sm font-bold text-fg-secondary mt-0.5 block">
              {formatDate(campaign.endTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Funding Panel on Left/Top, Approvals on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <FundingPanel campaign={campaign} />

          {/* Technical Specs Card */}
          <Card className="p-5 space-y-3 text-xs font-mono">
            <div className="text-[11px] text-fg-muted uppercase font-sans font-semibold pb-2 border-b border-border">
              Contract Metadata
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted font-sans">Campaign ID:</span>
              <span className="text-fg-primary truncate max-w-[180px]">{campaign.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted font-sans">Owner Address:</span>
              <span className="text-fg-secondary">{shortenAddress(campaign.ownerAddress, 4)}</span>
            </div>
            {campaign.contractAddress && (
              <div className="flex justify-between">
                <span className="text-fg-muted font-sans">Contract on L2:</span>
                <a
                  href={getExplorerContractUrl(campaign.contractAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-privacy hover:underline inline-flex items-center gap-1"
                >
                  {shortenAddress(campaign.contractAddress, 3)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-fg-muted font-sans">Duplicate Replays Blocked:</span>
              <span className="text-status-error font-bold">{campaign.duplicateBlockedCount}</span>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <ConversionApprovalTable campaign={campaign} />
        </div>
      </div>
    </div>
  );
}
