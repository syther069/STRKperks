"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useDemoStore } from "@/lib/store/demoStore";
import { CampaignStats } from "@/components/campaign/CampaignStats";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { TransactionTimeline } from "@/components/demo/TransactionTimeline";
import { PrivacyBoundaryMatrix } from "@/components/demo/PrivacyBoundaryMatrix";
import { Button } from "@/components/ui/Button";
import { PrivacyBadge } from "@/components/ui/Badge";
import {
  Activity,
  ArrowRight,
  CircleCheck,
  Fingerprint,
  Network,
  PlusCircle,
  Sparkles,
} from "lucide-react";

const settlementRoute = [
  {
    label: "Conversion approved",
    detail: "Eligibility locked",
    icon: CircleCheck,
    color: "text-brand-reward",
  },
  {
    label: "Nullifier scoped",
    detail: "Replay path closed",
    icon: Fingerprint,
    color: "text-brand-primary",
  },
  {
    label: "Private note prepared",
    detail: "Recipient graph hidden",
    icon: Network,
    color: "text-brand-privacy",
  },
];

export default function DashboardPage() {
  const { campaigns } = useDemoStore();
  const featuredCampaigns = campaigns.slice(0, 3);
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: prefersReducedMotion ? 0 : 0.04,
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 1 },
        show: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 260, damping: 26, mass: 0.72 },
        },
      };

  return (
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.section
        variants={itemVariants}
        className="relative isolate overflow-hidden rounded-[18px] border border-white/[0.08] bg-bg-surface/80 p-5 shadow-panel ring-1 ring-inset ring-white/[0.035] backdrop-blur-xl sm:p-8 lg:p-10"
        aria-labelledby="dashboard-title"
      >
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-[31%] hidden w-px bg-white/[0.045] lg:block"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-28 size-72 rounded-full border border-brand-primary/10"
        />
        <div
          aria-hidden="true"
          className="absolute -right-6 -top-10 size-40 rounded-full border border-brand-primary/10"
        />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.38fr)_minmax(17rem,0.62fr)] lg:gap-14">
          <div className="flex flex-col justify-between gap-12 lg:min-h-[23rem] lg:py-2">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <PrivacyBadge type="shielded" />
                <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-fg-muted">
                  <span className="size-1.5 rounded-full bg-status-warning shadow-[0_0_0_3px_rgba(255,209,102,0.1)]" />
                  STARKNET SEPOLIA
                </span>
              </div>

              <div className="space-y-4">
                <h1
                  id="dashboard-title"
                  className="max-w-[17ch] text-balance font-display text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-fg-primary sm:text-5xl lg:text-[3.5rem]"
                >
                  Private rewards without a public referral graph.
                </h1>
                <p className="max-w-[62ch] text-pretty text-sm leading-6 text-fg-secondary sm:text-[15px]">
                  Fund referral incentives, cashback, and contributor grants with STRK.
                  Campaign-scoped nullifiers prevent repeat claims while the settlement
                  boundary keeps recipient relationships out of the public flow.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/campaigns/create">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<PlusCircle className="size-4" aria-hidden="true" />}
                >
                  Create campaign
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  variant="ghost"
                  size="md"
                  leftIcon={<Sparkles className="size-4" aria-hidden="true" />}
                >
                  Inspect demo flow
                </Button>
              </Link>
            </div>
          </div>

          <aside className="self-end rounded-[12px] border border-white/[0.07] bg-bg/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] sm:p-5 lg:translate-y-5">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-border/70 pb-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.14em] text-fg-muted">
                  SETTLEMENT ROUTE
                </p>
                <h2 className="mt-1 text-sm font-semibold text-fg-primary">
                  Privacy boundary status
                </h2>
              </div>
              <Activity className="size-4 text-brand-primary" aria-hidden="true" />
            </div>

            <ol className="space-y-0">
              {settlementRoute.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === settlementRoute.length - 1;

                return (
                  <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="absolute left-[13px] top-7 h-[calc(100%_-_1.25rem)] w-px bg-border"
                      />
                    )}
                    <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-[7px] border border-border bg-bg-raised">
                      <Icon className={`size-3.5 ${step.color}`} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-xs font-medium text-fg-primary">
                        {step.label}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] text-fg-muted">
                        {step.detail}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </aside>
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="space-y-3" aria-labelledby="metrics-title">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-fg-muted">LIVE LEDGER</p>
            <h2 id="metrics-title" className="mt-1 text-base font-semibold text-fg-primary">
              Protocol performance
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] text-brand-privacy">
            <span className="size-1.5 rounded-full bg-brand-privacy" />
            STRK20 adapter pending
          </span>
        </div>
        <CampaignStats />
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="space-y-5"
        aria-labelledby="campaigns-title"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] tracking-[0.14em] text-fg-muted">
              CAMPAIGN CONTROL
            </p>
            <h2 id="campaigns-title" className="mt-1 text-xl font-semibold tracking-tight text-fg-primary">
              Active reward campaigns
            </h2>
            <p className="mt-1 text-xs leading-5 text-fg-secondary">
              Demo campaigns by default. Live mode requires newly reviewed and verified contract addresses.
            </p>
          </div>
          <Link href="/campaigns" className="self-start sm:self-auto">
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="size-3.5" aria-hidden="true" />}
            >
              View all {campaigns.length}
            </Button>
          </Link>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.82fr)]">
          {featuredCampaigns[0] && (
            <CampaignCard campaign={featuredCampaigns[0]} featured />
          )}
          <div className="grid gap-4">
            {featuredCampaigns.slice(1).map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      </motion.section>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PrivacyBoundaryMatrix />
        </div>
        <div className="lg:col-span-5">
          <TransactionTimeline />
        </div>
      </motion.div>
    </motion.div>
  );
}
