import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  IconArrowRight,
  IconAward,
  IconBolt,
  IconChartBar,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconCode,
  IconFlame,
  IconLayersSubtract,
  IconPlayerPlay,
  IconTrophy,
} from "@tabler/icons-react";
import {
  Badge,
  Button,
  CircularProgress,
  Dialog,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
  SectionHeader,
} from "@/components/ui";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { getProgressPageData } from "@/lib/db/progressRepository";
import { formatNativeError } from "@/lib/tauri/env";
import { formatDurationMs, formatRelativeTimestamp } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { AchievementItem, ProgressPageData } from "@/types/models";

type CategorySortMode = "default" | "progress";

export function ProgressPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ProgressPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categorySort, setCategorySort] = useState<CategorySortMode>("default");
  const [hoveredDayDate, setHoveredDayDate] = useState<string | null>(null);
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProgressPageData();
      setData(res);
    } catch (err) {
      setError(formatNativeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const metrics = useMemo(() => {
    if (!data) return null;

    const unlockedAchievementsCount = data.achievements.filter(
      (a) => a.unlocked
    ).length;

    const completedCategoriesCount = data.categories.filter(
      (c) => c.totalProblems > 0 && c.solvedProblems >= c.totalProblems
    ).length;

    const total14DayAttempts = data.dailyHistory.reduce(
      (sum, d) => sum + d.attempts,
      0
    );
    const total14DayPassed = data.dailyHistory.reduce(
      (sum, d) => sum + d.passed,
      0
    );
    const maxDailyAttempts = Math.max(
      1,
      ...data.dailyHistory.map((d) => d.attempts)
    );
    const activeDay =
      (hoveredDayDate
        ? data.dailyHistory.find((d) => d.date === hoveredDayDate)
        : undefined) ??
      data.dailyHistory[data.dailyHistory.length - 1] ??
      null;

    const sortedCategories =
      categorySort === "progress"
        ? [...data.categories].sort((a, b) => {
            const pctA =
              a.totalProblems > 0 ? a.solvedProblems / a.totalProblems : 1;
            const pctB =
              b.totalProblems > 0 ? b.solvedProblems / b.totalProblems : 1;
            if (pctA !== pctB) return pctA - pctB;
            return a.sortOrder - b.sortOrder;
          })
        : data.categories;

    const visibleCategories = showAllCategories
      ? sortedCategories
      : sortedCategories.slice(0, 6);

    const midIndex = Math.floor(data.dailyHistory.length / 2);

    return {
      unlockedAchievementsCount,
      completedCategoriesCount,
      total14DayAttempts,
      total14DayPassed,
      maxDailyAttempts,
      activeDay,
      visibleCategories,
      midLabel: data.dailyHistory[midIndex]?.label ?? "",
    };
  }, [data, hoveredDayDate, categorySort, showAllCategories]);

  if (loading) return <LoadingState label="Computing progress metrics..." />;
  if (error) return <ErrorState message={error} onRetry={() => void loadProgress()} />;
  if (!data || !metrics) return null;

  return (
    <div className="mx-auto max-w-[1340px] space-y-5 p-6">
      {/* Architectural Analytics Hero */}
      <section className="algo-surface relative overflow-hidden p-6 lg:p-7">
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

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">
                <IconChartBar size={12} />
                <span>Progress &amp; Analytics</span>
              </Badge>
              <span className="algo-tabular inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] px-2.5 py-0.5 text-[11.5px] font-medium text-[var(--text-secondary)]">
                {metrics.unlockedAchievementsCount}/{data.achievements.length}{" "}
                achievements
              </span>
              <span className="algo-tabular inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] px-2.5 py-0.5 text-[11.5px] font-medium text-[var(--text-secondary)]">
                {metrics.completedCategoriesCount}/{data.categories.length}{" "}
                topics complete
              </span>
            </div>

            <h1 className="text-3xl sm:text-[38px] font-bold tracking-[-0.03em] leading-[1.1] text-[var(--text-primary)]">
              Your <span className="algo-accent-text">Progress</span>
            </h1>

            <p className="text-[14.5px] leading-relaxed text-[var(--text-secondary)]">
              You have solved{" "}
              <strong className="algo-tabular text-[var(--text-primary)]">
                {data.solvedProblems}
              </strong>{" "}
              of{" "}
              <strong className="algo-tabular text-[var(--text-primary)]">
                {data.totalProblems}
              </strong>{" "}
              Java challenges across {data.categories.length} structured topics.
            </p>

            <div className="pt-0.5">
              <Button
                variant="primary"
                size="md"
                leftIcon={<IconPlayerPlay size={15} />}
                onClick={() => navigate("/problems")}
              >
                Continue Practicing
              </Button>
            </div>
          </div>

          <div className="algo-surface-elevated flex items-center gap-4 px-5 py-4 shrink-0 self-start md:self-auto">
            <CircularProgress
              percentage={data.overallPercentage}
              size={118}
              label="Mastery"
            />
          </div>
        </div>
      </section>

      {/* 4 Precision KPI Telemetry Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="algo-surface p-4.5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Solved Problems
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--status-success-soft)] text-[var(--status-success)]">
              <IconCheck size={16} />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="algo-tabular text-[28px] leading-none font-bold text-[var(--text-primary)]">
              {data.solvedProblems}
            </span>
            {data.weeklySolvedDelta > 0 && (
              <Badge tone="success" className="algo-tabular">
                +{data.weeklySolvedDelta} 7d
              </Badge>
            )}
          </div>
          <p className="algo-tabular text-xs text-[var(--text-muted)]">
            of {data.totalProblems} challenges
          </p>
        </div>

        <div className="algo-surface p-4.5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Total Attempts
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent-light)]">
              <IconPlayerPlay size={15} />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="algo-tabular text-[28px] leading-none font-bold text-[var(--text-primary)]">
              {data.totalAttempts}
            </span>
            <Badge tone="accent" className="algo-tabular">
              {data.successRate}% pass rate
            </Badge>
          </div>
          <p className="algo-tabular text-xs text-[var(--text-muted)]">
            {data.weeklyAttemptsDelta > 0
              ? `+${data.weeklyAttemptsDelta} in last 7 days`
              : "All recorded submissions"}
          </p>
        </div>

        <div className="algo-surface p-4.5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Current Streak
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--status-warning-soft)] text-[var(--status-warning)]">
              <IconFlame size={16} />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="algo-tabular text-[28px] leading-none font-bold text-[var(--text-primary)]">
              {data.currentStreakDays}d
            </span>
            <Badge tone={data.currentStreakDays > 0 ? "success" : "neutral"}>
              {data.currentStreakDays > 0 ? "Active" : "Start today"}
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Consecutive practice days
          </p>
        </div>

        <div className="algo-surface p-4.5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Total JVM Runtime
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--status-info-soft)] text-[var(--status-info)]">
              <IconClock size={16} />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="algo-tabular text-[28px] leading-none font-bold text-[var(--text-primary)]">
              {formatDurationMs(data.totalExecutionTimeMs)}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Cumulative local execution
          </p>
        </div>
      </div>

      {/* Analytics Row: 14-Day Dual Chart + Achievements Showcase */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Dual-Layer 14-Day Activity Chart (7 cols) */}
        <section className="algo-surface p-5 lg:col-span-7 flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionHeader
              icon={<IconBolt size={18} />}
              title="14-Day Activity"
              subtitle="Daily submission attempts vs. passed runs"
            />
            <div className="flex items-center gap-3 text-[11px] font-medium text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-[var(--accent-primary)]/45 border border-[var(--accent-border)]" />
                <span>Attempts</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-[var(--status-success)]" />
                <span>Passed</span>
              </span>
            </div>
          </div>

          {metrics.activeDay && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-3.5 py-2 text-xs">
              <span className="algo-tabular font-medium text-[var(--text-primary)]">
                {metrics.activeDay.label}: {metrics.activeDay.attempts}{" "}
                {metrics.activeDay.attempts === 1 ? "attempt" : "attempts"} ·{" "}
                {metrics.activeDay.passed} passed
              </span>
              <span className="algo-tabular text-[11px] text-[var(--text-muted)]">
                14-day total: {metrics.total14DayAttempts} attempts ·{" "}
                {metrics.total14DayPassed} passed
              </span>
            </div>
          )}

          <div>
            <div className="flex h-32 items-end gap-1.5 pt-2">
              {data.dailyHistory.map((day) => {
                const attemptHeight =
                  day.attempts === 0
                    ? 8
                    : Math.max(
                        18,
                        Math.round(
                          (day.attempts / metrics.maxDailyAttempts) * 100
                        )
                      );
                const passedRatio =
                  day.attempts > 0 ? (day.passed / day.attempts) * 100 : 0;
                const isActive = metrics.activeDay?.date === day.date;

                return (
                  <button
                    key={day.date}
                    type="button"
                    aria-label={`${day.label}: ${day.attempts} attempts, ${day.passed} passed`}
                    onMouseEnter={() => setHoveredDayDate(day.date)}
                    onFocus={() => setHoveredDayDate(day.date)}
                    onMouseLeave={() => setHoveredDayDate(null)}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end focus:outline-none cursor-pointer"
                  >
                    <div
                      className={cn(
                        "relative w-full overflow-hidden rounded-t-[5px] transition-all duration-150",
                        day.attempts > 0
                          ? "bg-[var(--accent-primary)]/40 border border-b-0 border-[var(--accent-border)]/70"
                          : "bg-[var(--track-bg)]",
                        isActive &&
                          day.attempts > 0 &&
                          "ring-1 ring-[var(--accent-light)]"
                      )}
                      style={{ height: `${attemptHeight}%` }}
                    >
                      {day.passed > 0 && (
                        <div
                          className="absolute inset-x-0 bottom-0 rounded-t-[4px] bg-[var(--status-success)]/85 transition-all duration-200"
                          style={{ height: `${passedRatio}%` }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <span>{data.dailyHistory[0]?.label}</span>
              {data.dailyHistory.length > 2 && (
                <span>{metrics.midLabel}</span>
              )}
              <span>Today</span>
            </div>
          </div>
        </section>

        {/* Achievements Showcase (5 cols) */}
        <section className="algo-surface p-5 lg:col-span-5 flex flex-col justify-between gap-4">
          <SectionHeader
            icon={<IconTrophy size={18} className="text-[var(--status-warning)]" />}
            title="Achievements"
            subtitle="Milestones earned from local solves"
            action={
              <button
                type="button"
                onClick={() => setAchievementsModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-light)] hover:underline cursor-pointer"
              >
                <span>View All</span>
                <IconArrowRight size={13} />
              </button>
            }
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {data.achievements.slice(0, 3).map((ach) => (
              <AchievementCard key={ach.id} achievement={ach} />
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Row: Category Mastery Matrix + Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Category Mastery Matrix (7 cols) */}
        <section className="algo-surface p-5 lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeader
              icon={<IconLayersSubtract size={18} />}
              title="Progress by Category"
              subtitle="Click any topic to practice remaining problems"
            />
            <div className="flex items-center gap-2">
              <div
                role="group"
                aria-label="Sort categories"
                className="inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-input)] p-0.5 gap-0.5"
              >
                <button
                  type="button"
                  aria-pressed={categorySort === "default"}
                  onClick={() => setCategorySort("default")}
                  className={cn(
                    "h-full rounded-[6px] px-2.5 text-[11.5px] font-medium transition-colors cursor-pointer",
                    categorySort === "default"
                      ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  Order
                </button>
                <button
                  type="button"
                  aria-pressed={categorySort === "progress"}
                  onClick={() => setCategorySort("progress")}
                  className={cn(
                    "h-full rounded-[6px] px-2.5 text-[11.5px] font-medium transition-colors cursor-pointer",
                    categorySort === "progress"
                      ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  Needs Focus
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAllCategories((prev) => !prev)}
                className="text-xs font-medium text-[var(--accent-light)] hover:underline cursor-pointer"
              >
                {showAllCategories ? "Show Featured" : "All Topics →"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {metrics.visibleCategories.map((cat) => {
              const pct =
                cat.totalProblems > 0
                  ? Math.round((cat.solvedProblems / cat.totalProblems) * 100)
                  : 0;
              const remaining = Math.max(
                0,
                cat.totalProblems - cat.solvedProblems
              );

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigate(`/problems?category=${cat.id}`)}
                  className="group grid w-full grid-cols-12 items-center gap-3 rounded-[var(--radius-sm)] border border-transparent px-3 py-2.5 text-left hover:border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer"
                >
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-xs)] border"
                      style={{
                        backgroundColor: `${cat.accentColor}16`,
                        borderColor: `${cat.accentColor}30`,
                      }}
                    >
                      <CategoryIcon
                        icon={cat.icon}
                        color={cat.accentColor}
                        size={16}
                      />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-[var(--text-primary)] truncate">
                        {cat.name}
                      </div>
                      <div className="algo-tabular text-[11px] text-[var(--text-muted)]">
                        {remaining === 0 ? "Completed" : `${remaining} left`}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 sm:col-span-5">
                    <ProgressBar
                      value={cat.solvedProblems}
                      max={cat.totalProblems}
                      color={cat.accentColor}
                      heightClassName="h-2"
                    />
                  </div>

                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <span className="algo-tabular hidden sm:inline text-xs text-[var(--text-secondary)]">
                      {cat.solvedProblems} / {cat.totalProblems}
                    </span>
                    <span className="algo-tabular w-9 text-right text-xs font-semibold text-[var(--text-primary)]">
                      {pct}%
                    </span>
                    <IconChevronRight
                      size={14}
                      className="text-[var(--text-muted)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent Submissions Timeline (5 cols) */}
        <section className="algo-surface p-5 lg:col-span-5 flex flex-col gap-3">
          <SectionHeader
            icon={<IconClock size={18} />}
            title="Recent Activity"
            subtitle="Latest Java test submissions"
            action={
              <button
                type="button"
                onClick={() => navigate("/problems")}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-light)] hover:underline cursor-pointer"
              >
                <span>Practice</span>
                <IconArrowRight size={13} />
              </button>
            }
          />

          {data.recentActivity.length === 0 ? (
            <EmptyState
              icon={<IconCode size={22} />}
              title="No submissions recorded"
              description="Submit solutions in the problem editor to track attempts, pass rates, and runtime."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<IconPlayerPlay size={14} />}
                  onClick={() => navigate("/problems")}
                >
                  Open Problems
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)]">
              {data.recentActivity.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/problems/${item.problemSlug}`)}
                    className="flex w-full items-center justify-between gap-3 py-2.5 px-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-surface-hover)] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Badge
                        tone={item.status === "passed" ? "success" : "warning"}
                        className="shrink-0"
                      >
                        {item.status === "passed" ? "Passed" : "Tried"}
                      </Badge>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                          {item.problemTitle}
                        </div>
                        <div className="algo-tabular text-[11px] text-[var(--text-muted)]">
                          {item.categoryName} · {item.passedCount}/
                          {item.totalCount} · {item.executionTimeMs} ms
                        </div>
                      </div>
                    </div>
                    <span className="algo-tabular shrink-0 text-[11.5px] text-[var(--text-muted)]">
                      {formatRelativeTimestamp(item.submittedAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Achievements Dialog */}
      <Dialog
        open={achievementsModalOpen}
        onClose={() => setAchievementsModalOpen(false)}
        title="All Achievements"
        description="Unlocked automatically from your local SQLite submission history."
        maxWidthClass="max-w-2xl"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.achievements.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} detailed />
          ))}
        </div>
      </Dialog>
    </div>
  );
}

function AchievementCard({
  achievement,
  detailed = false,
}: {
  achievement: AchievementItem;
  detailed?: boolean;
}) {
  const toneColor =
    achievement.tone === "emerald"
      ? "text-[var(--status-success)] bg-[var(--status-success-soft)] border-[var(--status-success-border)]"
      : achievement.tone === "amber"
      ? "text-[var(--status-warning)] bg-[var(--status-warning-soft)] border-[var(--status-warning-border)]"
      : achievement.tone === "blue"
      ? "text-[var(--status-info)] bg-[var(--status-info-soft)] border-[var(--status-info-border)]"
      : "text-[var(--accent-light)] bg-[var(--accent-soft)] border-[var(--accent-border)]";

  return (
    <div
      className={cn(
        "algo-surface-elevated flex flex-col items-center justify-between p-3.5 text-center transition-all",
        achievement.unlocked
          ? "border-[var(--accent-border)]/50"
          : "opacity-75"
      )}
    >
      <div
        className={cn(
          "mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl border",
          toneColor
        )}
      >
        <IconAward size={22} />
      </div>
      <div>
        <h4 className="text-[13px] font-semibold text-[var(--text-primary)]">
          {achievement.title}
        </h4>
        <p className="mt-1 text-[11.5px] leading-snug text-[var(--text-secondary)]">
          {achievement.description}
        </p>
      </div>
      <div className="mt-3 w-full space-y-1.5">
        {achievement.unlocked ? (
          <Badge tone="success" className="text-[10.5px]">
            Unlocked
          </Badge>
        ) : (
          <div className="space-y-1">
            <span className="algo-tabular block text-[11px] font-medium text-[var(--text-muted)]">
              {achievement.currentValue} / {achievement.targetValue}
            </span>
            <ProgressBar
              value={achievement.currentValue}
              max={achievement.targetValue}
              heightClassName="h-1"
            />
          </div>
        )}
        {detailed && achievement.unlocked && (
          <ProgressBar
            value={achievement.currentValue}
            max={achievement.targetValue}
            heightClassName="h-1"
          />
        )}
      </div>
    </div>
  );
}
