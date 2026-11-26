import React, { useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { IconButton } from "./IconButton";
import { cn } from "@/lib/utils/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidthClass = "max-w-lg",
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="algo-animate-fade fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          "algo-animate-scale w-full rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--surface-highlight),var(--shadow-lg)] overflow-hidden",
          maxWidthClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">
                {description}
              </p>
            )}
          </div>
          <IconButton label="Close dialog" size="sm" onClick={onClose}>
            <IconX size={16} />
          </IconButton>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4 text-sm text-[var(--text-primary)]">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
