import {
  IconDeviceDesktop,
  IconMoon,
  IconPalette,
  IconSun,
} from "@tabler/icons-react";
import { Input, SegmentedControl, Switch } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useSettingsStore } from "@/stores/settingsStore";
import type { AccentColor, FontScale, ThemeMode } from "@/types/models";

const ACCENT_OPTIONS: Array<{ value: AccentColor; label: string; hex: string }> = [
  { value: "violet", label: "Violet", hex: "#7c3aed" },
  { value: "blue", label: "Blue", hex: "#2563eb" },
  { value: "emerald", label: "Emerald", hex: "#10b981" },
  { value: "orange", label: "Orange", hex: "#ea580c" },
  { value: "amber", label: "Amber", hex: "#d97706" },
];

export function AppearanceCard() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <section className="algo-surface p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent-light)]">
          <IconPalette size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Appearance
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Customize the look and feel of the app.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-start">
        {/* Mini visual preview card matching Settings reference */}
        <div className="sm:col-span-5 space-y-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] p-3 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 space-y-1.5">
                <div className="h-2 w-full rounded bg-[var(--accent-primary)]/70" />
                <div className="h-2 w-4/5 rounded bg-[var(--track-bg)]" />
                <div className="h-2 w-3/5 rounded bg-[var(--track-bg)]" />
              </div>
              <div className="col-span-8 space-y-1.5 rounded bg-[var(--bg-surface)] p-2 border border-[var(--border-subtle)]">
                <div className="h-2 w-3/4 rounded bg-[var(--accent-light)]/50" />
                <div className="h-2 w-full rounded bg-[var(--track-bg)]" />
                <div className="h-2 w-2/3 rounded bg-[var(--track-bg)]" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="settings-display-name"
              className="text-xs font-medium text-[var(--text-secondary)]"
            >
              Display Name
            </label>
            <Input
              id="settings-display-name"
              value={settings.userName}
              maxLength={32}
              placeholder="Developer"
              onChange={(e) => void updateSettings({ userName: e.target.value })}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="sm:col-span-7 space-y-3.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[var(--text-primary)]">Theme</span>
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
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[var(--text-primary)]">
              Accent Color
            </span>
            <div className="flex items-center gap-2">
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
                      "h-6 w-6 rounded-full transition-transform cursor-pointer",
                      active
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-surface)] scale-110"
                        : "opacity-85 hover:opacity-100"
                    )}
                    style={{ backgroundColor: opt.hex }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[var(--text-primary)]">
              Font Size
            </span>
            <SegmentedControl<FontScale>
              value={settings.fontSize}
              onChange={(fontSize) => void updateSettings({ fontSize })}
              options={[
                { value: "sm", label: "S" },
                { value: "md", label: "M" },
                { value: "lg", label: "L" },
              ]}
            />
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="font-medium text-[var(--text-primary)]">
              Sidebar Collapsed
            </span>
            <Switch
              ariaLabel="Sidebar Collapsed"
              checked={settings.sidebarCollapsed}
              onCheckedChange={(sidebarCollapsed) =>
                void updateSettings({ sidebarCollapsed })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-[var(--text-primary)]">
              Animations
            </span>
            <Switch
              ariaLabel="Animations"
              checked={settings.animations}
              onCheckedChange={(animations) => void updateSettings({ animations })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
