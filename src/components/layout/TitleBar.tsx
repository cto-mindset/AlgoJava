import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  IconArrowLeft,
  IconBolt,
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
  const isSubPage = location.pathname !== "/";

  const handleToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    void updateSettings({ theme: next });
  };

  return (
    <header
      data-tauri-drag-region
      className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-titlebar)] px-3 select-none"
    >
      {/* Left context / breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        {isProblemDetail ? (
          <button
            type="button"
            onClick={() => navigate("/problems")}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <IconArrowLeft size={14} />
            <span>Back to Problems</span>
          </button>
        ) : isSubPage ? (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <IconArrowLeft size={14} />
            <span>
              {location.pathname === "/problems"
                ? "Problems"
                : location.pathname === "/progress"
                ? "Progress"
                : location.pathname === "/settings"
                ? "Settings"
                : "About"}
            </span>
          </button>
        ) : (
          <span
            data-tauri-drag-region
            className="px-2 text-xs font-medium text-[var(--text-muted)]"
          >
            AlgoJava
          </span>
        )}
      </div>

      {/* Right badges & window controls */}
      <div className="flex items-center gap-1.5">
        <div
          className="mr-1.5 inline-flex items-center gap-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent-light)]"
          title="All problems, database, and Java execution run locally offline"
        >
          <IconBolt size={12} />
          <span>100% Offline</span>
        </div>

        <button
          type="button"
          onClick={handleToggleTheme}
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          aria-label="Toggle theme"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          {theme === "dark" ? <IconSun size={15} /> : <IconMoon size={15} />}
        </button>

        <div className="ml-1 flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Minimize window"
            onClick={() => void minimizeAppWindow()}
            className="inline-flex h-7 w-8 items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <IconMinus size={14} />
          </button>
          <button
            type="button"
            aria-label={maximized ? "Restore window" : "Maximize window"}
            onClick={() =>
              void toggleMaximizeAppWindow().then(setMaximized).catch(() => {})
            }
            className="inline-flex h-7 w-8 items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {maximized ? <IconSquareToggle size={13} /> : <IconSquare size={13} />}
          </button>
          <button
            type="button"
            aria-label="Close window"
            onClick={() => void closeAppWindow()}
            className="inline-flex h-7 w-8 items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-secondary)] hover:bg-[var(--status-danger)] hover:text-white transition-colors cursor-pointer"
          >
            <IconX size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
