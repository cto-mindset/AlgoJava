import { IconChecklist, IconTrophy } from "@tabler/icons-react";
import { Switch } from "@/components/ui";
import { useSettingsStore } from "@/stores/settingsStore";
import type { AppSettings } from "@/types/models";

const PRACTICE_TOGGLES: Array<{
  key: keyof Pick<
    AppSettings,
    | "autoOpenNextProblem"
    | "showHintsByDefault"
    | "showTestResultsAutomatically"
    | "confirmBeforeResettingCode"
    | "rememberLastCategory"
    | "showSolvedProblems"
  >;
  label: string;
}> = [
  { key: "autoOpenNextProblem", label: "Automatically open next problem" },
  { key: "showHintsByDefault", label: "Show hints by default" },
  { key: "showTestResultsAutomatically", label: "Show test results automatically" },
  { key: "confirmBeforeResettingCode", label: "Confirm before resetting code" },
  { key: "rememberLastCategory", label: "Remember last opened category" },
  { key: "showSolvedProblems", label: "Show solved problems" },
];

export function PracticePreferencesCard() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <section className="algo-surface p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--status-warning-soft)] text-[var(--status-warning)]">
          <IconTrophy size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Practice Preferences
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Configure your problem solving workflow.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-center">
        <div className="sm:col-span-4 hidden sm:flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] py-7 text-[var(--accent-light)]">
          <IconChecklist size={52} stroke={1.4} />
        </div>

        <div className="sm:col-span-8 space-y-2.5 text-xs">
          {PRACTICE_TOGGLES.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3">
              <span className="text-[var(--text-primary)]">{item.label}</span>
              <Switch
                ariaLabel={item.label}
                checked={settings[item.key]}
                onCheckedChange={(val) =>
                  void updateSettings({ [item.key]: val })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
