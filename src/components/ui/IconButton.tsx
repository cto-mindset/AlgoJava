import React from "react";
import { cn } from "@/lib/utils/cn";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "ghost" | "secondary" | "danger";
  size?: "sm" | "md";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      label,
      variant = "ghost",
      size = "md",
      className,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const variantCls =
      variant === "secondary"
        ? "bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)]"
        : variant === "danger"
        ? "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--status-danger)]"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]";

    const sizeCls = size === "sm" ? "h-8 w-8" : "h-9 w-9";

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-sm)] transition-all duration-150 active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)] disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100",
          variantCls,
          sizeCls,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
