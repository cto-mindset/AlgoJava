import {
  IconCode,
  IconCpu,
  IconDatabase,
  IconInfoCircle,
  IconPalette,
  IconSettings,
  IconTrophy,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/ui";
import { AboutSummaryCard } from "./AboutSummaryCard";
import { AppearanceCard } from "./AppearanceCard";
import { DataStorageCard } from "./DataStorageCard";
import { EditorSettingsCard } from "./EditorSettingsCard";
import { JavaRuntimeCard } from "./JavaRuntimeCard";
import { PracticePreferencesCard } from "./PracticePreferencesCard";

const SETTINGS_SECTIONS = [
  { id: "settings-appearance", label: "Appearance", icon: IconPalette },
  { id: "settings-editor", label: "Editor", icon: IconCode },
  { id: "settings-runtime", label: "Runtime", icon: IconCpu },
  { id: "settings-practice", label: "Practice", icon: IconTrophy },
  { id: "settings-storage", label: "Storage", icon: IconDatabase },
  { id: "settings-about", label: "About", icon: IconInfoCircle },
];

export function SettingsPage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 p-6">
      <div className="algo-surface algo-hero-backdrop p-6 space-y-4">
        <PageHeader
          icon={<IconSettings size={24} />}
          title="Settings"
          subtitle="Customize your AlgoJava workspace, editor, and local Java runtime"
        />

        <nav
          aria-label="Settings sections"
          className="flex flex-wrap items-center gap-1.5 pt-1"
        >
          {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)] transition-colors cursor-pointer"
            >
              <Icon size={13} className="text-[var(--accent-light)]" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 items-start">
        <AppearanceCard />
        <EditorSettingsCard />
        <JavaRuntimeCard />
        <PracticePreferencesCard />
        <DataStorageCard />
        <AboutSummaryCard />
      </div>
    </div>
  );
}
