"use client";

import React from "react";
import { useDemoStore } from "../../lib/store/demoStore";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { CheckCircle2, Circle, ArrowRight, RotateCcw, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";

export function DemoTimeline() {
  const { demoStep, setDemoStep, resetDemo } = useDemoStore();

  const steps = [
    {
      id: 1,
      title: "Connect Starknet Wallet",
      summary: "Initialize session on Starknet Sepolia",
    },
    {
      id: 2,
      title: "Create Private Campaign",
      summary: "Deploy Campaign rules with isolated nullifier namespace",
    },
    {
      id: 3,
      title: "Fund Shielded Treasury",
      summary: "Deposit STRK tokens into STRK20 confidential pool",
    },
    {
      id: 4,
      title: "Approve Valid Conversion",
      summary: "Authorize recipient commitment for reward claim",
    },
    {
      id: 5,
      title: "Settle Private Reward Note",
      summary: "Recipient claims private note without leaking address",
    },
    {
      id: 6,
      title: "Block Duplicate Claim (Replay Guard)",
      summary: "Demonstrate NullifierRegistry.cairo rejecting duplicate submission",
    },
    {
      id: 7,
      title: "Verify Starknet Onchain Proofs",
      summary: "Inspect L2 transactions, nullifier hashes, and privacy matrix",
    },
  ];

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-brand-primary-subtle text-brand-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-fg-primary">
              Hackathon Judge Demo Flow (7 Milestones)
            </h3>
            <p className="text-xs text-fg-secondary">
              Follow the full lifecycle of a private reward settlement on Starknet.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={resetDemo}
          className="text-xs text-fg-muted hover:text-fg-primary"
        >
          Reset Demo State
        </Button>
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {steps.map((step) => {
          const isCurrent = demoStep === step.id;
          const isCompleted = demoStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => setDemoStep(step.id)}
              className={`p-3 rounded-card text-left transition-all border cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? "bg-bg-raised border-brand-primary ring-1 ring-brand-primary"
                  : isCompleted
                  ? "bg-bg-surface border-border-hover/80 opacity-90"
                  : "bg-bg-surface/50 border-border opacity-50 hover:opacity-80"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? "bg-brand-primary text-fg-primary"
                        : isCompleted
                        ? "bg-status-success/20 text-status-success"
                        : "bg-bg-raised text-fg-muted"
                    }`}
                  >
                    0{step.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-fg-muted shrink-0" />
                  )}
                </div>
                <div className="text-xs font-semibold text-fg-primary line-clamp-2">
                  {step.title}
                </div>
              </div>
              <div className="text-[10px] text-fg-muted mt-2 line-clamp-2 font-mono">
                {step.summary}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
