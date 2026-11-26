import { cn } from "@/lib/utils/cn";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onCheckedChange,
  id,
  ariaLabel,
  disabled = false,
}: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-surface)] disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "bg-[var(--accent-primary)] border-[var(--accent-border)]"
          : "bg-[var(--bg-input)] border-[var(--border-strong)] hover:border-[var(--text-muted)]"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
