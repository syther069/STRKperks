import React from "react";
import { cn } from "../../lib/utils/cn";
import { ShieldCheck, Lock, Unlock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export interface StatusBadgeProps {
  status:
    | "active"
    | "approved"
    | "paused"
    | "pending"
    | "expired"
    | "closed"
    | "claimed"
    | "rejected"
    | "duplicate_blocked";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs = {
    active: {
      label: "Active",
      icon: CheckCircle2,
      style: "bg-status-success/15 text-status-success border-status-success/30",
    },
    approved: {
      label: "Approved",
      icon: CheckCircle2,
      style: "bg-brand-privacy-subtle text-brand-privacy border-brand-privacy/40",
    },
    paused: {
      label: "Paused",
      icon: AlertTriangle,
      style: "bg-status-warning/15 text-status-warning border-status-warning/30",
    },
    pending: {
      label: "Pending",
      icon: AlertTriangle,
      style: "bg-status-warning/15 text-status-warning border-status-warning/30",
    },
    expired: {
      label: "Expired",
      icon: XCircle,
      style: "bg-fg-muted/15 text-fg-muted border-fg-muted/30",
    },
    closed: {
      label: "Closed",
      icon: XCircle,
      style: "bg-fg-muted/15 text-fg-secondary border-border",
    },
    claimed: {
      label: "Claimed",
      icon: CheckCircle2,
      style: "bg-brand-reward-subtle text-brand-reward border-brand-reward/40",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      style: "bg-status-error/15 text-status-error border-status-error/30",
    },
    duplicate_blocked: {
      label: "Duplicate Blocked",
      icon: XCircle,
      style: "bg-status-error/20 text-status-error border-status-error/40 font-semibold",
    },
  };

  const config = configs[status] || configs.active;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border select-none",
        config.style,
        className
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

export interface PrivacyBadgeProps {
  type: "shielded" | "public" | "nullifier" | "zk_note";
  className?: string;
}

export function PrivacyBadge({ type, className }: PrivacyBadgeProps) {
  const configs = {
    shielded: {
      label: "STRK20 Shielded",
      icon: ShieldCheck,
      style: "bg-brand-privacy-subtle text-brand-privacy border-brand-privacy/40",
    },
    public: {
      label: "Public Onchain",
      icon: Unlock,
      style: "bg-bg-raised text-fg-secondary border-border",
    },
    nullifier: {
      label: "Nullifier Protected",
      icon: Lock,
      style: "bg-brand-primary-subtle text-brand-primary border-brand-primary/40",
    },
    zk_note: {
      label: "Private Note",
      icon: ShieldCheck,
      style: "bg-brand-reward-subtle text-brand-reward border-brand-reward/40",
    },
  };

  const config = configs[type] || configs.shielded;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border select-none",
        config.style,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
