import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled = false,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 text-sm text-[var(--text-primary)] select-none",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "flex h-4.5 w-4.5 items-center justify-center rounded-[5px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)]",
          checked
            ? "bg-[var(--accent-primary)] border-[var(--accent-border)] text-white"
            : "bg-[var(--bg-input)] border-[var(--border-strong)] hover:border-[var(--accent-border)]"
        )}
      >
        {checked && <IconCheck size={12} stroke={3} />}
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}
