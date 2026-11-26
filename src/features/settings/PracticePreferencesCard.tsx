import { IconTrophy } from "@tabler/icons-react";
import { SettingCard, SettingRow, Switch } from "@/components/ui";
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
  description: string;
}> = [
  {
    key: "autoOpenNextProblem",
    label: "Automatically open next problem",
    description: "Advance to the next challenge in the category after passing all tests.",
  },
  {
    key: "showHintsByDefault",
    label: "Show hints by default",
    description: "Expand problem hints automatically when opening a challenge.",
  },
  {
    key: "showTestResultsAutomatically",
    label: "Show test results automatically",
    description: "Open the execution output panel whenever you Run or Submit code.",
  },
  {
    key: "confirmBeforeResettingCode",
    label: "Confirm before resetting code",
    description: "Show a safety dialog before reverting your code to the starter template.",
  },
  {
    key: "rememberLastCategory",
    label: "Remember last opened category",
    description: "Re-open your previous category filter when returning to Problems.",
  },
  {
    key: "showSolvedProblems",
    label: "Show solved problems",
    description: "Keep already completed problems visible in the main problem catalog.",
  },
];

export function PracticePreferencesCard() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <SettingCard
      id="settings-practice"
      icon={<IconTrophy size={18} />}
      iconClassName="bg-[var(--status-warning-soft)] border-[var(--status-warning-border)] text-[var(--status-warning)]"
      title="Practice Preferences"
      description="Fine-tune your problem solving flow and editor feedback."
    >
      <div className="divide-y divide-[var(--border-subtle)]">
        {PRACTICE_TOGGLES.map((item, index) => (
          <SettingRow
            key={item.key}
            label={item.label}
            description={item.description}
            className={
              index === 0
                ? "pb-3.5"
                : index === PRACTICE_TOGGLES.length - 1
                ? "pt-3.5"
                : "py-3.5"
            }
          >
            <Switch
              ariaLabel={item.label}
              checked={settings[item.key]}
              onCheckedChange={(val) =>
                void updateSettings({ [item.key]: val })
              }
            />
          </SettingRow>
        ))}
      </div>
    </SettingCard>
  );
}
