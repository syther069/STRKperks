"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { PrivacyBadge } from "@/components/ui/Badge";
import { PrivacyBoundaryMatrix } from "@/components/demo/PrivacyBoundaryMatrix";
import { CONTRACT_ADDRESSES } from "@/lib/utils/constants";
import { getExplorerContractUrl } from "@/lib/starknet/explorer";
import { shortenAddress } from "@/lib/utils/format";
import { Shield, Lock, Layers, Code, CheckCircle2, ExternalLink, Cpu } from "lucide-react";

export default function DocsPage() {
  const contracts = [
    {
      name: "CampaignFactory.cairo",
      role: "Factory & Registry",
      desc: "Deploys new reward campaigns, enforces ownership, assigns unique IDs, and emits indexing events.",
      address: CONTRACT_ADDRESSES.campaignFactory,
    },
    {
      name: "RewardCampaign.cairo",
      role: "Campaign Logic",
      desc: "Stores campaign rules, manages token budgets, and validates conversion approvals and expiry.",
      address: CONTRACT_ADDRESSES.rewardCampaign,
    },
    {
      name: "NullifierRegistry.cairo",
      role: "Replay Attack Prevention",
      desc: "Maintains a cryptographic set of consumed nullifiers, rejecting any repeated claim attempts onchain.",
      address: CONTRACT_ADDRESSES.nullifierRegistry,
    },
    {
      name: "RewardRouter.cairo",
      role: "STRK20 Settlement Gateway",
      desc: "Unaudited STRK20 anonymizer draft: pool-only privacy_invoke, exact balance-delta accounting, and one OpenNoteDeposit output.",
      address: CONTRACT_ADDRESSES.rewardRouter,
    },
  ];

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-border space-y-2">
        <div className="flex items-center gap-2">
          <PrivacyBadge type="shielded" />
          <span className="text-xs font-mono text-fg-muted uppercase">Protocol Architecture</span>
        </div>
        <h1 className="text-3xl font-bold font-display text-fg-primary tracking-tight">
          StrkPerks Architecture & Privacy Specifications
        </h1>
        <p className="text-sm text-fg-secondary leading-relaxed">
          How StrkPerks combines Cairo campaign controls with a Wallet API STRK20 private-note payout, including the remaining audit and network-test gates.
        </p>
      </div>

      {/* Cairo Smart Contracts Overview */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-bold text-fg-primary">
            Cairo Smart Contract Suite (Starknet L2)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contracts.map((c, idx) => (
            <Card key={idx} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold font-mono text-fg-primary">{c.name}</h3>
                  <span className="text-[10px] font-mono text-brand-reward">{c.role}</span>
                </div>
                <Code className="w-4 h-4 text-fg-muted" />
              </div>
              <p className="text-xs text-fg-secondary leading-relaxed">{c.desc}</p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono">
                <span className="text-fg-muted">Address:</span>
                <a
                  href={getExplorerContractUrl(c.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-privacy hover:underline inline-flex items-center gap-1"
                >
                  {shortenAddress(c.address, 4)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Protocol Lifecycle Sequence */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-reward" />
          <h2 className="text-lg font-bold text-fg-primary">End-to-End Settlement Sequence</h2>
        </div>

        <Card className="p-6 space-y-4 font-mono text-xs">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded bg-bg-raised">
              <span className="px-2 py-0.5 rounded bg-brand-primary text-fg-primary font-bold">1</span>
              <div>
                <strong className="text-fg-primary font-sans">Campaign Creation:</strong>
                <p className="text-fg-secondary text-[11px] mt-0.5">
                  Owner defines reward token, reward amount (e.g. 50 STRK), and unique nullifier namespace to isolate claims.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded bg-bg-raised">
              <span className="px-2 py-0.5 rounded bg-brand-primary text-fg-primary font-bold">2</span>
              <div>
                <strong className="text-fg-primary font-sans">Onchain STRK Funding:</strong>
                <p className="text-fg-secondary text-[11px] mt-0.5">
                  Owner approves and deposits STRK into the campaign contract through a public ERC-20 transaction. This treasury leg is not private.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded bg-bg-raised">
              <span className="px-2 py-0.5 rounded bg-brand-primary text-fg-primary font-bold">3</span>
              <div>
                <strong className="text-fg-primary font-sans">Conversion Authorization:</strong>
                <p className="text-fg-secondary text-[11px] mt-0.5">
                  After wallet preparation, the owner approves the exact conversion ID, app nullifier, open-note ID, and expiry.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded bg-bg-raised">
              <span className="px-2 py-0.5 rounded bg-brand-primary text-fg-primary font-bold">4</span>
              <div>
                <strong className="text-fg-primary font-sans">Private Settlement & Nullifier Consumption:</strong>
                <p className="text-fg-secondary text-[11px] mt-0.5">
                  The privacy pool calls the anonymizer, which consumes the exact approved campaign claim and returns the reward as one open-note deposit. Replay attempts revert.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Privacy Boundary Model Matrix */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-privacy" />
          <h2 className="text-lg font-bold text-fg-primary">Privacy Assurances & Boundaries</h2>
        </div>
        <PrivacyBoundaryMatrix />
      </section>
    </div>
  );
}
