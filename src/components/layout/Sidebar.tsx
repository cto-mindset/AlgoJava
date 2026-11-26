import { NavLink } from "react-router";
import {
  IconChartBar,
  IconChevronLeft,
  IconChevronRight,
  IconCode,
  IconHome,
  IconInfoCircle,
  IconLayoutGrid,
  IconSettings,
} from "@tabler/icons-react";
import { JavaCupEmblem } from "@/components/shared/Illustrations";
import { cn } from "@/lib/utils/cn";
import { useSettingsStore } from "@/stores/settingsStore";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: IconHome, end: true },
  { to: "/problems", label: "Problems", icon: IconLayoutGrid, end: false },
  { to: "/progress", label: "Progress", icon: IconChartBar, end: true },
  { to: "/settings", label: "Settings", icon: IconSettings, end: true },
  { to: "/about", label: "About", icon: IconInfoCircle, end: true },
];

export function Sidebar() {
  const collapsed = useSettingsStore((s) => s.settings.sidebarCollapsed);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <aside
      className={cn(
        "algo-sidebar-backdrop relative flex h-full shrink-0 flex-col justify-between border-r border-[var(--border-subtle)] transition-[width] duration-200 select-none",
        collapsed ? "w-[72px]" : "w-[228px]"
      )}
    >
      <div>
        {/* Brand header */}
        <div
          data-tauri-drag-region
          className={cn(
            "flex items-center justify-between border-b border-[var(--border-subtle)]/70 transition-all",
            collapsed ? "flex-col gap-2 px-2 py-3.5" : "h-14 px-4"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-light)] shadow-[var(--surface-highlight)]">
              <IconCode size={18} stroke={2.2} />
            </div>
            {!collapsed && (
              <span className="text-[17px] font-bold tracking-tight text-[var(--text-primary)] truncate">
                Algo<span className="text-[var(--accent-light)]">Java</span>
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => void updateSettings({ sidebarCollapsed: !collapsed })}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)] transition-colors cursor-pointer"
          >
            {collapsed ? (
              <IconChevronRight size={15} />
            ) : (
              <IconChevronLeft size={15} />
            )}
          </button>
        </div>

        {/* Navigation links */}
        <nav aria-label="Primary navigation" className="flex flex-col gap-1 px-3 pt-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[13.5px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)]",
                  collapsed ? "justify-center px-2 py-2.5" : "",
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--text-primary)] border border-[var(--accent-border)]/70 shadow-[var(--surface-highlight)]"
                    : "text-[var(--text-secondary)] border border-transparent hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !collapsed && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--accent-primary)]"
                    />
                  )}
                  <Icon
                    size={18}
                    stroke={isActive ? 2 : 1.75}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-[var(--accent-light)]"
                        : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                    )}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Java Emblem */}
      <div
        className={cn(
          "mx-3 mb-4 flex flex-col items-center border-t border-[var(--border-subtle)]/80 pt-4 text-center",
          collapsed ? "mx-2 pt-3" : "px-2"
        )}
      >
        <JavaCupEmblem className={collapsed ? "w-8 h-8" : "w-12 h-12"} />
        {!collapsed && (
          <>
            <span className="mt-1 text-xs font-semibold tracking-wide text-[var(--text-primary)]">
              Java
            </span>
            <span className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              Practice. Improve. Excel.
            </span>
          </>
        )}
      </div>
    </aside>
  );
}
