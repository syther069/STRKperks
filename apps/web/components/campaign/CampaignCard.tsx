"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Campaign } from "../../lib/types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { StatusBadge, PrivacyBadge } from "../ui/Badge";
import { formatSTRK, formatDate } from "../../lib/utils/format";
import { ArrowUpRight, Lock } from "lucide-react";

export interface CampaignCardProps {
  campaign: Campaign;
  featured?: boolean;
}

export function CampaignCard({ campaign, featured = false }: CampaignCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const percentClaimed = Math.min(
    100,
    Math.round((campaign.settledClaims / (campaign.maxClaims || 1)) * 100)
  );

  return (
    <motion.article
      className={featured ? "group" : "group h-full"}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.72 }}
    >
      <Card className="flex h-full flex-col justify-between border-white/[0.075] bg-bg-surface/90 transition-[border-color,background-color,box-shadow] duration-200 group-hover:border-border-hover group-hover:bg-bg-surface group-hover:shadow-card-hover motion-reduce:transition-none">
      <div className={featured ? "space-y-6" : "space-y-4"}>
        {/* Top Badges & Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={campaign.status} />
            <PrivacyBadge type="shielded" />
          </div>

          <div>
            <h3
              className={`font-semibold tracking-tight text-fg-primary transition-colors group-hover:text-brand-primary motion-reduce:transition-none ${
                featured ? "text-xl sm:text-2xl" : "line-clamp-1 text-base"
              }`}
            >
              {campaign.name}
            </h3>
            <p
              className={`mt-1 text-xs leading-relaxed text-fg-secondary ${
                featured ? "max-w-xl sm:text-sm" : "line-clamp-2"
              }`}
            >
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
            <span className="mt-0.5 block font-mono text-sm font-semibold tabular-nums text-brand-reward">
              {formatSTRK(campaign.rewardAmount)} {campaign.tokenSymbol}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-fg-muted uppercase tracking-wider block">
              Remaining Budget
            </span>
            <span className="mt-0.5 block font-mono text-sm font-semibold tabular-nums text-fg-primary">
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
              className="h-full rounded-full bg-brand-primary shadow-[0_0_12px_rgba(255,90,31,0.28)] transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${percentClaimed}%` }}
            />
          </div>
        </div>

        {/* Technical Metadata Monospace */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 font-mono text-[11px] text-fg-muted">
          <div className="flex items-center gap-1">
            <Lock className="size-3 text-brand-privacy" aria-hidden="true" />
            <span className={featured ? "break-all" : "max-w-[120px] truncate"}>
              {campaign.nullifierNamespace}
            </span>
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
            rightIcon={<ArrowUpRight className="size-3.5" aria-hidden="true" />}
          >
            Claim Link
          </Button>
        </Link>
      </div>
      </Card>
    </motion.article>
  );
}
