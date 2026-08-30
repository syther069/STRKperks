"use client";

import React from "react";
import { useDemoStore } from "../../lib/store/demoStore";
import { formatSTRK } from "../../lib/utils/format";
import { Coins, Shield, CheckCircle, ShieldAlert } from "lucide-react";

export function CampaignStats() {
  const { stats } = useDemoStore();

  const metrics = [
    {
      label: "Total STRK Allocated",
      value: `${formatSTRK(stats.totalBudgetSTRK)} STRK`,
      subtext: `${stats.totalCampaigns} Active Campaigns`,
      icon: Coins,
      iconColor: "text-brand-primary",
      borderColor: "border-border",
    },
    {
      label: "Rewards Privately Settled",
      value: `${formatSTRK(stats.rewardsSettledSTRK)} STRK`,
      subtext: `${stats.completedClaims} Shielded Notes Created`,
      icon: Shield,
      iconColor: "text-brand-reward",
      borderColor: "border-border",
    },
    {
      label: "Approved Conversions",
      value: stats.approvedConversions.toString(),
      subtext: "Eligible for Settlement",
      icon: CheckCircle,
      iconColor: "text-brand-privacy",
      borderColor: "border-border",
    },
    {
      label: "Duplicate Claims Blocked",
      value: stats.duplicateClaimsBlocked.toString(),
      subtext: "NullifierRegistry Protection",
      icon: ShieldAlert,
      iconColor: "text-status-error",
      borderColor: "border-status-error/30 bg-status-error/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-card bg-bg-surface border ${m.borderColor} flex items-start justify-between`}
          >
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-fg-muted">
                {m.label}
              </span>
              <div className="text-xl font-bold font-mono text-fg-primary tracking-tight">
                {m.value}
              </div>
              <p className="text-[11px] text-fg-secondary">{m.subtext}</p>
            </div>
            <div className="p-2 rounded bg-bg-raised border border-border shrink-0">
              <Icon className={`w-4 h-4 ${m.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
