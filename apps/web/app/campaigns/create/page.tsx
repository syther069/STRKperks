"use client";

import React from "react";
import Link from "next/link";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import { ChevronLeft } from "lucide-react";

export default function CreateCampaignPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Campaigns</span>
        </Link>
      </div>

      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-fg-primary tracking-tight">
          Create Private Rewards Campaign
        </h1>
        <p className="text-xs text-fg-secondary mt-1">
          Deploy a privacy-preserving referral and contributor reward contract instance on Starknet.
        </p>
      </div>

      <CampaignForm />
    </div>
  );
}
