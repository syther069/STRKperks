"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDemoStore } from "@/lib/store/demoStore";
import { ClaimPanel } from "@/components/claim/ClaimPanel";
import { ChevronLeft } from "lucide-react";

export default function ClaimPage() {
  const params = useParams();
  const campaignId = params.campaignId as string;
  const { campaigns } = useDemoStore();

  const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href={`/campaigns/${campaign.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Campaign Overview</span>
        </Link>
      </div>

      <ClaimPanel campaign={campaign} />
    </div>
  );
}
