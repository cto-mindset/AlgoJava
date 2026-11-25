import { IconSettings } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui";
import { AboutSummaryCard } from "./AboutSummaryCard";
import { AppearanceCard } from "./AppearanceCard";
import { DataStorageCard } from "./DataStorageCard";
import { EditorSettingsCard } from "./EditorSettingsCard";
import { JavaRuntimeCard } from "./JavaRuntimeCard";
import { PracticePreferencesCard } from "./PracticePreferencesCard";

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1320px] space-y-5 p-6">
      <div className="algo-surface algo-hero-backdrop p-5">
        <PageHeader
          icon={<IconSettings size={24} />}
          title="Settings"
          subtitle="Customize your AlgoJava experience"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
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
