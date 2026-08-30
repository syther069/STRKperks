import React from "react";
import { cn } from "../../lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isMono?: boolean;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      isMono = false,
      rightElement,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
            >
              {label}
            </label>
            {helperText && !error && (
              <span className="text-[11px] text-fg-muted">{helperText}</span>
            )}
          </div>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full bg-bg-raised border border-border rounded-btn px-3.5 py-2 text-sm text-fg-primary placeholder:text-fg-muted/60 transition-colors",
              "focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-brand-primary",
              "disabled:opacity-50 disabled:bg-bg-subtle disabled:cursor-not-allowed",
              isMono && "font-mono text-xs",
              error && "border-status-error focus:border-status-error focus:ring-status-error",
              rightElement && "pr-16",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-2.5 flex items-center">{rightElement}</div>
          )}
        </div>
        {error && <p className="text-xs text-status-error font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
            >
              {label}
            </label>
            {helperText && !error && (
              <span className="text-[11px] text-fg-muted">{helperText}</span>
            )}
          </div>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "w-full bg-bg-raised border border-border rounded-btn px-3.5 py-2 text-sm text-fg-primary placeholder:text-fg-muted/60 transition-colors",
            "focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-brand-primary min-h-[90px] resize-y",
            "disabled:opacity-50 disabled:bg-bg-subtle disabled:cursor-not-allowed",
            error && "border-status-error focus:border-status-error focus:ring-status-error",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-status-error font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
