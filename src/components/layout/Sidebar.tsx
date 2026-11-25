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
        collapsed ? "w-[74px]" : "w-[228px]"
      )}
    >
      <div>
        {/* Brand header */}
        <div
          data-tauri-drag-region
          className={cn(
            "flex items-center justify-between px-4 pt-5 pb-6",
            collapsed ? "flex-col gap-2 px-2" : ""
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-light)]">
              <IconCode size={20} stroke={2.2} />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] truncate">
                Algo<span className="text-[var(--accent-light)]">Java</span>
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => void updateSettings({ sidebarCollapsed: !collapsed })}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {collapsed ? (
              <IconChevronRight size={15} />
            ) : (
              <IconChevronLeft size={15} />
            )}
          </button>
        </div>

        {/* Navigation links */}
        <nav aria-label="Primary navigation" className="flex flex-col gap-1.5 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                  collapsed ? "justify-center px-2" : "",
                  isActive
                    ? "bg-[var(--accent-primary)]/20 text-[var(--text-primary)] border border-[var(--accent-border)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-[var(--text-secondary)] border border-transparent hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={cn(
                      "shrink-0",
                      isActive
                        ? "text-[var(--accent-light)]"
                        : "text-[var(--text-secondary)]"
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
          "flex flex-col items-center px-4 pb-6 pt-4 text-center",
          collapsed ? "px-2" : ""
        )}
      >
        <JavaCupEmblem className={collapsed ? "w-9 h-9" : "w-14 h-14"} />
        {!collapsed && (
          <>
            <span className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
              Java
            </span>
            <span className="mt-1 text-[11px] text-[var(--text-muted)]">
              Practice. Improve. Excel.
            </span>
          </>
        )}
      </div>
    </aside>
  );
}
