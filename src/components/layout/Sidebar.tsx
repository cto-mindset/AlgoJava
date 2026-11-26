import { Link, NavLink } from "react-router";
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
import { useJavaRuntimeStore } from "@/stores/javaRuntimeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const NAV_GROUPS = [
  {
    title: "Workspace",
    items: [
      { to: "/", label: "Home", icon: IconHome, end: true },
      { to: "/problems", label: "Problems", icon: IconLayoutGrid, end: false },
      { to: "/progress", label: "Progress", icon: IconChartBar, end: true },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/settings", label: "Settings", icon: IconSettings, end: true },
      { to: "/about", label: "About", icon: IconInfoCircle, end: true },
    ],
  },
];

export function Sidebar() {
  const collapsed = useSettingsStore((s) => s.settings.sidebarCollapsed);
  const userName = useSettingsStore((s) => s.settings.userName || "Developer");
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const jdkInfo = useJavaRuntimeStore((s) => s.jdkInfo);

  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("") || "D";

  const statusLink =
    jdkInfo && !jdkInfo.detected
      ? "/settings?tab=runtime"
      : "/settings?tab=appearance";

  const statusText = jdkInfo?.detected
    ? `JDK ${jdkInfo.version ?? jdkInfo.majorVersion}`
    : jdkInfo
    ? "Configure JDK"
    : "Offline Local Mode";

  const statusDotClass = jdkInfo?.detected
    ? "bg-[var(--status-success)]"
    : jdkInfo
    ? "bg-[var(--status-warning)]"
    : "bg-[var(--accent-light)]";

  return (
    <aside
      className={cn(
        "algo-sidebar-backdrop relative z-20 flex h-full shrink-0 flex-col justify-between border-r border-[var(--border-subtle)] transition-[width] duration-200 select-none",
        collapsed ? "w-[74px]" : "w-[244px]"
      )}
    >
      {/* Top: Brand + Navigation */}
      <div className={cn("flex min-h-0 flex-1 flex-col", collapsed ? "overflow-visible" : "")}>
        {/* Brand header */}
        <div
          data-tauri-drag-region
          className={cn(
            "flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)]/75 transition-all",
            collapsed ? "flex-col gap-2 px-2 py-3.5" : "h-15 px-4"
          )}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 min-w-0 rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)]"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-on-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),var(--shadow-accent)]"
              style={{ background: "var(--accent-gradient)" }}
            >
              <IconCode size={18} stroke={2.3} />
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <span className="block text-[16.5px] font-bold tracking-tight text-[var(--text-primary)] truncate">
                  Algo<span className="text-[var(--accent-light)]">Java</span>
                </span>
                <span className="block text-[10.5px] font-medium text-[var(--text-muted)] truncate">
                  Java Practice Studio
                </span>
              </div>
            )}
          </Link>

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

        {/* Navigation groups */}
        <nav
          aria-label="Primary navigation"
          className={cn(
            "flex-1 px-3 py-4 space-y-5",
            collapsed ? "overflow-visible px-2.5" : "overflow-y-auto"
          )}
        >
          {NAV_GROUPS.map((group, groupIdx) => (
            <div key={group.title} className="space-y-1">
              {!collapsed ? (
                <div className="px-3 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  {group.title}
                </div>
              ) : (
                groupIdx > 0 && (
                  <div className="mx-2 my-2 border-t border-[var(--border-subtle)]" />
                )
              )}

              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  aria-label={label}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[13.5px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)]",
                      collapsed ? "justify-center px-2 py-2.5" : "",
                      isActive
                        ? "bg-[var(--accent-soft)] font-semibold text-[var(--text-primary)] border border-[var(--accent-border)]/75 shadow-[var(--surface-highlight)]"
                        : "font-medium text-[var(--text-secondary)] border border-transparent hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--accent-primary)]"
                        />
                      )}
                      <Icon
                        size={18}
                        stroke={isActive ? 2.1 : 1.75}
                        className={cn(
                          "shrink-0 transition-colors",
                          isActive
                            ? "text-[var(--accent-light)]"
                            : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{label}</span>
                          {isActive && (
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 rounded-full bg-[var(--accent-light)]"
                            />
                          )}
                        </>
                      )}

                      {/* Floating right tooltip when sidebar is collapsed */}
                      {collapsed && (
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-[var(--radius-xs)] border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] shadow-[var(--shadow-md)] opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0"
                        >
                          {label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom: Developer + JDK Status Card & Java Emblem */}
      <div className={cn("shrink-0 space-y-3 pb-4", collapsed ? "px-2" : "px-3")}>
        <Link
          to={statusLink}
          title={collapsed ? `${userName} · ${statusText}` : undefined}
          className={cn(
            "group relative flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/85 transition-colors hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)]",
            collapsed ? "justify-center p-2" : "px-3 py-2.5"
          )}
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent-light)]">
            {initials}
            <span
              aria-hidden="true"
              className={cn(
                "absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-sidebar)]",
                statusDotClass
              )}
            />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[12.5px] font-semibold text-[var(--text-primary)]">
                {userName}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <span
                  aria-hidden="true"
                  className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusDotClass)}
                />
                <span className="truncate">{statusText}</span>
              </div>
            </div>
          )}

          {collapsed && (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-[var(--radius-xs)] border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] shadow-[var(--shadow-md)] opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0"
            >
              {userName} · {statusText}
            </span>
          )}
        </Link>

        <div
          className={cn(
            "flex items-center border-t border-[var(--border-subtle)]/80 pt-3",
            collapsed ? "justify-center" : "gap-2.5 px-1.5"
          )}
        >
          <JavaCupEmblem className={collapsed ? "w-8 h-8" : "w-9 h-9 shrink-0"} />
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <span className="block text-xs font-semibold text-[var(--text-primary)]">
                Java
              </span>
              <span className="block text-[11px] text-[var(--text-muted)] truncate">
                Practice. Improve. Excel.
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
