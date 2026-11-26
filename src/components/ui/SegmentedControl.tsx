import React from "react";
import { cn } from "@/lib/utils/cn";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: Array<SegmentedOption<T>>;
  className?: string;
}

export function SegmentedControl<T extends string | number>({
  value,
  onChange,
  options,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-[var(--radius-sm)] bg-[var(--bg-input)] border border-[var(--border-default)] p-1 gap-0.5",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex h-full items-center justify-center gap-1.5 rounded-[6px] px-3 text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)]",
              active
                ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]/60"
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
