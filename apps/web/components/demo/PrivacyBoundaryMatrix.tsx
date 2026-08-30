import React from "react";
import { Card } from "../ui/Card";
import { PrivacyBadge } from "../ui/Badge";
import { ShieldCheck, EyeOff, Eye, Lock, Check, AlertCircle } from "lucide-react";

export function PrivacyBoundaryMatrix() {
  const protectedItems = [
    {
      title: "Recipient Wallet Address",
      desc: "The live contract records a recipient commitment; private-note settlement requires the verified STRK20 adapter.",
    },
    {
      title: "Merchant-to-Recipient Graph",
      desc: "The commitment/nullifier path reduces direct linkage, but the current live ERC20 flow does not provide full graph privacy.",
    },
    {
      title: "Cumulative Recipient Payouts",
      desc: "Campaign-scoped nullifiers avoid exposing recipient secrets; payout privacy depends on the pending STRK20 adapter.",
    },
    {
      title: "Private Note Balance & Spending",
      desc: "A private viewing-key note is not created by the current live flow; this behavior is demo-only until the adapter is connected.",
    },
  ];

  const publicItems = [
    {
      title: "Campaign Smart Contract Existence",
      desc: "The deployment of the campaign and its public rules (reward per action) are verifiable.",
    },
    {
      title: "Consumed Campaign-Scoped Nullifiers",
      desc: "Deterministic nullifiers are published to NullifierRegistry.cairo to mathematically block double-claims.",
    },
    {
      title: "Settlement Transaction Timing",
      desc: "L2 block timestamp and standard Starknet gas fee execution records remain public.",
    },
  ];

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-base font-semibold text-fg-primary">
            StrkPerks Privacy Boundary Model
          </h3>
          <p className="text-xs text-fg-secondary">
            Verifiable transparency where integrity matters; complete confidentiality where identities leak.
          </p>
        </div>
        <PrivacyBadge type="shielded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hidden Section */}
        <div className="p-4 rounded-card bg-brand-privacy-subtle/30 border border-brand-privacy/30 space-y-4">
          <div className="flex items-center gap-2 text-brand-privacy font-semibold text-sm">
            <EyeOff className="w-4 h-4 shrink-0" />
            <span>Privacy Boundary (Adapter Pending)</span>
          </div>

          <div className="space-y-3">
            {protectedItems.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-fg-primary">
                  <Check className="w-3.5 h-3.5 text-brand-privacy shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="text-[11px] text-fg-secondary pl-5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Public Section */}
        <div className="p-4 rounded-card bg-bg-raised border border-border space-y-4">
          <div className="flex items-center gap-2 text-fg-muted font-semibold text-sm">
            <Eye className="w-4 h-4 shrink-0" />
            <span>Public Onchain Verification (Starknet L2)</span>
          </div>

          <div className="space-y-3">
            {publicItems.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-fg-primary">
                  <Check className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="text-[11px] text-fg-secondary pl-5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
