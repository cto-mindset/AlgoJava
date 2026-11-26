import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  IconArrowRight,
  IconChartBar,
  IconCheck,
  IconClock,
  IconCode,
  IconCoffee,
  IconFlame,
  IconLayersSubtract,
  IconPlayerPlay,
  IconRefresh,
  IconSparkles,
  IconTrophy,
} from "@tabler/icons-react";
import {
  Badge,
  Button,
  CircularProgress,
  ErrorState,
  LoadingState,
  ProgressBar,
  SectionHeader,
} from "@/components/ui";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { getDashboardData } from "@/lib/db/progressRepository";
import { formatNativeError } from "@/lib/tauri/env";
import {
  formatRelativeTimestamp,
  resolveEditorFontCss,
} from "@/lib/utils/format";
import { useJavaRuntimeStore } from "@/stores/javaRuntimeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { DashboardData } from "@/types/models";

const JAVA_CRAFT_TIPS = [
  {
    title: "Think in Boundaries",
    body: "Validate empty arrays, zero, negative values, and single-element inputs before optimizing loops.",
  },
  {
    title: "Use StringBuilder in Loops",
    body: "Avoid O(n^2) string concatenation inside loops; accumulate characters with StringBuilder for clean O(n) time.",
  },
  {
    title: "Trade Space for O(1) Lookups",
    body: "When nested loops search for complements or frequencies, a HashMap or HashSet often cuts time from O(n^2) to O(n).",
  },
  {
    title: "Watch Integer Overflow",
    body: "Use `long` for intermediate sums or products, and compute midpoints as `left + (right - left) / 2`.",
  },
  {
    title: "Keep Methods Pure & Readable",
    body: "Early returns simplify nested conditionals and make edge-case handling immediately obvious when reviewing.",
  },
];

function formatSlugToTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSlugToMethodName(slug: string): string {
  const parts = slug.split("-").filter(Boolean);
  if (parts.length === 0) return "solve";
  return parts
    .map((part, idx) =>
      idx === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join("");
}

export function DashboardPage() {
  const navigate = useNavigate();
  const userName = useSettingsStore((s) => s.settings.userName || "Developer");
  const editorFontFamily = useSettingsStore((s) => s.settings.editorFontFamily);
  const jdkInfo = useJavaRuntimeStore((s) => s.jdkInfo);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(
    () => new Date().getDate() % JAVA_CRAFT_TIPS.length
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      setError(formatNativeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) return <LoadingState label="Loading your Java workspace..." />;
  if (error) return <ErrorState message={error} onRetry={() => void loadData()} />;
  if (!data) return null;

  const featuredCategories = data.categories.filter((c) => c.isFeatured).slice(0, 6);
  const currentTip = JAVA_CRAFT_TIPS[tipIndex];
  const nextSlug = data.nextRecommendedSlug;
  const nextTitle = nextSlug ? formatSlugToTitle(nextSlug) : "Browse Problem Catalog";
  const nextMethod = nextSlug ? formatSlugToMethodName(nextSlug) : "solve";

  const handleStartPracticing = () => {
    if (nextSlug) {
      navigate(`/problems/${nextSlug}`);
    } else {
      navigate("/problems");
    }
  };

  return (
    <div className="mx-auto max-w-[1340px] space-y-5 p-6">
      {/* Architectural Studio Hero */}
      <section className="algo-surface relative overflow-hidden px-7 py-7 lg:px-8 lg:py-8">
        {/* Background dot-grid and ambient lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 algo-hero-grid opacity-80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "var(--hero-orb-primary)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-24 -bottom-24 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "var(--hero-orb-secondary)" }}
        />

        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-4">
            {/* Live status pill strip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)]/70 bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-light)]">
                <IconCode size={13} />
                <span>Offline Java Studio</span>
              </span>

              {jdkInfo?.detected ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--status-success-border)] bg-[var(--status-success-soft)] px-2.5 py-1 text-xs font-medium text-[var(--status-success)]">
                  <IconCoffee size={13} />
                  <span>JDK {jdkInfo.version ?? jdkInfo.majorVersion}</span>
                </span>
              ) : jdkInfo ? (
                <Link
                  to="/settings?tab=runtime"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--status-warning-border)] bg-[var(--status-warning-soft)] px-2.5 py-1 text-xs font-medium text-[var(--status-warning)] hover:opacity-90 transition-opacity"
                >
                  <IconCoffee size={13} />
                  <span>Setup JDK</span>
                </Link>
              ) : null}

              <span className="algo-tabular inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
                {data.solvedProblems}/{data.totalProblems} solved
              </span>
            </div>

            <h1 className="text-3xl sm:text-[42px] font-bold tracking-[-0.03em] leading-[1.08] text-[var(--text-primary)]">
              Welcome back,
              <br />
              <span className="algo-accent-text">{userName}!</span>
            </h1>

            <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] max-w-md">
              Build lasting algorithmic fluency with fast local compilation,
              instant test feedback, and clean Java craftsmanship.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<IconPlayerPlay size={16} />}
                onClick={handleStartPracticing}
              >
                Start Practicing
              </Button>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<IconChartBar size={16} />}
                onClick={() => navigate("/progress")}
              >
                View Progress
              </Button>
            </div>
          </div>

          {/* Interactive Floating Solution.java Up-Next Card */}
          <div className="hidden lg:block w-[370px] xl:w-[405px] shrink-0">
            <div className="relative">
              {/* Subtle rotated depth backdrop card */}
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-2 translate-y-2 -rotate-2 rounded-[var(--radius-md)] border border-[var(--accent-border)]/40 bg-[var(--accent-soft)] opacity-60"
              />

              <div className="algo-code-stage relative overflow-hidden">
                {/* Editor tab header */}
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3.5 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/85" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/85" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/85" />
                  </div>
                  <span className="rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[var(--text-secondary)]">
                    Solution.java
                  </span>
                  <Badge tone="accent" className="text-[10.5px] py-0.5 px-2">
                    Java
                  </Badge>
                </div>

                {/* Syntax-highlighted preview */}
                <div
                  className="px-4 py-3 text-[12px] leading-[1.65]"
                  style={{ fontFamily: resolveEditorFontCss(editorFontFamily) }}
                >
                  <div className="flex gap-3">
                    <span className="algo-tabular select-none text-[var(--text-muted)] w-3 text-right">
                      1
                    </span>
                    <div className="truncate">
                      <span style={{ color: "var(--code-keyword)" }}>
                        public class
                      </span>{" "}
                      <span style={{ color: "var(--code-type)" }}>Solution</span>{" "}
                      <span style={{ color: "var(--code-text)" }}>{"{"}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="algo-tabular select-none text-[var(--text-muted)] w-3 text-right">
                      2
                    </span>
                    <div className="truncate pl-3">
                      <span style={{ color: "var(--code-keyword)" }}>
                        public int
                      </span>{" "}
                      <span style={{ color: "var(--code-fn)" }}>
                        {nextMethod}
                      </span>
                      <span style={{ color: "var(--code-text)" }}>() {"{"}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-[4px] bg-[var(--accent-soft)]/70 -mx-2 px-2">
                    <span className="algo-tabular select-none font-semibold text-[var(--accent-light)] w-3 text-right">
                      3
                    </span>
                    <div className="truncate pl-6">
                      <span style={{ color: "var(--code-keyword)" }}>
                        return
                      </span>{" "}
                      <span style={{ color: "var(--code-string)" }}>
                        /* ready to solve */
                      </span>
                      <span style={{ color: "var(--code-text)" }}>;</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="algo-tabular select-none text-[var(--text-muted)] w-3 text-right">
                      4
                    </span>
                    <span
                      className="pl-3"
                      style={{ color: "var(--code-text)" }}
                    >
                      {"}"}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="algo-tabular select-none text-[var(--text-muted)] w-3 text-right">
                      5
                    </span>
                    <span style={{ color: "var(--code-text)" }}>{"}"}</span>
                  </div>
                </div>

                {/* Interactive Up-Next Launch Bar */}
                <button
                  type="button"
                  onClick={handleStartPracticing}
                  className="group flex w-full items-center justify-between gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--accent-light)]">
                      Up Next
                    </div>
                    <div className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                      {nextTitle}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-xs)] bg-[var(--accent-primary)] px-2.5 py-1 text-xs font-medium text-[var(--text-on-accent)] transition-transform duration-150 group-hover:translate-x-0.5">
                    <span>Open</span>
                    <IconArrowRight size={13} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main 12-Column Bento Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: Problem Categories Bento (8 cols on xl, 7 on lg) */}
        <section className="algo-surface p-5 lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <SectionHeader
            icon={<IconLayersSubtract size={18} />}
            title="Problem Categories"
            subtitle="Explore curated Java tracks"
            action={
              <Link
                to="/problems"
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-light)] hover:underline"
              >
                <span>Browse All</span>
                <IconArrowRight size={14} />
              </Link>
            }
          />

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {featuredCategories.map((cat) => {
              const pct =
                cat.totalProblems > 0
                  ? Math.round((cat.solvedProblems / cat.totalProblems) * 100)
                  : 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigate(`/problems?category=${cat.id}`)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)] cursor-pointer"
                >
                  {/* Hover radial accent wash */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle at 100% 0%, ${cat.accentColor}22, transparent 62%)`,
                    }}
                  />

                  {/* Oversized ghost watermark icon */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -bottom-2 opacity-[0.06] transition-all duration-300 group-hover:opacity-[0.14] group-hover:scale-110"
                  >
                    <CategoryIcon
                      icon={cat.icon}
                      color={cat.accentColor}
                      size={76}
                    />
                  </div>

                  <div className="relative z-10">
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border"
                        style={{
                          backgroundColor: `${cat.accentColor}1a`,
                          borderColor: `${cat.accentColor}38`,
                        }}
                      >
                        <CategoryIcon
                          icon={cat.icon}
                          color={cat.accentColor}
                          size={18}
                        />
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-muted)] transition-all duration-150 group-hover:translate-x-0.5 group-hover:border-transparent group-hover:bg-[var(--accent-primary)] group-hover:text-white">
                        <IconArrowRight size={13} />
                      </span>
                    </div>
                    <h3 className="text-[14.5px] font-semibold text-[var(--text-primary)]">
                      {cat.name}
                    </h3>
                    <p className="mt-0.5 text-[12.5px] text-[var(--text-secondary)] line-clamp-1">
                      {cat.description}
                    </p>
                  </div>

                  <div className="relative z-10 mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="algo-tabular font-medium text-[var(--text-secondary)]">
                        {cat.solvedProblems} / {cat.totalProblems}
                      </span>
                      <span className="algo-tabular text-[11px] font-medium text-[var(--text-muted)]">
                        {pct}%
                      </span>
                    </div>
                    <ProgressBar
                      value={cat.solvedProblems}
                      max={cat.totalProblems}
                      color={cat.accentColor}
                      heightClassName="h-1.5"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right: Mastery Ring + Stat Tiles + Java Craft Tip (4 cols on xl, 5 on lg) */}
        <div className="flex flex-col gap-4 lg:col-span-5 xl:col-span-4">
          <section className="algo-surface p-5 flex-1 flex flex-col justify-between gap-4">
            <SectionHeader
              icon={<IconTrophy size={18} className="text-[var(--status-warning)]" />}
              title="Your Stats"
              subtitle="Live local workspace metrics"
            />

            <div className="flex justify-center py-1">
              <CircularProgress percentage={data.overallPercentage} size={122} />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-3 text-center">
                <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--status-success-soft)] text-[var(--status-success)]">
                  <IconCheck size={14} />
                </div>
                <div className="algo-tabular text-base font-bold text-[var(--text-primary)]">
                  {data.solvedProblems}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Solved
                </div>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-3 text-center">
                <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-light)]">
                  <IconPlayerPlay size={13} />
                </div>
                <div className="algo-tabular text-base font-bold text-[var(--text-primary)]">
                  {data.totalAttempts}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Attempts
                </div>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-3 text-center">
                <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--status-warning-soft)] text-[var(--status-warning)]">
                  <IconFlame size={14} />
                </div>
                <div className="algo-tabular text-base font-bold text-[var(--text-primary)]">
                  {data.currentStreakDays}d
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Streak
                </div>
              </div>
            </div>
          </section>

          {/* Java Craft Tip Card */}
          <section className="algo-surface relative overflow-hidden border-l-2 border-l-[var(--accent-primary)] p-4.5">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)]/70 bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent-light)]">
                <IconSparkles size={12} />
                <span>Java Craft</span>
              </span>
              <button
                type="button"
                aria-label="Next Java tip"
                title="Next Java tip"
                onClick={() =>
                  setTipIndex((prev) => (prev + 1) % JAVA_CRAFT_TIPS.length)
                }
                className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <IconRefresh size={14} />
              </button>
            </div>
            <h3 className="mt-2.5 text-[13.5px] font-semibold text-[var(--text-primary)]">
              {currentTip.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              {currentTip.body}
            </p>
          </section>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <section className="algo-surface p-5">
        <SectionHeader
          icon={<IconClock size={18} />}
          title="Recent Activity"
          action={
            <Link
              to="/progress"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-light)] hover:underline"
            >
              <span>View All</span>
              <IconArrowRight size={14} />
            </Link>
          }
        />

        {data.recentActivity.length === 0 ? (
          <div className="mt-4 flex flex-col gap-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-light)]">
                <IconCode size={22} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  No activity yet
                </h3>
                <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">
                  Start solving problems to see your activity here.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)]">
                <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-input)] px-2.5 py-1">
                  1. Pick
                </span>
                <IconArrowRight size={12} />
                <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-input)] px-2.5 py-1">
                  2. Run Java
                </span>
                <IconArrowRight size={12} />
                <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-input)] px-2.5 py-1">
                  3. Pass Tests
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<IconPlayerPlay size={14} />}
                onClick={handleStartPracticing}
              >
                Solve First Problem
              </Button>
            </div>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--border-subtle)]">
            {data.recentActivity.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/problems/${item.problemSlug}`)}
                  className="flex w-full items-center justify-between gap-4 py-2.5 px-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-surface-hover)] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      tone={item.status === "passed" ? "success" : "warning"}
                      className="shrink-0"
                    >
                      {item.status === "passed" ? "Passed" : "Attempted"}
                    </Badge>
                    <span className="truncate text-[13.5px] font-medium text-[var(--text-primary)]">
                      {item.problemTitle}
                    </span>
                    <span className="hidden sm:inline-flex shrink-0 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
                      {item.categoryName}
                    </span>
                  </div>
                  <div className="algo-tabular flex items-center gap-3 shrink-0 text-xs text-[var(--text-muted)]">
                    <span>
                      {item.passedCount}/{item.totalCount} tests
                    </span>
                    <span className="hidden md:inline rounded-[var(--radius-xs)] bg-[var(--bg-input)] px-1.5 py-0.5 text-[11px]">
                      {item.executionTimeMs} ms
                    </span>
                    <span>{formatRelativeTimestamp(item.submittedAt)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
