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
      <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-60 -translate-x-1/2 rounded-[var(--radius-xs)] border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] px-2.5 py-1.5 text-center text-[11px] font-medium leading-snug text-[var(--text-primary)] shadow-[var(--shadow-md)] opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
        {content}
      </span>
    </span>
  );
}
