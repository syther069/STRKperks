import React from "react";
import { cn } from "../../lib/utils/cn";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message?: string;
  txHash?: string;
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-status-warning shrink-0" />,
    error: <XCircle className="w-5 h-5 text-status-error shrink-0" />,
    info: <CheckCircle2 className="w-5 h-5 text-brand-privacy shrink-0" />,
  };

  const borders = {
    success: "border-status-success/40 bg-bg-raised",
    warning: "border-status-warning/40 bg-bg-raised",
    error: "border-status-error/50 bg-bg-raised",
    info: "border-brand-privacy/40 bg-bg-raised",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-card border shadow-xl max-w-md w-full animate-in slide-in-from-top-2 duration-200",
        borders[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-fg-primary">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-fg-secondary mt-0.5 break-words">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-fg-muted hover:text-fg-primary p-0.5 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
