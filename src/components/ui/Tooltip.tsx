import React from "react";
import { cn } from "@/lib/utils/cn";

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex items-center", className)} title={content}>
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-xs)] border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] px-2 py-1 text-[11px] font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)] group-hover:block">
        {content}
      </span>
    </span>
  );
}
