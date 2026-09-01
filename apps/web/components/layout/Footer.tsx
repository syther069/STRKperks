import React from "react";
import Link from "next/link";
import { CONTRACT_ADDRESSES, APP_CONFIG } from "../../lib/utils/constants";
import { shortenAddress } from "../../lib/utils/format";
import { getExplorerContractUrl } from "../../lib/starknet/explorer";
import { Shield, ExternalLink, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-bg-surface/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Col 1: Protocol identity */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-brand-primary flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-fg-primary" />
              </div>
              <span className="font-display font-bold text-sm text-fg-primary">
                StrkPerks
              </span>
              <span className="text-[10px] font-mono text-brand-reward px-1.5 py-0.2 rounded bg-brand-reward-subtle border border-brand-reward/30">
                STRK20 Integration Boundary
              </span>
            </div>
            <p className="text-fg-secondary text-xs max-w-md leading-relaxed">
              Starknet rewards with campaign-scoped replay protection and an unaudited STRK20 private-note payout adapter.
            </p>
          </div>

          {/* Col 2: Smart Contracts */}
          <div className="space-y-2 font-mono">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted font-sans block">
              Starknet Sepolia Contracts
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-fg-muted font-sans">CampaignFactory:</span>
                <a
                  href={getExplorerContractUrl(CONTRACT_ADDRESSES.campaignFactory)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-privacy hover:underline"
                >
                  {shortenAddress(CONTRACT_ADDRESSES.campaignFactory, 3)}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-muted font-sans">NullifierRegistry:</span>
                <a
                  href={getExplorerContractUrl(CONTRACT_ADDRESSES.nullifierRegistry)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-privacy hover:underline"
                >
                  {shortenAddress(CONTRACT_ADDRESSES.nullifierRegistry, 3)}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-muted font-sans">RewardRouter:</span>
                <a
                  href={getExplorerContractUrl(CONTRACT_ADDRESSES.rewardRouter)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-privacy hover:underline"
                >
                  {shortenAddress(CONTRACT_ADDRESSES.rewardRouter, 3)}
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted block">
              Navigation
            </span>
            <ul className="space-y-1.5 text-fg-secondary">
              <li>
                <Link href="/campaigns" className="hover:text-fg-primary">
                  All Campaigns
                </Link>
              </li>
              <li>
                <Link href="/campaigns/create" className="hover:text-fg-primary">
                  Create Campaign
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-brand-primary font-medium">
                  Judge Demo Flow
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-fg-primary">
                  Architecture & Privacy Model
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-fg-muted">
          <div>
            © 2026 StrkPerks Protocol. Built for the Starknet & STRK20 Ecosystem.
          </div>
          <div className="flex items-center gap-1">
            <span>Starknet Native Privacy Infrastructure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
