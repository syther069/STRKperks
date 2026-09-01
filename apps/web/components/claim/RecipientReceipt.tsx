"use client";

import React, { useState } from "react";
import { ClaimReceipt } from "../../lib/types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { PrivacyBadge } from "../ui/Badge";
import { formatSTRK, shortenHash } from "../../lib/utils/format";
import { getExplorerTxUrl } from "../../lib/starknet/explorer";
import { CheckCircle2, ShieldCheck, Copy, Check, ExternalLink, Lock } from "lucide-react";

export interface RecipientReceiptProps {
  receipt: ClaimReceipt;
  onClose?: () => void;
}

export function RecipientReceipt({ receipt, onClose }: RecipientReceiptProps) {
  const [copiedNote, setCopiedNote] = useState(false);
  const [copiedNullifier, setCopiedNullifier] = useState(false);

  const handleCopyNote = () => {
    navigator.clipboard.writeText(receipt.recipientNoteHash);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleCopyNullifier = () => {
    navigator.clipboard.writeText(receipt.nullifier);
    setCopiedNullifier(true);
    setTimeout(() => setCopiedNullifier(false), 2000);
  };

  return (
    <Card variant="shielded" className="p-6 space-y-6 max-w-xl mx-auto border-brand-privacy/40">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-brand-privacy/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-brand-privacy-subtle text-brand-privacy border border-brand-privacy/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-fg-primary">
              Private STRK20 Settlement Receipt
            </h3>
            <p className="text-xs text-fg-secondary mt-0.5">
              {receipt.status === "submitted"
                ? "Submitted to Starknet; wallet note discovery follows confirmation."
                : "Private-note settlement recorded on Starknet."}
            </p>
          </div>
        </div>
        <PrivacyBadge type="zk_note" />
      </div>

      {/* Amount Hero Box */}
      <div className="p-5 rounded-card bg-bg-surface/90 border border-border text-center space-y-1">
        <span className="text-[11px] text-fg-muted uppercase tracking-wider font-semibold">
          Settled Reward Amount
        </span>
        <div className="text-3xl font-black font-mono text-brand-reward tracking-tight">
          +{formatSTRK(receipt.rewardAmount)} {receipt.tokenSymbol}
        </div>
        <p className="text-xs text-brand-privacy font-medium">
          {receipt.status === "submitted"
            ? "Transaction submitted; confirmation and note discovery are pending"
            : "Private note created for the connected privacy wallet"}
        </p>
      </div>

      {/* Note & Cryptographic Proof Details */}
      <div className="space-y-3 p-4 rounded bg-bg-raised border border-border text-xs font-mono">
        <div className="flex justify-between items-center pb-2 border-b border-border/60">
          <span className="text-fg-muted font-sans">Campaign:</span>
          <span className="text-fg-primary font-semibold truncate max-w-[200px]">
            {receipt.campaignName}
          </span>
        </div>

        <div className="space-y-1 pb-2 border-b border-border/60">
          <div className="flex justify-between text-fg-muted font-sans">
            <span>Open Note ID:</span>
            <button
              onClick={handleCopyNote}
              className="text-brand-privacy hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              {copiedNote ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
              <span>{shortenHash(receipt.recipientNoteHash, 8)}</span>
            </button>
          </div>
          <div className="text-[10px] text-fg-muted break-all">
            {receipt.recipientNoteHash}
          </div>
        </div>

        <div className="space-y-1 pb-2 border-b border-border/60">
          <div className="flex justify-between text-fg-muted font-sans">
            <span>Consumed Campaign Nullifier:</span>
            <button
              onClick={handleCopyNullifier}
              className="text-brand-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              {copiedNullifier ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
              <span>{shortenHash(receipt.nullifier, 8)}</span>
            </button>
          </div>
          <div className="text-[10px] text-fg-muted break-all">
            {receipt.nullifier}
          </div>
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="text-fg-muted font-sans">{receipt.txHash ? "Starknet Tx Hash:" : "Transaction status:"}</span>
          {receipt.txHash ? (
            <a
              href={getExplorerTxUrl(receipt.txHash)}
              target="_blank"
              rel="noreferrer"
              className="text-brand-privacy hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <span>{shortenHash(receipt.txHash, 6)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-brand-privacy">Simulation only — not submitted</span>
          )}
        </div>
      </div>

      {/* Privacy Guarantee Explainer */}
      <div className="p-3 rounded bg-brand-privacy-subtle/30 border border-brand-privacy/30 flex items-start gap-2.5 text-xs">
        <Lock className="w-4 h-4 text-brand-privacy shrink-0 mt-0.5" />
        <p className="text-fg-secondary leading-relaxed">
          <strong className="text-fg-primary">Privacy boundary:</strong> The open note exposes its token and amount, and transaction timing is public. Its owner is hidden. A viewing key can selectively disclose private history, so keep it under the wallet owner&apos;s control.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {receipt.txHash && (
          <a
            href={getExplorerTxUrl(receipt.txHash)}
            target="_blank"
            rel="noreferrer"
            className="flex-1"
          >
            <Button variant="secondary" className="w-full" rightIcon={<ExternalLink className="w-4 h-4" />}>
              View on Starknet Explorer
            </Button>
          </a>
        )}
        {onClose && (
          <Button variant="primary" className="flex-1" onClick={onClose}>
            Done
          </Button>
        )}
      </div>
    </Card>
  );
}
