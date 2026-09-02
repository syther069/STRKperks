"use client";

import React from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/Badge";
import { shortenHash } from "../../lib/utils/format";
import { getExplorerTxUrl } from "../../lib/starknet/explorer";
import { ShieldAlert, AlertTriangle, ExternalLink, RefreshCw, XCircle } from "lucide-react";

export interface DuplicateClaimWarningProps {
  nullifier: string;
  txHash?: string;
  errorReason: string;
  onReset?: () => void;
}

export function DuplicateClaimWarning({
  nullifier,
  txHash,
  errorReason,
  onReset,
}: DuplicateClaimWarningProps) {
  return (
    <Card className="p-6 space-y-5 border-status-error/50 bg-bg-surface">
      <div className="flex items-start justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-status-error/15 text-status-error border border-status-error/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-fg-primary">
              Replay Attack Rejected (Duplicate Claim Blocked)
            </h3>
            <p className="text-xs text-fg-secondary mt-0.5">
              Review the evidence below to distinguish a rejected transaction from a simulation result.
            </p>
          </div>
        </div>
        <StatusBadge status="duplicate_blocked" />
      </div>

      <div className="p-4 rounded bg-status-error/10 border border-status-error/25 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-status-error">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>NullifierRegistry.cairo::consume_nullifier Assertion Failed</span>
        </div>
        <p className="text-xs text-fg-secondary font-mono leading-relaxed break-words">
          {errorReason}
        </p>
      </div>

      <div className="space-y-2 p-3 rounded bg-bg-raised border border-border text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-fg-muted font-sans">Consumed Nullifier:</span>
          <span className="text-status-error font-semibold truncate max-w-[200px]">
            {shortenHash(nullifier, 8)}
          </span>
        </div>
        {txHash && (
          <div className="flex justify-between">
            <span className="text-fg-muted font-sans">Rejected Tx Hash:</span>
            <a
              href={getExplorerTxUrl(txHash) ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="text-brand-privacy hover:underline inline-flex items-center gap-1"
            >
              <span>{shortenHash(txHash, 6)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      <div className="p-3 rounded bg-bg-raised border border-border text-xs space-y-1">
        <span className="font-semibold text-fg-primary">How Replay Protection Works:</span>
        <p className="text-fg-secondary text-[11px] leading-relaxed">
          Every approved conversion derives a unique, deterministic nullifier. When the private settlement is executed, the contract atomically registers the nullifier in the Starknet storage trie. Subsequent claim attempts with the same nullifier are rejected onchain before any STRK token can be released.
        </p>
      </div>

      {onReset && (
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onReset}
        >
          Try Another Conversion
        </Button>
      )}
    </Card>
  );
}
