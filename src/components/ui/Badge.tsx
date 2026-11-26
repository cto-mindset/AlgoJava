import React from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "info"
  | "danger";

export interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

const TONE_MAP: Record<BadgeTone, string> = {
  neutral:
    "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border-[var(--border-default)]",
  accent:
    "bg-[var(--accent-soft)] text-[var(--accent-light)] border-[var(--accent-border)]",
  success:
    "bg-[var(--status-success-soft)] text-[var(--status-success)] border-[var(--status-success-border)]",
  warning:
    "bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning-border)]",
  info:
    "bg-[var(--status-info-soft)] text-[var(--status-info)] border-[var(--status-info-border)]",
  danger:
    "bg-[var(--status-danger-soft)] text-[var(--status-danger)] border-[var(--status-danger-border)]",
};

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11.5px] font-medium leading-none",
        TONE_MAP[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
