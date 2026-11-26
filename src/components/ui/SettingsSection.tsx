import React from "react";
import { cn } from "@/lib/utils/cn";

export interface SettingCardProps {
  id?: string;
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SettingCard({
  id,
  icon,
  iconClassName,
  title,
  description,
  action,
  children,
  className,
}: SettingCardProps) {
  return (
    <section
      id={id}
      className={cn("algo-surface flex flex-col p-6 gap-5 scroll-mt-4", className)}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] border border-[var(--accent-border)]/50 text-[var(--accent-light)]",
              iconClassName
            )}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
              {title}
            </h2>
            <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">
              {description}
            </p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

export interface SettingRowProps {
  label: React.ReactNode;
  description?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingRow({
  label,
  description,
  htmlFor,
  children,
  className,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className
      )}
    >
      <div className="min-w-0">
        {htmlFor ? (
          <label
            htmlFor={htmlFor}
            className="block text-[13.5px] font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        ) : (
          <div className="text-[13.5px] font-medium text-[var(--text-primary)]">
            {label}
          </div>
        )}
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
