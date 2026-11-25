import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function Select<T extends string | number = string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  disabled,
}: SelectProps<T>) {
  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const raw = e.target.value;
          const match = options.find((opt) => String(opt.value) === raw);
          if (match) {
            onChange(match.value);
          }
        }}
        className="w-full appearance-none bg-[var(--bg-input)] border border-[var(--border-default)] hover:border-[var(--border-strong)] focus:border-[var(--accent-border)] rounded-[var(--radius-sm)] px-3 pr-8 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none cursor-pointer disabled:opacity-50"
      >
        {options.map((opt) => (
          <option
            key={String(opt.value)}
            value={opt.value}
            className="bg-[var(--bg-surface)] text-[var(--text-primary)]"
          >
            {opt.label}
          </option>
        ))}
      </select>
      <IconChevronDown
        size={15}
        className="pointer-events-none absolute right-2.5 text-[var(--text-secondary)]"
      />
    </div>
  );
}
