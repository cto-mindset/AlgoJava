import {
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import { useToastStore } from "@/stores/toastStore";
import { cn } from "@/lib/utils/cn";

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const icon =
          toast.tone === "success" ? (
            <IconCheck size={15} className="text-[var(--status-success)]" />
          ) : toast.tone === "error" ? (
            <IconX size={15} className="text-[var(--status-danger)]" />
          ) : toast.tone === "warning" ? (
            <IconAlertTriangle size={15} className="text-[var(--status-warning)]" />
          ) : (
            <IconInfoCircle size={15} className="text-[var(--accent-light)]" />
          );

        const iconToneClass =
          toast.tone === "success"
            ? "bg-[var(--status-success-soft)]"
            : toast.tone === "error"
            ? "bg-[var(--status-danger-soft)]"
            : toast.tone === "warning"
            ? "bg-[var(--status-warning-soft)]"
            : "bg-[var(--accent-soft)]";

        const borderClass =
          toast.tone === "success"
            ? "border-[var(--status-success-border)]"
            : toast.tone === "error"
            ? "border-[var(--status-danger-border)]"
            : toast.tone === "warning"
            ? "border-[var(--status-warning-border)]"
            : "border-[var(--accent-border)]";

        return (
          <div
            key={toast.id}
            className={cn(
              "algo-animate-toast flex items-start gap-2.5 rounded-[var(--radius-md)] border bg-[var(--bg-surface-elevated)] px-3.5 py-2.5 shadow-[var(--surface-highlight),var(--shadow-md)]",
              borderClass
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                iconToneClass
              )}
            >
              {icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
              className="rounded-[var(--radius-xs)] p-1 text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <IconX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
