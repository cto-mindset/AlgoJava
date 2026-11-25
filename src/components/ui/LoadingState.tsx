import { IconLoader2 } from "@tabler/icons-react";

export interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
      <IconLoader2 size={24} className="animate-spin text-[var(--accent-light)]" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
