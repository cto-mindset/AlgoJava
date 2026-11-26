import React from "react";
import { useSearchParams } from "react-router";
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
import { cn } from "@/lib/utils/cn";
import { AboutSummaryCard } from "./AboutSummaryCard";
import { AppearanceCard } from "./AppearanceCard";
import { DataStorageCard } from "./DataStorageCard";
import { EditorSettingsCard } from "./EditorSettingsCard";
import { JavaRuntimeCard } from "./JavaRuntimeCard";
import { PracticePreferencesCard } from "./PracticePreferencesCard";

export type SettingsTabId =
  | "appearance"
  | "editor"
  | "runtime"
  | "practice"
  | "storage"
  | "about";

const SETTINGS_TABS: Array<{
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: "appearance", label: "Appearance", icon: IconPalette },
  { id: "editor", label: "Editor", icon: IconCode },
  { id: "runtime", label: "Runtime", icon: IconCpu },
  { id: "practice", label: "Practice", icon: IconTrophy },
  { id: "storage", label: "Storage", icon: IconDatabase },
  { id: "about", label: "About", icon: IconInfoCircle },
];

function isValidTab(value: string | null): value is SettingsTabId {
  return SETTINGS_TABS.some((tab) => tab.id === value);
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: SettingsTabId = isValidTab(rawTab) ? rawTab : "appearance";

  const selectTab = (tab: SettingsTabId) => {
    setSearchParams({ tab }, { replace: true });
  };

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % SETTINGS_TABS.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + SETTINGS_TABS.length) % SETTINGS_TABS.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = SETTINGS_TABS.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = SETTINGS_TABS[nextIndex];
      selectTab(nextTab.id);
      document.getElementById(`settings-tab-${nextTab.id}`)?.focus();
    }
  };

  return (
    <div className="mx-auto max-w-[1040px] space-y-5 p-6">
      <div className="algo-surface algo-hero-backdrop overflow-hidden">
        <div className="px-6 pt-6 pb-5">
          <PageHeader
            icon={<IconSettings size={24} />}
            title="Settings"
            subtitle="Customize your AlgoJava workspace, editor, and local Java runtime"
          />
        </div>

        <div
          role="tablist"
          aria-label="Settings sections"
          className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/70 px-4 py-2.5"
        >
          {SETTINGS_TABS.map(({ id, label, icon: Icon }, index) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                id={`settings-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`settings-panel-${id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => selectTab(id)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-3.5 py-2 text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)] cursor-pointer",
                  active
                    ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),var(--shadow-accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon
                  size={15}
                  className={cn(
                    active
                      ? "text-[var(--text-on-accent)]"
                      : "text-[var(--accent-light)]"
                  )}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={activeTab}
        role="tabpanel"
        id={`settings-panel-${activeTab}`}
        aria-labelledby={`settings-tab-${activeTab}`}
        className="algo-animate-fade"
      >
        {activeTab === "appearance" && <AppearanceCard />}
        {activeTab === "editor" && <EditorSettingsCard />}
        {activeTab === "runtime" && <JavaRuntimeCard />}
        {activeTab === "practice" && <PracticePreferencesCard />}
        {activeTab === "storage" && <DataStorageCard />}
        {activeTab === "about" && <AboutSummaryCard />}
      </div>
    </div>
  );
}
