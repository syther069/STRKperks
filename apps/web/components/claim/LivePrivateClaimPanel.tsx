"use client";

import React, { useState } from "react";
import { AlertCircle, Gift, ShieldCheck } from "lucide-react";
import { Campaign, ClaimReceipt } from "../../lib/types";
import { deriveNullifier } from "../../lib/campaign/nullifier";
import { CONTRACT_ADDRESSES, DEMO_CONVERSION_ID } from "../../lib/utils/constants";
import { formatSTRK } from "../../lib/utils/format";
import {
  PrivateClaimActionParams,
  preparePrivateClaim,
  submitPrivateClaim,
} from "../../lib/strk20/walletActions";
import { useStrk20Wallet } from "../wallet/Strk20WalletProvider";
import { PrivacyBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { RecipientReceipt } from "./RecipientReceipt";

function requireAddress(address: string, label: string): string {
  if (!address) throw new Error(`${label} address is not configured`);
  return address;
}

export function LivePrivateClaimPanel({ campaign }: { campaign: Campaign }) {
  const wallet = useStrk20Wallet();
  const [conversionId, setConversionId] = useState(DEMO_CONVERSION_ID);
  const [claimSecret, setClaimSecret] = useState("");
  const [authorizationExpiry, setAuthorizationExpiry] = useState(() =>
    String(Math.floor(Date.now() / 1000) + 60 * 60),
  );
  const [preparedNoteId, setPreparedNoteId] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ClaimReceipt | null>(null);

  const nullifier = claimSecret
    ? deriveNullifier(campaign.nullifierNamespace, claimSecret)
    : "";

  const buildParams = (): PrivateClaimActionParams => {
    if (!wallet.account || !wallet.address) throw new Error("Connect a STRK20-capable wallet first");
    if (!conversionId.trim()) throw new Error("Conversion ID is required");
    if (!claimSecret.trim()) throw new Error("Claim secret is required");
    if (BigInt(authorizationExpiry) <= BigInt(Math.floor(Date.now() / 1000))) {
      throw new Error("Authorization expiry must be in the future");
    }
    return {
      anonymizerAddress: requireAddress(CONTRACT_ADDRESSES.rewardRouter, "Reward anonymizer"),
      rewardToken: requireAddress(CONTRACT_ADDRESSES.strkToken, "Reward token"),
      claimantAddress: wallet.address,
      conversionId,
      nullifier,
      authorizationExpiry,
    };
  };

  const handlePrepare = async () => {
    setPreparing(true);
    setError(null);
    try {
      const params = buildParams();
      // Simulate the exact helper call so calldata/ABI failures are caught before
      // the campaign owner approves the wallet-resolved open-note ID.
      const prepared = await preparePrivateClaim(wallet.account!, params, true);
      setPreparedNoteId(prepared.noteId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Private claim preparation failed");
    } finally {
      setPreparing(false);
    }
  };

  const handleSubmit = async () => {
    if (!preparedNoteId) {
      setError("Prepare the claim and obtain exact campaign-owner approval first");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const params = buildParams();
      const result = await submitPrivateClaim(wallet.account!, params, preparedNoteId);
      setReceipt({
        id: `strk20_${result.transactionHash}`,
        campaignId: campaign.id,
        campaignName: campaign.name,
        rewardAmount: campaign.rewardAmount,
        tokenSymbol: campaign.tokenSymbol,
        conversionId,
        nullifier,
        recipientNoteHash: result.noteId,
        txHash: result.transactionHash,
        timestamp: Math.floor(Date.now() / 1000),
        status: "submitted",
        shieldedBalanceVerified: false,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Private claim submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) return <RecipientReceipt receipt={receipt} onClose={() => setReceipt(null)} />;

  return (
    <Card variant="raised" className="max-w-xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between pb-4 border-b border-border">
        <div>
          <span className="text-[11px] font-semibold text-brand-reward uppercase tracking-wider block">
            Private STRK20 payout
          </span>
          <h2 className="text-xl font-bold text-fg-primary mt-0.5">{campaign.name}</h2>
          <p className="text-xs text-fg-secondary mt-1">
            Open-note owner is hidden; token, amount, campaign, and timing remain public.
          </p>
        </div>
        <PrivacyBadge type="shielded" />
      </div>

      <div className="p-4 rounded-card bg-bg-surface border border-border flex items-center justify-between">
        <div>
          <span className="text-[11px] text-fg-muted uppercase tracking-wider block font-semibold">Reward</span>
          <span className="text-2xl font-bold font-mono text-brand-reward">
            {formatSTRK(campaign.rewardAmount)} {campaign.tokenSymbol}
          </span>
        </div>
        <div className="text-right text-xs">
          <span className="text-fg-muted block">Privacy wallet</span>
          <span className={wallet.supported ? "text-status-success" : "text-status-error"}>
            {wallet.supported ? `${wallet.walletName} · ready` : "not connected"}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-status-error/15 border border-status-error/30 text-status-error text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Conversion ID"
          value={conversionId}
          onChange={(event) => { setConversionId(event.target.value); setPreparedNoteId(null); }}
          isMono
          helperText="Campaign-issued conversion identifier"
        />
        <Input
          label="Local claim secret"
          type="password"
          value={claimSecret}
          onChange={(event) => { setClaimSecret(event.target.value); setPreparedNoteId(null); }}
          isMono
          helperText="Used only to derive the app nullifier in this browser; never sent to the helper"
        />
        <Input
          label="Authorization expiry (Unix seconds)"
          value={authorizationExpiry}
          onChange={(event) => { setAuthorizationExpiry(event.target.value); setPreparedNoteId(null); }}
          isMono
        />

        {nullifier && (
          <div className="rounded border border-border bg-bg-surface p-3 text-[11px] font-mono break-all">
            <span className="text-fg-muted block font-sans text-[10px] uppercase">Campaign nullifier</span>
            {nullifier}
          </div>
        )}

        {preparedNoteId && (
          <div className="rounded border border-brand-privacy/40 bg-brand-privacy-subtle/20 p-3 text-xs space-y-2">
            <div className="flex items-center gap-2 text-brand-privacy font-semibold">
              <ShieldCheck className="w-4 h-4" /> Exact open-note ID prepared
            </div>
            <div className="font-mono text-[11px] break-all">{preparedNoteId}</div>
            <p className="text-fg-secondary">
              Give the conversion ID, nullifier, note ID, and expiry to the campaign owner. Submit only after the owner confirms the exact onchain approval.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            variant="secondary"
            isLoading={preparing}
            disabled={!wallet.supported}
            onClick={handlePrepare}
          >
            Prepare Exact Note
          </Button>
          <Button
            variant="reward"
            isLoading={submitting}
            disabled={!wallet.supported || !preparedNoteId}
            leftIcon={<Gift className="w-4 h-4" />}
            onClick={handleSubmit}
          >
            Submit Private Claim
          </Button>
        </div>
      </div>
    </Card>
  );
}
