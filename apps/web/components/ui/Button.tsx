import React from "react";
import { cn } from "../../lib/utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "reward" | "privacy";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-btn transition-[color,background-color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none motion-reduce:transition-none";

    const variantStyles = {
      primary:
        "bg-brand-primary text-bg hover:bg-brand-primary-hover",
      secondary:
        "bg-bg-raised text-fg-primary border border-border hover:border-border-hover hover:bg-bg-subtle",
      ghost:
        "text-fg-secondary hover:text-fg-primary hover:bg-bg-raised",
      danger:
        "bg-status-error/15 text-status-error border border-status-error/30 hover:bg-status-error/25",
      reward:
        "bg-brand-reward text-bg font-semibold hover:bg-brand-reward/90",
      privacy:
        "bg-brand-privacy-subtle text-brand-privacy border border-brand-privacy/40 hover:bg-brand-privacy/20",
    };

    const sizeStyles = {
      sm: "min-h-11 px-2.5 py-1.5 text-xs gap-1.5 sm:min-h-9",
      md: "min-h-11 px-4 py-2 text-sm gap-2",
      lg: "min-h-12 px-6 py-2.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
      </button>
    );
  }
);

Button.displayName = "Button";
