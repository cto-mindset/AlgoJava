import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  IconArrowLeft,
  IconBolt,
  IconChevronRight,
  IconMinus,
  IconMoon,
  IconSquare,
  IconSquareToggle,
  IconSun,
  IconX,
} from "@tabler/icons-react";
import {
  closeAppWindow,
  isAppWindowMaximized,
  minimizeAppWindow,
  toggleMaximizeAppWindow,
} from "@/lib/tauri/windowClient";
import { useSettingsStore } from "@/stores/settingsStore";
import type { ThemeMode } from "@/types/models";

const ROUTE_LABELS: Record<string, string> = {
  "/problems": "Problems",
  "/progress": "Progress",
  "/settings": "Settings",
  "/about": "About",
};

function getEffectiveTheme(mode: ThemeMode): "dark" | "light" {
  if (mode === "system") {
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }
    return "dark";
  }
  return mode;
}

export function TitleBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useSettingsStore((s) => s.settings.theme);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    void isAppWindowMaximized().then(setMaximized).catch(() => {});
  }, []);

  const isProblemDetail = location.pathname.startsWith("/problems/");
  const sectionLabel = ROUTE_LABELS[location.pathname];
  const effectiveTheme = getEffectiveTheme(theme);

  const handleToggleTheme = () => {
    const next = effectiveTheme === "dark" ? "light" : "dark";
    void updateSettings({ theme: next });
  };

  return (
    <header
      data-tauri-drag-region
      className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-titlebar)] pl-3 select-none"
    >
      {/* Left context / breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        {isProblemDetail ? (
          <button
            type="button"
            onClick={() => navigate("/problems")}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)] transition-colors cursor-pointer"
          >
            <IconArrowLeft size={14} />
            <span>Back to Problems</span>
          </button>
        ) : sectionLabel ? (
          <div
            data-tauri-drag-region
            className="flex items-center gap-1.5 px-1.5 text-xs"
          >
            <span className="font-medium text-[var(--text-muted)]">AlgoJava</span>
            <IconChevronRight size={13} className="text-[var(--text-muted)]" />
            <span className="font-semibold text-[var(--text-primary)]">
              {sectionLabel}
            </span>
          </div>
        ) : (
          <span
            data-tauri-drag-region
            className="px-1.5 text-xs font-medium text-[var(--text-muted)]"
          >
            AlgoJava
          </span>
        )}
      </div>

      {/* Right badges & window controls */}
      <div className="flex h-full items-center gap-1.5">
        <div
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]"
          title="All problems, database, and Java execution run locally offline"
        >
          <IconBolt size={12} className="text-[var(--accent-light)]" />
          <span>100% Offline</span>
        </div>

        <button
          type="button"
          onClick={handleToggleTheme}
          title={
            effectiveTheme === "dark"
              ? "Switch to Light Theme"
              : "Switch to Dark Theme"
          }
          aria-label="Toggle theme"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)] transition-colors cursor-pointer"
        >
          {effectiveTheme === "dark" ? (
            <IconSun size={15} />
          ) : (
            <IconMoon size={15} />
          )}
        </button>

        <div className="ml-0.5 flex h-full items-center border-l border-[var(--border-subtle)] pl-1">
          <button
            type="button"
            aria-label="Minimize window"
            onClick={() => void minimizeAppWindow()}
            className="inline-flex h-full w-10 items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <IconMinus size={14} />
          </button>
          <button
            type="button"
            aria-label={maximized ? "Restore window" : "Maximize window"}
            onClick={() =>
              void toggleMaximizeAppWindow().then(setMaximized).catch(() => {})
            }
            className="inline-flex h-full w-10 items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {maximized ? <IconSquareToggle size={13} /> : <IconSquare size={13} />}
          </button>
          <button
            type="button"
            aria-label="Close window"
            onClick={() => void closeAppWindow()}
            className="inline-flex h-full w-10 items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--status-danger)] hover:text-white transition-colors cursor-pointer"
          >
            <IconX size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
