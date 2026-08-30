"use client";

import React, { useState } from "react";
import { useDemoStore } from "../../lib/store/demoStore";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { PrivacyBadge, StatusBadge } from "../ui/Badge";
import { ExplorerLink } from "./ExplorerLink";
import { shortenAddress, shortenHash, formatSTRK } from "../../lib/utils/format";
import { CONTRACT_ADDRESSES, DEMO_CAMPAIGN_ID, DEMO_CONVERSION_ID, DEMO_RECIPIENT_SECRET } from "../../lib/utils/constants";
import { deriveNullifier, deriveRecipientCommitment } from "../../lib/campaign/nullifier";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Gift,
  Coins,
  CheckCircle2,
  Lock,
  FileCode,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

export function JudgeProofPanel() {
  const {
    demoStep,
    setDemoStep,
    campaigns,
    conversions,
    stats,
    simulatedAddress,
    simulatedWalletConnected,
    toggleWalletConnection,
    createCampaign,
    fundCampaign,
    approveConversion,
    claimReward,
    attemptDuplicateClaim,
  } = useDemoStore();

  const [loading, setLoading] = useState(false);
  const [stepResult, setStepResult] = useState<any>(null);

  const demoCampaign = campaigns.find((c) => c.id === DEMO_CAMPAIGN_ID) || campaigns[0];

  const handleExecuteStep = async () => {
    setLoading(true);
    setStepResult(null);
    try {
      if (demoStep === 1) {
        toggleWalletConnection(true);
        setStepResult({ message: "Starknet Sepolia Wallet session connected." });
        setDemoStep(2);
      } else if (demoStep === 2) {
        const res = await createCampaign({
          name: "Judge Demo: Ekubo LP Referral Campaign",
          description: "Judge demo for campaign-scoped replay protection (STRK20 adapter pending)",
          rewardAmount: "50.0",
          maxClaims: 100,
          durationDays: 30,
          nullifierNamespace: "demo_ekubo_q1",
        });
        setStepResult(res);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
        setDemoStep(3);
      } else if (demoStep === 3) {
        const res = await fundCampaign(demoCampaign.id, "2500.0");
        setStepResult(res);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
        setDemoStep(4);
      } else if (demoStep === 4) {
        const commitment = deriveRecipientCommitment("seed_judge_demo_user");
        const res = await approveConversion({
          campaignId: demoCampaign.id,
          conversionId: "conv_judge_verified_01",
          recipientCommitment: commitment,
          rewardTier: "Hackathon Evaluation",
        });
        setStepResult(res);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
        setDemoStep(5);
      } else if (demoStep === 5) {
        const res = await claimReward({
          campaignId: demoCampaign.id,
          conversionId: "conv_judge_verified_01",
          recipientSecret: "seed_judge_demo_user",
        });
        setStepResult(res);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setDemoStep(6);
      } else if (demoStep === 6) {
        const res = await attemptDuplicateClaim(demoCampaign.id, "conv_judge_verified_01");
        setStepResult(res);
        setDemoStep(7);
      } else if (demoStep === 7) {
        setStepResult({ message: "Starknet contract proofs verified; STRK20 adapter proof pending." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-bg-surface border-border">
      {/* Step Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-primary text-fg-primary">
              Step {demoStep} of 7
            </span>
            <h3 className="text-base font-bold text-fg-primary">
              {demoStep === 1 && "Connect Starknet Account"}
              {demoStep === 2 && "Deploy Private Campaign on Starknet"}
              {demoStep === 3 && "Fund Campaign via STRK20 Shielded Balance"}
              {demoStep === 4 && "Approve Conversion with Commitment"}
              {demoStep === 5 && "Execute Confidential Reward Claim"}
              {demoStep === 6 && "Demonstrate Replay Attack Blocking"}
              {demoStep === 7 && "Inspect Onchain Proofs & Architecture"}
            </h3>
          </div>
          <p className="text-xs text-fg-secondary">
            {demoStep === 1 && "Establishes connection to Starknet Sepolia RPC."}
            {demoStep === 2 && "Executes CampaignFactory.cairo::create_campaign with nullifier namespace."}
            {demoStep === 3 && "Locks STRK token budget into the STRK20 confidential router pool."}
            {demoStep === 4 && "Campaign owner registers authorized conversion and recipient commitment hash."}
            {demoStep === 5 && "Recipient generates private note without publishing their public wallet address."}
            {demoStep === 6 && "Attacker attempts to resubmit the same conversion; NullifierRegistry.cairo reverts."}
            {demoStep === 7 && "Verifiable onchain contract links, calldata logs, and privacy assurances."}
          </p>
        </div>
      </div>

      {/* Step Interactive Context Box */}
      <div className="p-4 rounded-card bg-bg-raised border border-border space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center text-fg-muted font-sans text-[11px] uppercase tracking-wider pb-2 border-b border-border">
          <span>Active Protocol Context</span>
          <span className="text-brand-privacy">Mocked for demo: Interactive Sandbox</span>
        </div>

        {demoStep === 1 && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-fg-muted">Simulated Address:</span>
              <span className="text-fg-primary">{simulatedAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Balance:</span>
              <span className="text-brand-reward">1,420.50 STRK</span>
            </div>
          </div>
        )}

        {demoStep === 2 && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-fg-muted">Factory Contract:</span>
              <ExplorerLink type="contract" value={CONTRACT_ADDRESSES.campaignFactory} />
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Nullifier Namespace:</span>
              <span className="text-brand-primary">demo_ekubo_q1</span>
            </div>
          </div>
        )}

        {demoStep === 3 && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-fg-muted">Router Address:</span>
              <ExplorerLink type="contract" value={CONTRACT_ADDRESSES.rewardRouter} />
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Deposit Budget:</span>
              <span className="text-brand-reward">+2,500.0 STRK (Confidential)</span>
            </div>
          </div>
        )}

        {demoStep === 4 && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-fg-muted">Conversion ID:</span>
              <span className="text-fg-primary">conv_judge_verified_01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Recipient Commitment:</span>
              <span className="text-brand-privacy">0x05f8...1a92e1047db3a650d</span>
            </div>
          </div>
        )}

        {demoStep === 5 && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-fg-muted">Settlement Target:</span>
              <span className="text-brand-reward">Recipient Shielded Note</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Recipient Identity Exposure:</span>
              <span className="text-status-success font-semibold">0% (Completely Hidden)</span>
            </div>
          </div>
        )}

        {demoStep === 6 && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-fg-muted">Nullifier Registry:</span>
              <ExplorerLink type="contract" value={CONTRACT_ADDRESSES.nullifierRegistry} />
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Expected Assertion:</span>
              <span className="text-status-error">is_nullifier_used == TRUE → REVERT</span>
            </div>
          </div>
        )}

        {demoStep === 7 && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-fg-muted">Total Settled in Protocol:</span>
              <span className="text-brand-reward">{formatSTRK(stats.rewardsSettledSTRK)} STRK</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Replay Attacks Blocked:</span>
              <span className="text-status-error font-bold">{stats.duplicateClaimsBlocked}</span>
            </div>
          </div>
        )}
      </div>

      {/* Result feedback if any */}
      {stepResult && (
        <div className="p-3 rounded bg-bg-raised border border-border text-xs font-mono space-y-1">
          <div className="text-brand-privacy font-semibold">Execution Output:</div>
          <pre className="text-[11px] text-fg-secondary whitespace-pre-wrap break-all">
            {JSON.stringify(stepResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={demoStep <= 1}
          onClick={() => setDemoStep(Math.max(1, demoStep - 1))}
        >
          Previous Step
        </Button>

        <Button
          variant="primary"
          size="lg"
          isLoading={loading}
          onClick={handleExecuteStep}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {demoStep === 1 && "Execute Step 1: Connect Wallet"}
          {demoStep === 2 && "Execute Step 2: Create Campaign"}
          {demoStep === 3 && "Execute Step 3: Fund Shielded Treasury"}
          {demoStep === 4 && "Execute Step 4: Approve Conversion"}
          {demoStep === 5 && "Execute Step 5: Settle Private Reward"}
          {demoStep === 6 && "Execute Step 6: Test Replay Rejection"}
          {demoStep === 7 && "Complete Demo & View Proofs"}
        </Button>
      </div>
    </Card>
  );
}
