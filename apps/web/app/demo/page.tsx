"use client";

import React from "react";
import { DemoTimeline } from "@/components/demo/DemoTimeline";
import { JudgeProofPanel } from "@/components/demo/JudgeProofPanel";
import { PrivacyBoundaryMatrix } from "@/components/demo/PrivacyBoundaryMatrix";
import { TransactionTimeline } from "@/components/demo/TransactionTimeline";
import { Card } from "@/components/ui/Card";
import { PrivacyBadge } from "@/components/ui/Badge";
import { Sparkles, Shield, Lock, FileCheck, CheckCircle2 } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-card bg-gradient-to-r from-bg-surface via-bg-raised to-bg-surface border border-border space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-primary text-fg-primary">
            HACKATHON EVALUATION SURFACE
          </span>
          <PrivacyBadge type="shielded" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-fg-primary tracking-tight">
          StrkPerks Interactive Protocol Walkthrough
        </h1>
        <p className="text-xs sm:text-sm text-fg-secondary max-w-3xl leading-relaxed">
          This interactive test surface lets hackathon judges step through the intended rewards lifecycle on Starknet: campaign deployment, STRK20 adapter funding, private settlement, and Cairo nullifier replay-attack blocking. Simulated steps are labeled in the UI until live contract addresses and STRK20 resources are configured.
        </p>
      </div>

      {/* Stepper Navigation */}
      <DemoTimeline />

      {/* Interactive Execution Panel */}
      <JudgeProofPanel />

      {/* Verifiable Proofs & Privacy Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <PrivacyBoundaryMatrix />
        </div>
        <div className="lg:col-span-5">
          <TransactionTimeline />
        </div>
      </div>
    </div>
  );
}
