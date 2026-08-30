"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDemoStore } from "@/lib/store/demoStore";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlusCircle, Search, Filter } from "lucide-react";

export default function CampaignsPage() {
  const { campaigns } = useDemoStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nullifierNamespace.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-fg-primary tracking-tight">
            Campaigns Explorer
          </h1>
          <p className="text-xs text-fg-secondary mt-1">
            Discover, fund, and manage private rewards campaigns on Starknet.
          </p>
        </div>
        <Link href="/campaigns/create">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search campaigns by name or namespace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-fg-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["all", "active", "paused", "expired"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-btn text-xs font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? "bg-bg-raised text-brand-primary border border-brand-primary/40 font-semibold"
                  : "bg-bg-surface text-fg-secondary border border-border hover:bg-bg-raised"
              }`}
            >
              {status === "all" ? "All Campaigns" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="p-12 text-center rounded-card bg-bg-surface border border-border space-y-4">
          <div className="text-sm font-semibold text-fg-primary">
            No campaigns matched your search criteria
          </div>
          <p className="text-xs text-fg-secondary">
            Try adjusting your search query or status filter.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
