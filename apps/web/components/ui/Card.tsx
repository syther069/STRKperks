import React from "react";
import { cn } from "../../lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "raised" | "shielded" | "interactive";
}

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-bg-surface border border-border",
    raised: "bg-bg-raised border border-border shadow-md",
    shielded:
      "bg-gradient-to-b from-brand-privacy-subtle/40 to-bg-surface border border-brand-privacy/30",
    interactive:
      "bg-bg-surface border border-border hover:border-border-hover hover:bg-bg-raised/60 transition-all cursor-pointer",
  };

  return (
    <div
      className={cn(
        "rounded-card p-5 overflow-hidden",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3 mb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-fg-primary tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-fg-secondary mt-0.5", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
}
