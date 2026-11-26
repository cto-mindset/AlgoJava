import React from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent-primary)] text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),var(--shadow-accent)] border border-transparent",
  secondary:
    "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] shadow-[var(--surface-highlight)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)]",
  outline:
    "bg-transparent text-[var(--accent-light)] border border-[var(--accent-border)] hover:bg-[var(--accent-soft)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] border border-transparent hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]",
  danger:
    "bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)] hover:bg-[var(--status-danger)] hover:text-white hover:border-transparent",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-[var(--radius-sm)] gap-1.5",
  md: "h-9 px-3.5 text-[13px] rounded-[var(--radius-sm)] gap-2",
  lg: "h-10.5 px-5 text-sm rounded-[var(--radius-md)] gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      className,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-canvas)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <IconLoader2 size={15} className="animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
