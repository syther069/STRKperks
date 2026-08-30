"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoStore } from "../../lib/store/demoStore";
import { campaignFormSchema, CampaignFormData } from "../../lib/validation/campaignSchema";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { Card } from "../ui/Card";
import { PrivacyBadge } from "../ui/Badge";
import { formatSTRK } from "../../lib/utils/format";
import { PlusCircle, ShieldCheck, Lock, Info, CheckCircle2 } from "lucide-react";
import { APP_CONFIG, CONTRACT_ADDRESSES } from "../../lib/utils/constants";
import confetti from "canvas-confetti";

export function CampaignForm() {
  const router = useRouter();
  const { createCampaign } = useDemoStore();

  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    rewardAmount: "25.0",
    maxClaims: "100",
    durationDays: "30",
    nullifierNamespace: "strk_rewards_ns",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{
    campaignId: string;
    txHash: string;
  } | null>(null);

  const totalRequiredBudget =
    !isNaN(parseFloat(formData.rewardAmount)) && !isNaN(parseInt(formData.maxClaims, 10))
      ? (parseFloat(formData.rewardAmount) * parseInt(formData.maxClaims, 10)).toFixed(1)
      : "0.0";

  const handleChange = (field: keyof CampaignFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = campaignFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCampaign({
        name: formData.name,
        description: formData.description,
        rewardAmount: formData.rewardAmount,
        maxClaims: parseInt(formData.maxClaims, 10),
        durationDays: parseInt(formData.durationDays, 10),
        nullifierNamespace: formData.nullifierNamespace,
      });

      setCreatedResult(res);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#FF5A1F", "#B7FF5A", "#3CE7C7"],
      });
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to create campaign" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdResult) {
    return (
      <Card className="max-w-2xl mx-auto p-6 space-y-6 border-status-success/40 bg-bg-surface">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="p-3 rounded-full bg-status-success/20 text-status-success">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-fg-primary">
              Campaign Created Successfully on Starknet
            </h3>
            <p className="text-xs text-fg-secondary">
              Campaign registered via CampaignFactory.cairo with shielded settlement routing.
            </p>
          </div>
        </div>

        <div className="space-y-3 font-mono text-xs p-4 rounded bg-bg-raised border border-border">
          <div className="flex justify-between">
            <span className="text-fg-muted">Campaign ID:</span>
            <span className="text-brand-reward font-semibold">{createdResult.campaignId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-fg-muted">Factory Address:</span>
            <span className="text-fg-secondary truncate max-w-[240px]">
              {CONTRACT_ADDRESSES.campaignFactory}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-fg-muted">Transaction Hash:</span>
            <span className="text-brand-privacy truncate max-w-[240px]">
              {createdResult.txHash}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-fg-muted">Status:</span>
            <span className="text-status-success">ACCEPTED_ON_L2</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => router.push(`/campaigns/${createdResult.campaignId}`)}
          >
            Manage Campaign
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => router.push("/campaigns")}
          >
            View All Campaigns
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-fg-primary">
              Campaign Specifications
            </h3>
            <p className="text-xs text-fg-secondary">
              Define the rules, token allocation, and replay-protection namespace.
            </p>
          </div>
          <PrivacyBadge type="shielded" />
        </div>

        {errors.form && (
          <div className="p-3 rounded bg-status-error/15 border border-status-error/30 text-status-error text-xs font-medium">
            {errors.form}
          </div>
        )}

        <Input
          label="Campaign Name"
          placeholder="e.g. Starknet DeFi Growth Referral Bounty"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />

        <Textarea
          label="Campaign Description"
          placeholder="Describe who is eligible for private rewards and what action constitutes a valid conversion..."
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Reward per Conversion (STRK)"
            type="number"
            step="0.1"
            placeholder="50.0"
            value={formData.rewardAmount}
            onChange={(e) => handleChange("rewardAmount", e.target.value)}
            error={errors.rewardAmount}
            isMono
            rightElement={<span className="text-xs font-bold text-fg-muted">STRK</span>}
          />

          <Input
            label="Maximum Allowed Claims"
            type="number"
            step="1"
            placeholder="100"
            value={formData.maxClaims}
            onChange={(e) => handleChange("maxClaims", e.target.value)}
            error={errors.maxClaims}
            isMono
            rightElement={<span className="text-xs font-bold text-fg-muted">Claims</span>}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Campaign Duration (Days)"
            type="number"
            step="1"
            placeholder="30"
            value={formData.durationDays}
            onChange={(e) => handleChange("durationDays", e.target.value)}
            error={errors.durationDays}
            isMono
            rightElement={<span className="text-xs font-bold text-fg-muted">Days</span>}
          />

          <Input
            label="Nullifier Namespace (Replay Isolation)"
            placeholder="e.g. defi_q1_referral"
            value={formData.nullifierNamespace}
            onChange={(e) => handleChange("nullifierNamespace", e.target.value)}
            error={errors.nullifierNamespace}
            isMono
            helperText="Scopes conversion nullifiers to prevent cross-campaign collisions"
          />
        </div>
      </Card>

      {/* Real-time Budget & Privacy Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-card bg-bg-surface border border-border space-y-1">
          <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider">
            Total STRK Budget Required
          </span>
          <div className="text-xl font-bold font-mono text-brand-reward">
            {formatSTRK(totalRequiredBudget)} STRK
          </div>
          <p className="text-[11px] text-fg-secondary">
            {formData.maxClaims || 0} claims × {formData.rewardAmount || 0} STRK
          </p>
        </div>

        <div className="p-4 rounded-card bg-bg-surface border border-border space-y-1">
          <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider">
            Privacy Guarantee
          </span>
          <div className="text-sm font-semibold text-brand-privacy flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Shielded Notes
          </div>
          <p className="text-[11px] text-fg-secondary">
            Recipient wallet hidden on public explorer
          </p>
        </div>

        <div className="p-4 rounded-card bg-bg-surface border border-border space-y-1">
          <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider">
            Replay Attack Guard
          </span>
          <div className="text-sm font-semibold text-brand-primary flex items-center gap-1">
            <Lock className="w-4 h-4" />
            Nullifier Registry
          </div>
          <p className="text-[11px] text-fg-secondary">
            Scoped to namespace {formData.nullifierNamespace || "..."}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Create Campaign
        </Button>
      </div>
    </form>
  );
}
