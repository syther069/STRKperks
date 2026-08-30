"use client";

import React from "react";
import Link from "next/link";
import { useDemoStore } from "@/lib/store/demoStore";
import { CampaignStats } from "@/components/campaign/CampaignStats";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { TransactionTimeline } from "@/components/demo/TransactionTimeline";
import { PrivacyBoundaryMatrix } from "@/components/demo/PrivacyBoundaryMatrix";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PrivacyBadge } from "@/components/ui/Badge";
import { PlusCircle, Sparkles, ArrowRight, Shield, Zap } from "lucide-react";

export default function DashboardPage() {
  const { campaigns } = useDemoStore();
  const featuredCampaigns = campaigns.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Top Hero / Protocol Thesis Strip */}
      <div className="p-6 rounded-card bg-gradient-to-r from-bg-surface via-bg-raised to-bg-surface border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <PrivacyBadge type="shielded" />
            <span className="text-xs font-mono text-fg-muted uppercase tracking-wider">
              Starknet Sepolia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-fg-primary tracking-tight">
            Private Rewards & Referral Settlement on Starknet
          </h1>
          <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed">
            Distribute referral incentives, affiliate cashback, and contributor grants using STRK20. The protocol is designed to reduce reward-graph leakage while enforcing single-use claims with campaign-scoped Cairo nullifiers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link href="/campaigns/create">
            <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create Campaign
            </Button>
          </Link>
          <Link href="/demo">
            <Button
              variant="privacy"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Judge Demo Flow
            </Button>
          </Link>
        </div>
      </div>

      {/* Protocol Metrics Strip */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted font-sans">
            Protocol Performance Metrics
          </h2>
          <span className="text-xs font-mono text-brand-privacy">
            STRK20 Adapter Status: Pending
          </span>
        </div>
        <CampaignStats />
      </section>

      {/* Active Campaigns Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-fg-primary">Active Reward Campaigns</h2>
            <p className="text-xs text-fg-secondary">
              Live Sepolia campaigns funded with onchain STRK; private-note settlement is adapter-pending.
            </p>
          </div>
          <Link href="/campaigns">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All ({campaigns.length})
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>

      {/* Split Grid: Live Transactions & Privacy Boundaries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <PrivacyBoundaryMatrix />
        </div>
        <div className="lg:col-span-5">
          <TransactionTimeline />
        </div>
      </div>
    </div>
  );
}
