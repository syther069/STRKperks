"use client";

import React from "react";
import { useDemoStore } from "../../features/demo/store";
import { TxRecord } from "../../lib/types";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/Badge";
import { ExplorerLink } from "./ExplorerLink";
import { formatDateTime } from "../../lib/utils/format";
import { CheckCircle2, Clock, XCircle, Activity, ShieldCheck, Lock } from "lucide-react";

export function TransactionTimeline() {
  const { transactions } = useDemoStore();

  const getStatusIcon = (status: TxRecord["status"]) => {
    switch (status) {
      case "accepted_l2":
        return <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />;
      case "pending":
        return <Clock className="w-4 h-4 text-status-warning shrink-0 animate-spin" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-status-error shrink-0" />;
      case "simulated":
        return <Activity className="w-4 h-4 text-brand-privacy shrink-0" />;
      default:
        return <XCircle className="w-4 h-4 text-status-error shrink-0" />;
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-primary" />
          <h4 className="text-sm font-semibold text-fg-primary">
            Starknet L2 Transaction Timeline
          </h4>
        </div>
        <span className="text-[11px] font-mono text-fg-muted">
          {transactions.length} Recorded Events
        </span>
      </div>

      <div className="divide-y divide-border/60">
        {transactions.length === 0 && (
          <p className="py-3 text-xs text-fg-muted">
            No verified transactions recorded. Demo actions remain local until a wallet submits them.
          </p>
        )}
        {transactions.map((tx, idx) => (
          <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(tx.status)}
                <span className="text-xs font-semibold text-fg-primary">
                  {tx.summary}
                </span>
              </div>
              <span className="text-[10px] font-mono text-fg-muted">
                {formatDateTime(tx.timestamp)}
              </span>
            </div>

            {tx.errorReason && (
              <div className="text-[11px] font-mono text-status-error bg-status-error/10 p-2 rounded border border-status-error/20">
                {tx.errorReason}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              {tx.hash ? (
                <ExplorerLink type="tx" value={tx.hash} label="View Starknet Explorer Transaction" />
              ) : (
                <span className="text-[11px] text-brand-privacy font-mono">Simulation only — no network transaction</span>
              )}
              {tx.nullifier && (
                <span className="text-fg-muted font-mono text-[10px] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-brand-primary" /> Nullifier Consumed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
