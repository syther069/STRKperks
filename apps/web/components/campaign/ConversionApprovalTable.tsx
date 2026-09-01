"use client";

import React, { useState } from "react";
import { useDemoStore } from "../../lib/store/demoStore";
import { Campaign, Conversion } from "../../lib/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { StatusBadge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { shortenAddress, shortenHash, formatSTRK, formatDate } from "../../lib/utils/format";
import { deriveRecipientCommitment } from "../../lib/campaign/nullifier";
import { CheckCircle2, Plus, Lock, UserCheck, Shield } from "lucide-react";
import confetti from "canvas-confetti";
import { useContractActions } from "../../lib/starknet/useContractActions";
import { CONTRACT_ADDRESSES, LIVE_CONTRACTS_ENABLED } from "../../lib/utils/constants";

export interface ConversionApprovalTableProps {
  campaign: Campaign;
}

export function ConversionApprovalTable({ campaign }: ConversionApprovalTableProps) {
  const { conversions, approveConversion } = useDemoStore();
  const live = useContractActions();
  const campaignConversions = conversions.filter((c) => c.campaignId === campaign.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConversionId, setNewConversionId] = useState("conv_new_claim");
  const [recipientSecret, setRecipientSecret] = useState("demo_local_secret");
  const [rewardTier, setRewardTier] = useState("Standard Affiliate");
  const [liveNullifier, setLiveNullifier] = useState("");
  const [liveNoteId, setLiveNoteId] = useState("");
  const [liveExpiry, setLiveExpiry] = useState(() =>
    String(Math.floor(Date.now() / 1000) + 60 * 60),
  );
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [liveApproved, setLiveApproved] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const calculatedCommitment = deriveRecipientCommitment(recipientSecret);

  const handleApproveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConversionId) return;

    setActionError(null);
    try {
      if (LIVE_CONTRACTS_ENABLED) {
        if (!CONTRACT_ADDRESSES.rewardCampaign) {
          throw new Error("Configured live campaign address is missing");
        }
        if (!liveNullifier || !liveNoteId || !liveExpiry) {
          throw new Error("Prepared nullifier, open-note ID, and expiry are required");
        }
        const txHash = await live.approveClaim(
          CONTRACT_ADDRESSES.rewardCampaign,
          newConversionId,
          liveNullifier,
          liveNoteId,
          liveExpiry,
        );
        setLiveApproved((current) => ({ ...current, [newConversionId]: txHash }));
      } else {
        await approveConversion({ campaignId: campaign.id, conversionId: newConversionId, recipientCommitment: calculatedCommitment, rewardTier });
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to approve conversion");
      return;
    }

    setIsModalOpen(false);
    setNewConversionId(`conv_${Math.random().toString(36).slice(2, 7)}`);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#FF5A1F", "#3CE7C7"],
    });
  };

  const handleApproveExisting = async (conv: Conversion) => {
    setIsApproving(conv.id);
    setActionError(null);
    try {
      if (LIVE_CONTRACTS_ENABLED) {
        throw new Error(
          "Live approvals require the claimant's prepared nullifier, exact open-note ID, and expiry; use Approve New Conversion",
        );
      } else {
        await approveConversion({ campaignId: conv.campaignId, conversionId: conv.id, recipientCommitment: conv.recipientCommitment, rewardTier: conv.rewardTier });
      }
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#FF5A1F", "#3CE7C7"],
      });
    } catch (err: any) {
      setActionError(err?.message || "Failed to approve claim");
    } finally {
      setIsApproving(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-fg-primary">
            Claim Authorizations
          </h4>
          <p className="text-xs text-fg-secondary">
            Live approvals bind the conversion to one exact wallet-prepared open note.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsModalOpen(true)}
          disabled={LIVE_CONTRACTS_ENABLED && !live.isReady}
        >
          Approve New Conversion
        </Button>
      </div>

      {actionError && <p className="text-xs text-status-error">{actionError}</p>}

      {campaignConversions.length === 0 ? (
        <div className="p-8 rounded-card bg-bg-raised border border-border text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-bg-surface border border-border flex items-center justify-center mx-auto text-fg-muted">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-fg-primary">
              No conversions registered yet
            </div>
            <p className="text-xs text-fg-secondary mt-0.5">
              {LIVE_CONTRACTS_ENABLED
                ? "Prepare a claimant note first, then approve its exact public authorization fields."
                : "Approve a demo conversion with a recipient commitment."}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            {LIVE_CONTRACTS_ENABLED ? "Approve Prepared Claim" : "Approve Test Conversion"}
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-card overflow-hidden bg-bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-raised border-b border-border text-fg-muted uppercase font-mono tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Conversion ID</th>
                  <th className="px-4 py-3">Recipient Commitment</th>
                  <th className="px-4 py-3">Tier / Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {campaignConversions.map((conv) => (
                  <tr key={conv.id} className="hover:bg-bg-raised/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-fg-primary font-medium">
                      {conv.id}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-brand-privacy">
                      <div className="flex items-center gap-1.5" title={conv.recipientCommitment}>
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                        <span>{shortenHash(conv.recipientCommitment, 6)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-brand-reward font-mono">
                        {formatSTRK(conv.rewardAmount)} STRK
                      </div>
                      <div className="text-[10px] text-fg-muted">{conv.rewardTier}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={conv.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {conv.status === "pending" && !liveApproved[conv.id] ? (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isApproving === conv.id}
                          disabled={LIVE_CONTRACTS_ENABLED && !live.isReady}
                          onClick={() => handleApproveExisting(conv)}
                        >
                          Approve Conversion
                        </Button>
                      ) : conv.status === "approved" || liveApproved[conv.id] ? (
                        <span className="text-[11px] font-mono text-status-success font-medium">
                          Ready to Claim
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-fg-muted">
                          Settled via STRK20
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve New Conversion Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Approve Conversion"
        description="Authorize the exact prepared STRK20 open note. The claimant supplies these public preparation values."
        maxWidth="md"
      >
        <form onSubmit={handleApproveNew} className="space-y-4">
          <Input
            label="Conversion ID"
            placeholder="e.g. conv_ref_8829"
            value={newConversionId}
            onChange={(e) => setNewConversionId(e.target.value)}
            isMono
            helperText="Campaign-unique referral or conversion identifier"
          />

          {LIVE_CONTRACTS_ENABLED ? (
            <>
              <Input
                label="Campaign Nullifier"
                placeholder="0x..."
                value={liveNullifier}
                onChange={(e) => setLiveNullifier(e.target.value)}
                isMono
                helperText="Copy from the claimant's prepared private claim"
              />
              <Input
                label="Exact Open-Note ID"
                placeholder="0x..."
                value={liveNoteId}
                onChange={(e) => setLiveNoteId(e.target.value)}
                isMono
                helperText="Changing this value redirects the payout, so verify it out of band"
              />
              <Input
                label="Authorization Expiry (Unix seconds)"
                value={liveExpiry}
                onChange={(e) => setLiveExpiry(e.target.value)}
                isMono
                helperText="Must remain in the future when the private claim executes"
              />
            </>
          ) : (
            <>
              <Input
                label="Recipient Secret / Salt (Simulated)"
                placeholder="Recipient's private viewing seed"
                value={recipientSecret}
                onChange={(e) => setRecipientSecret(e.target.value)}
                isMono
                helperText="Demo-only local seed; never used by the live STRK20 flow"
              />

              <div className="p-3 rounded bg-bg-surface border border-border space-y-1.5 font-mono text-xs">
                <span className="text-[10px] text-fg-muted uppercase tracking-wider block font-sans">
                  Demo Recipient Commitment Hash:
                </span>
                <div className="text-brand-privacy break-all text-[11px]">
                  {calculatedCommitment}
                </div>
              </div>
            </>
          )}

          <Input
            label="Reward Tier"
            placeholder="e.g. Top Community Ambassador"
            value={rewardTier}
            onChange={(e) => setRewardTier(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              disabled={LIVE_CONTRACTS_ENABLED && !live.isReady}
            >
              Approve Conversion
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
