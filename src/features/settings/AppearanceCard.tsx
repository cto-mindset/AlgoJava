import {
  IconDeviceDesktop,
  IconMoon,
  IconPalette,
  IconSun,
} from "@tabler/icons-react";
import {
  Input,
  SegmentedControl,
  Select,
  SettingCard,
  SettingRow,
  Switch,
} from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useSettingsStore } from "@/stores/settingsStore";
import type { AccentColor, FontScale, ThemeMode, UiFontFamily } from "@/types/models";

const ACCENT_OPTIONS: Array<{ value: AccentColor; label: string; hex: string }> = [
  { value: "violet", label: "Violet", hex: "#7c3aed" },
  { value: "blue", label: "Blue", hex: "#2563eb" },
  { value: "emerald", label: "Emerald", hex: "#10b981" },
  { value: "orange", label: "Orange", hex: "#ea580c" },
  { value: "amber", label: "Amber", hex: "#d97706" },
];

const FONT_LABELS: Record<UiFontFamily, string> = {
  outfit: "Outfit",
  jost: "Jost",
  inter: "Inter",
};

export function AppearanceCard() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <SettingCard
      id="settings-appearance"
      icon={<IconPalette size={18} />}
      title="Appearance"
      description="Personalize theme, violet accent, typography, and shell behavior."
    >
      {/* Compact live preview strip */}
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-3.5 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400/90" />
            <span className="h-2 w-2 rounded-full bg-amber-400/90" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
          </div>
          <div className="h-4 w-px bg-[var(--border-subtle)]" />
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: "var(--accent-primary)" }}
            />
            <span className="truncate text-xs font-medium text-[var(--text-primary)]">
              {settings.userName || "Developer"} · {FONT_LABELS[settings.fontFamily]}
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent-light)] capitalize">
          {settings.theme} · {settings.fontSize.toUpperCase()}
        </span>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        <SettingRow label="Display Name" htmlFor="settings-display-name" className="pb-3.5">
          <Input
            id="settings-display-name"
            value={settings.userName}
            maxLength={32}
            placeholder="Developer"
            containerClassName="w-full sm:w-48"
            onChange={(e) => void updateSettings({ userName: e.target.value })}
          />
        </SettingRow>

        <SettingRow label="Theme" className="py-3.5">
          <SegmentedControl<ThemeMode>
            value={settings.theme}
            onChange={(theme) => void updateSettings({ theme })}
            options={[
              { value: "dark", label: "Dark", icon: <IconMoon size={13} /> },
              { value: "light", label: "Light", icon: <IconSun size={13} /> },
              {
                value: "system",
                label: "System",
                icon: <IconDeviceDesktop size={13} />,
              },
            ]}
          />
        </SettingRow>

        <SettingRow label="Accent Color" className="py-3.5">
          <div className="flex items-center gap-2.5">
            {ACCENT_OPTIONS.map((opt) => {
              const active = settings.accentColor === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-label={`Accent color ${opt.label}`}
                  title={opt.label}
                  onClick={() => void updateSettings({ accentColor: opt.value })}
                  className={cn(
                    "h-6 w-6 rounded-full transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)]",
                    active
                      ? "ring-2 ring-[var(--text-primary)] ring-offset-2 ring-offset-[var(--bg-surface)] scale-110"
                      : "opacity-80 hover:opacity-100 hover:scale-105"
                  )}
                  style={{ backgroundColor: opt.hex }}
                />
              );
            })}
          </div>
        </SettingRow>

        <SettingRow
          label="Font Family"
          description="Primary typeface for headings and problem statements."
          className="py-3.5"
        >
          <Select<UiFontFamily>
            ariaLabel="UI Font Family"
            value={settings.fontFamily}
            onChange={(fontFamily) => void updateSettings({ fontFamily })}
            options={[
              { value: "outfit", label: "Outfit" },
              { value: "jost", label: "Jost" },
              { value: "inter", label: "Inter" },
            ]}
            className="w-40"
          />
        </SettingRow>

        <SettingRow label="Font Size" className="py-3.5">
          <SegmentedControl<FontScale>
            value={settings.fontSize}
            onChange={(fontSize) => void updateSettings({ fontSize })}
            options={[
              { value: "sm", label: "S" },
              { value: "md", label: "M" },
              { value: "lg", label: "L" },
            ]}
          />
        </SettingRow>

        <SettingRow
          label="Sidebar Collapsed"
          description="Keep the left navigation rail compact for extra editor width."
          className="py-3.5"
        >
          <Switch
            ariaLabel="Sidebar Collapsed"
            checked={settings.sidebarCollapsed}
            onCheckedChange={(sidebarCollapsed) =>
              void updateSettings({ sidebarCollapsed })
            }
          />
        </SettingRow>

        <SettingRow
          label="Animations"
          description="Smooth transitions for dialogs, tabs, and progress bars."
          className="pt-3.5"
        >
          <Switch
            ariaLabel="Animations"
            checked={settings.animations}
            onCheckedChange={(animations) => void updateSettings({ animations })}
          />
        </SettingRow>
      </div>
    </SettingCard>
  );
}
