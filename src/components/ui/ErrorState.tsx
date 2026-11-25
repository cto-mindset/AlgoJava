import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Unable to load data",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="mx-auto my-8 max-w-lg rounded-[var(--radius-lg)] border border-[var(--status-danger-border)] bg-[var(--status-danger-soft)] p-6 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--status-danger)]/20 text-[var(--status-danger)]">
        <IconAlertCircle size={22} />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<IconRefresh size={15} />}
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
