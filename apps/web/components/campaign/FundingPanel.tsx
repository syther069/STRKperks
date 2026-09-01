"use client";

import React, { useState } from "react";
import { useDemoStore } from "../../lib/store/demoStore";
import { Campaign } from "../../lib/types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { PrivacyBadge } from "../ui/Badge";
import { formatSTRK, shortenHash } from "../../lib/utils/format";
import { getExplorerTxUrl } from "../../lib/starknet/explorer";
import { ShieldCheck, ArrowDownCircle, ExternalLink, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useContractActions } from "../../lib/starknet/useContractActions";
import { CONTRACT_ADDRESSES, LIVE_CONTRACTS_ENABLED } from "../../lib/utils/constants";

export interface FundingPanelProps {
  campaign: Campaign;
}

export function FundingPanel({ campaign }: FundingPanelProps) {
  const { fundCampaign } = useDemoStore();
  const live = useContractActions();
  const [amount, setAmount] = useState("1000.0");
  const [isFunding, setIsFunding] = useState(false);
  const [successTx, setSuccessTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid funding amount");
      return;
    }

    setError(null);
    setIsFunding(true);
    try {
      const res = LIVE_CONTRACTS_ENABLED
        ? CONTRACT_ADDRESSES.rewardCampaign
          ? { txHash: await live.fundCampaign(CONTRACT_ADDRESSES.rewardCampaign, amount) }
          : (() => { throw new Error("Configured live campaign address is missing"); })()
        : await fundCampaign(campaign.id, amount);
      setSuccessTx(res.txHash);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#3CE7C7", "#B7FF5A"],
      });
    } catch (err: any) {
      setError(err.message || "Failed to fund campaign");
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <Card variant="shielded" className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-brand-privacy/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-brand-privacy-subtle text-brand-privacy">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-fg-primary">
              {LIVE_CONTRACTS_ENABLED ? "STRK Treasury Funding" : "Public Treasury Funding (Demo)"}
            </h4>
            <p className="text-[11px] text-fg-secondary">
              {LIVE_CONTRACTS_ENABLED ? "Fund the deployed campaign budget onchain." : "Simulate the public ERC-20 funding leg."}
            </p>
          </div>
        </div>
        <PrivacyBadge type="shielded" />
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 rounded bg-bg-raised/80 border border-border text-xs font-mono">
        <div>
          <span className="text-[11px] text-fg-muted uppercase tracking-wider block font-sans">
            Total Allocated Budget
          </span>
          <span className="text-sm font-bold text-fg-primary mt-0.5 block">
            {formatSTRK(campaign.totalBudget)} STRK
          </span>
        </div>
        <div>
          <span className="text-[11px] text-fg-muted uppercase tracking-wider block font-sans">
            Available for Settlement
          </span>
          <span className="text-sm font-bold text-brand-reward mt-0.5 block">
            {formatSTRK(campaign.remainingBudget)} STRK
          </span>
        </div>
      </div>

      {successTx ? (
        <div className="p-3 rounded bg-status-success/15 border border-status-success/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-status-success">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{LIVE_CONTRACTS_ENABLED ? "Funding transaction accepted on Starknet L2! Campaign budget updated onchain." : "Demo funding recorded locally; no network transaction occurred."}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-fg-secondary pt-1">
            <span>Tx: {shortenHash(successTx, 8)}</span>
            <a
              href={getExplorerTxUrl(successTx)}
              target="_blank"
              rel="noreferrer"
              className="text-brand-privacy hover:underline inline-flex items-center gap-1"
            >
              View Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full text-xs mt-1"
            onClick={() => setSuccessTx(null)}
          >
            Deposit Additional STRK
          </Button>
        </div>
      ) : (
        <form onSubmit={handleFund} className="space-y-3">
          <Input
            label="Deposit Amount"
            type="number"
            step="10"
            placeholder="500.0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            error={error || undefined}
            isMono
            rightElement={<span className="text-xs font-bold text-fg-muted">STRK</span>}
            helperText={LIVE_CONTRACTS_ENABLED ? "Onchain ERC20 transfer into the campaign treasury" : "Demo simulation; enable live contracts for wallet execution"}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isFunding}
            disabled={LIVE_CONTRACTS_ENABLED && !live.isReady}
            leftIcon={<ArrowDownCircle className="w-4 h-4" />}
          >
            {LIVE_CONTRACTS_ENABLED && !live.isReady ? "Connect Wallet to Fund" : "Fund Campaign"}
          </Button>
        </form>
      )}
    </Card>
  );
}
