"use client";

import React, { useState } from "react";
import { Campaign, ClaimReceipt } from "../../lib/types";
import { useDemoStore } from "../../lib/store/demoStore";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { PrivacyBadge } from "../ui/Badge";
import { RecipientReceipt } from "./RecipientReceipt";
import { DuplicateClaimWarning } from "./DuplicateClaimWarning";
import { formatSTRK, shortenAddress } from "../../lib/utils/format";
import { deriveNullifier } from "../../lib/campaign/nullifier";
import { DEMO_CONVERSION_ID, DEMO_RECIPIENT_SECRET } from "../../lib/utils/constants";
import { Gift, ShieldCheck, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { useContractActions } from "../../lib/starknet/useContractActions";
import { LIVE_CONTRACTS_ENABLED } from "../../lib/utils/constants";

export interface ClaimPanelProps {
  campaign: Campaign;
}

export function ClaimPanel({ campaign }: ClaimPanelProps) {
  const {
    claimReward,
    attemptDuplicateClaim,
    consumedNullifiers,
    simulatedAddress,
    simulatedWalletConnected,
  } = useDemoStore();
  const live = useContractActions();

  const [conversionId, setConversionId] = useState(DEMO_CONVERSION_ID);
  const [recipientSecret, setRecipientSecret] = useState(DEMO_RECIPIENT_SECRET);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isAttemptingDuplicate, setIsAttemptingDuplicate] = useState(false);
  const [receipt, setReceipt] = useState<ClaimReceipt | null>(null);
  const [duplicateError, setDuplicateError] = useState<{
    nullifier: string;
    txHash?: string;
    errorReason: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const previewNullifier = deriveNullifier(campaign.nullifierNamespace, recipientSecret);
  const isAlreadyConsumed = consumedNullifiers.has(previewNullifier);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversionId.trim()) {
      setValidationError("Conversion ID is required");
      return;
    }
    if (!recipientSecret.trim()) {
      setValidationError("Recipient secret key is required");
      return;
    }

    setValidationError(null);
    setDuplicateError(null);
    setIsClaiming(true);

    try {
      const res = LIVE_CONTRACTS_ENABLED
        ? campaign.contractAddress
          ? { txHash: await live.claimReward(campaign.contractAddress, campaign.nullifierNamespace, conversionId, recipientSecret, campaign.rewardAmount) }
          : (() => { throw new Error("Campaign contract address is not configured"); })()
        : await claimReward({ campaignId: campaign.id, conversionId, recipientSecret });

      if ("txHash" in res) {
        setReceipt({ id: `live_${Date.now()}`, campaignId: campaign.id, campaignName: campaign.name, rewardAmount: campaign.rewardAmount, tokenSymbol: campaign.tokenSymbol, conversionId, nullifier: previewNullifier, recipientNoteHash: "pending_strk20_note", txHash: res.txHash, timestamp: Math.floor(Date.now() / 1000), status: "shielded_note_ready", shieldedBalanceVerified: false });
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#FF5A1F", "#B7FF5A", "#3CE7C7"] });
      } else if (res.isDuplicate || res.error) {
        setDuplicateError({
          nullifier: previewNullifier,
          errorReason: res.error || "Duplicate claim rejected by contract",
        });
      } else if (res.receipt) {
        setReceipt(res.receipt);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FF5A1F", "#B7FF5A", "#3CE7C7"],
        });
      }
    } catch (err: any) {
      setValidationError(err?.message || "Claim transaction failed");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleTestDuplicateAttack = async () => {
    setIsAttemptingDuplicate(true);
    setDuplicateError(null);
    try {
      if (LIVE_CONTRACTS_ENABLED) {
        if (!campaign.contractAddress) throw new Error("Campaign contract address is not configured");
        try {
          await live.claimReward(campaign.contractAddress, campaign.nullifierNamespace, conversionId, recipientSecret, campaign.rewardAmount);
          setDuplicateError({ nullifier: previewNullifier, errorReason: "Unexpectedly accepted: verify conversion approval and registry configuration" });
        } catch (err: any) {
          setDuplicateError({ nullifier: previewNullifier, errorReason: `Onchain replay rejected: ${err?.message || "transaction reverted"}` });
        }
      } else {
        const res = await attemptDuplicateClaim(campaign.id, conversionId, recipientSecret);
        setDuplicateError({ nullifier: res.nullifier, txHash: res.txHash, errorReason: res.error });
      }
    } finally {
      setIsAttemptingDuplicate(false);
    }
  };

  if (receipt) {
    return <RecipientReceipt receipt={receipt} onClose={() => setReceipt(null)} />;
  }

  if (duplicateError) {
    return (
      <DuplicateClaimWarning
        nullifier={duplicateError.nullifier}
        txHash={duplicateError.txHash}
        errorReason={duplicateError.errorReason}
        onReset={() => setDuplicateError(null)}
      />
    );
  }

  return (
    <Card variant="raised" className="max-w-xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-border">
        <div>
          <span className="text-[11px] font-semibold text-brand-reward uppercase tracking-wider block">
            Private Referral Payout
          </span>
          <h2 className="text-xl font-bold text-fg-primary mt-0.5">{campaign.name}</h2>
          <p className="text-xs text-fg-secondary mt-1">{campaign.description}</p>
        </div>
        <PrivacyBadge type="shielded" />
      </div>

      {/* Reward Amount Badge */}
      <div className="p-4 rounded-card bg-bg-surface border border-border flex items-center justify-between">
        <div>
          <span className="text-[11px] text-fg-muted uppercase tracking-wider block font-semibold">
            Eligible Reward Amount
          </span>
          <span className="text-2xl font-bold font-mono text-brand-reward mt-0.5 block">
            {formatSTRK(campaign.rewardAmount)} {campaign.tokenSymbol}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-fg-muted uppercase tracking-wider block">
            Settlement Mode
          </span>
          <span className="text-xs font-semibold text-brand-privacy flex items-center justify-end gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" /> {LIVE_CONTRACTS_ENABLED ? "Campaign claim (STRK20 note pending)" : "STRK20 Shielded Note (Demo)"}
          </span>
        </div>
      </div>

      {/* Claim Form */}
      <form onSubmit={handleClaim} className="space-y-4">
        {validationError && (
          <div className="p-3 rounded bg-status-error/15 border border-status-error/30 text-status-error text-xs">
            {validationError}
          </div>
        )}

        <Input
          label="Conversion ID / Referral Code"
          placeholder="e.g. conv_ambassador_referral_771"
          value={conversionId}
          onChange={(e) => {
            setConversionId(e.target.value);
            setValidationError(null);
          }}
          isMono
          helperText="Approved conversion identifier issued by campaign owner"
        />

        <Input
          label="Recipient Private Secret Seed"
          placeholder="Your local viewing seed"
          value={recipientSecret}
          onChange={(e) => {
            setRecipientSecret(e.target.value);
            setValidationError(null);
          }}
          isMono
          helperText="Used client-side to generate private note proof; never broadcast publicly"
        />

        {/* Live Nullifier Preview Strip */}
        <div className="p-3 rounded bg-bg-surface border border-border space-y-1 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-fg-muted uppercase tracking-wider font-sans">
              Deterministic Campaign Nullifier:
            </span>
            {isAlreadyConsumed ? (
              <span className="text-[10px] text-status-error font-bold font-sans flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Already Consumed
              </span>
            ) : (
              <span className="text-[10px] text-status-success font-semibold font-sans">
                Unused & Ready
              </span>
            )}
          </div>
          <div className="text-[11px] text-fg-secondary truncate">{previewNullifier}</div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            type="submit"
            variant="reward"
            size="lg"
            className="w-full"
            isLoading={isClaiming}
            disabled={LIVE_CONTRACTS_ENABLED && !live.isReady}
            leftIcon={<Gift className="w-4 h-4" />}
          >
            {LIVE_CONTRACTS_ENABLED && !live.isReady ? "Connect Wallet to Claim" : LIVE_CONTRACTS_ENABLED ? `Submit Reward Claim (${formatSTRK(campaign.rewardAmount)} STRK)` : `Claim Private Reward (${formatSTRK(campaign.rewardAmount)} STRK)`}
          </Button>

          {/* Hackathon Demo Test Duplicate Button */}
          <Button
            type="button"
            variant="danger"
            size="sm"
            className="w-full text-xs"
            isLoading={isAttemptingDuplicate}
            leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
            onClick={handleTestDuplicateAttack}
          >
            {LIVE_CONTRACTS_ENABLED ? "Attempt Onchain Duplicate Claim (Replay Attack)" : "Hackathon Judge Test: Attempt Duplicate Claim (Replay Attack)"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
