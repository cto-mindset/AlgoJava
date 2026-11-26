import React from "react";
import { cn } from "@/lib/utils/cn";

export interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <span className="flex shrink-0 items-center text-[var(--accent-light)]">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text-primary)] truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-[13px] text-[var(--text-secondary)] truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
