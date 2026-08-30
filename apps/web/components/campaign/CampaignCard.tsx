"use client";

import React from "react";
import Link from "next/link";
import { Campaign } from "../../lib/types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { StatusBadge, PrivacyBadge } from "../ui/Badge";
import { formatSTRK, formatDate, shortenAddress } from "../../lib/utils/format";
import { ArrowUpRight, ShieldCheck, UserCheck, Lock, ExternalLink } from "lucide-react";

export interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const percentClaimed = Math.min(
    100,
    Math.round((campaign.settledClaims / (campaign.maxClaims || 1)) * 100)
  );

  return (
    <Card className="hover:border-border-hover transition-all flex flex-col justify-between h-full group">
      <div className="space-y-4">
        {/* Top Badges & Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={campaign.status} />
            <PrivacyBadge type="shielded" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-fg-primary group-hover:text-brand-primary transition-colors line-clamp-1">
              {campaign.name}
            </h3>
            <p className="text-xs text-fg-secondary mt-1 line-clamp-2 leading-relaxed">
              {campaign.description}
            </p>
          </div>
        </div>

        {/* Reward Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded bg-bg-raised/70 border border-border/80 text-xs">
          <div>
            <span className="text-[11px] text-fg-muted uppercase tracking-wider block">
              Reward / Conversion
            </span>
            <span className="text-sm font-bold font-mono text-brand-reward mt-0.5 block">
              {formatSTRK(campaign.rewardAmount)} {campaign.tokenSymbol}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-fg-muted uppercase tracking-wider block">
              Remaining Budget
            </span>
            <span className="text-sm font-bold font-mono text-fg-primary mt-0.5 block">
              {formatSTRK(campaign.remainingBudget)} {campaign.tokenSymbol}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-fg-muted font-mono">
            <span>Claims Settled: {campaign.settledClaims} / {campaign.maxClaims}</span>
            <span>{percentClaimed}%</span>
          </div>
          <div className="w-full h-1.5 bg-bg-subtle rounded-full overflow-hidden border border-border/50">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-reward transition-all duration-300 rounded-full"
              style={{ width: `${percentClaimed}%` }}
            />
          </div>
        </div>

        {/* Technical Metadata Monospace */}
        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-fg-muted">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-brand-privacy" />
            <span className="truncate max-w-[120px]">{campaign.nullifierNamespace}</span>
          </div>
          <span>Expires {formatDate(campaign.endTime)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-border flex items-center gap-2">
        <Link href={`/campaigns/${campaign.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full text-xs">
            Manage Campaign
          </Button>
        </Link>
        <Link href={`/claim/${campaign.id}`} className="flex-1">
          <Button
            variant="privacy"
            size="sm"
            className="w-full text-xs"
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            Claim Link
          </Button>
        </Link>
      </div>
    </Card>
  );
}
