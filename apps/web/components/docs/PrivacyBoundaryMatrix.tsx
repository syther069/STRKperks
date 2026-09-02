import React from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { Card } from "../ui/Card";
import { PrivacyBadge } from "../ui/Badge";

const privateItems = [
  ["Recipient wallet address", "The STRK20 open note hides its owner; application calldata does not include the recipient wallet address."],
  ["Direct recipient graph", "The private-note payout avoids publishing a direct campaign-to-wallet transfer, while amount and timing correlation remain possible."],
  ["Private note balance", "The privacy wallet owns note discovery and viewing keys. StrkPerks never requests or stores a viewing key."],
];

const publicItems = [
  ["Campaign rules", "Contract addresses, token, reward amount, limits, funding, and lifecycle state remain public on Starknet."],
  ["Campaign-scoped nullifier", "The consumed nullifier and settlement transaction are public and enforce replay protection for that campaign."],
  ["Open-note output", "The anonymizer output exposes token and amount; it does not reveal the note owner."],
  ["Transaction metadata", "Block inclusion, timing, calldata, events, and fees remain public."],
];

export function PrivacyBoundaryMatrix() {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-base font-semibold text-fg-primary">Privacy boundary</h3>
          <p className="text-xs text-fg-secondary">Protocol properties, not a claim of anonymity against all correlation.</p>
        </div>
        <PrivacyBadge type="shielded" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-card border border-brand-privacy/30 bg-brand-privacy-subtle/30 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-brand-privacy"><EyeOff className="h-4 w-4" />Wallet-private</h4>
          {privateItems.map(([title, description]) => (
            <div key={title} className="space-y-1">
              <p className="flex items-center gap-2 text-xs font-semibold text-fg-primary"><Check className="h-3.5 w-3.5 text-brand-privacy" />{title}</p>
              <p className="pl-5 text-[11px] leading-relaxed text-fg-secondary">{description}</p>
            </div>
          ))}
        </section>
        <section className="space-y-4 rounded-card border border-border bg-bg-raised p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-fg-muted"><Eye className="h-4 w-4" />Public on Starknet</h4>
          {publicItems.map(([title, description]) => (
            <div key={title} className="space-y-1">
              <p className="flex items-center gap-2 text-xs font-semibold text-fg-primary"><Check className="h-3.5 w-3.5 text-brand-primary" />{title}</p>
              <p className="pl-5 text-[11px] leading-relaxed text-fg-secondary">{description}</p>
            </div>
          ))}
        </section>
      </div>
    </Card>
  );
}
