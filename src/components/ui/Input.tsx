import React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightElement, className, containerClassName, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative flex items-center bg-[var(--bg-input)] border border-[var(--border-default)] rounded-[var(--radius-sm)] focus-within:border-[var(--accent-border)] focus-within:ring-1 focus-within:ring-[var(--accent-soft)] transition-colors",
          containerClassName
        )}
      >
        {leftIcon && (
          <span className="pl-3 text-[var(--text-muted)] flex items-center shrink-0">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-60",
            leftIcon ? "pl-2" : "",
            rightElement ? "pr-2" : "",
            className
          )}
          {...props}
        />
        {rightElement && (
          <span className="pr-2 flex items-center shrink-0">{rightElement}</span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
