import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  IconAward,
  IconBolt,
  IconChartBar,
  IconCheck,
  IconClock,
  IconCode,
  IconFlame,
  IconLayersSubtract,
  IconPlayerPlay,
  IconTargetArrow,
  IconTrophy,
} from "@tabler/icons-react";
import {
  Badge,
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
  SectionHeader,
} from "@/components/ui";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { ProgressHeroArtwork } from "@/components/shared/Illustrations";
import { getProgressPageData } from "@/lib/db/progressRepository";
import { formatNativeError } from "@/lib/tauri/env";
import { formatDurationMs, formatRelativeTimestamp } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { AchievementItem, ProgressPageData } from "@/types/models";

export function ProgressPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ProgressPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
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

  if (loading) return <LoadingState label="Computing progress metrics..." />;
  if (error) return <ErrorState message={error} onRetry={() => void loadProgress()} />;
  if (!data) return null;

  const visibleCategories = showAllCategories
    ? data.categories
    : data.categories.slice(0, 6);

  const maxDailyAttempts = Math.max(
    1,
    ...data.dailyHistory.map((d) => d.attempts)
  );

  return (
    <div className="mx-auto max-w-[1280px] space-y-5 p-6">
      {/* Header Hero + 4 KPI Cards */}
      <section className="algo-surface algo-hero-backdrop p-6 space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-light)]">
                <IconChartBar size={22} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Your <span className="algo-accent-text">Progress</span>
              </h1>
            </div>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              Track your journey and see how much you've improved.
            </p>
          </div>
          <div className="hidden md:block">
            <ProgressHeroArtwork />
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="algo-surface-elevated p-4 flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--status-success-soft)] text-[var(--status-success)]">
              <IconCheck size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold text-[var(--text-primary)]">
                  {data.solvedProblems}
                </span>
                {data.weeklySolvedDelta > 0 && (
                  <span className="text-xs font-semibold text-[var(--status-success)]">
                    +{data.weeklySolvedDelta} 7d
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Solved Problems
              </p>
            </div>
          </div>

          <div className="algo-surface-elevated p-4 flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-light)]">
              <IconPlayerPlay size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold text-[var(--text-primary)]">
                  {data.totalAttempts}
                </span>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {data.successRate}% pass rate
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Total Attempts
              </p>
            </div>
          </div>

          <div className="algo-surface-elevated p-4 flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--status-warning-soft)] text-[var(--status-warning)]">
              <IconTargetArrow size={22} />
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold text-[var(--text-primary)]">
                  {data.overallPercentage}%
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {data.solvedProblems}/{data.totalProblems}
                </span>
              </div>
              <ProgressBar
                value={data.overallPercentage}
                max={100}
                heightClassName="h-1.5"
              />
              <p className="text-xs text-[var(--text-secondary)]">
                Overall Progress
              </p>
            </div>
          </div>

          <div className="algo-surface-elevated p-4 flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--status-info-soft)] text-[var(--status-info)]">
              <IconFlame size={21} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold text-[var(--text-primary)]">
                  {data.currentStreakDays}d
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {formatDurationMs(data.totalExecutionTimeMs)}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Streak &amp; Runtime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Progress + Achievements */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Progress by Category (7 cols) */}
        <section className="algo-surface p-5 lg:col-span-7 flex flex-col gap-4">
          <SectionHeader
            icon={<IconLayersSubtract size={18} />}
            title="Progress by Category"
            action={
              <button
                type="button"
                onClick={() => setShowAllCategories((prev) => !prev)}
                className="text-xs font-medium text-[var(--accent-light)] hover:underline cursor-pointer"
              >
                {showAllCategories ? "Show Featured" : "View All →"}
              </button>
            }
          />

          <div className="space-y-3.5">
            {visibleCategories.map((cat) => {
              const pct =
                cat.totalProblems > 0
                  ? Math.round((cat.solvedProblems / cat.totalProblems) * 100)
                  : 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigate(`/problems?category=${cat.id}`)}
                  className="grid w-full grid-cols-12 items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1.5 text-left hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                >
                  <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                    <CategoryIcon icon={cat.icon} color={cat.accentColor} size={17} />
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="col-span-2 text-right text-xs font-medium text-[var(--text-secondary)]">
                    {cat.solvedProblems} / {cat.totalProblems}
                  </div>
                  <div className="col-span-4">
                    <ProgressBar
                      value={cat.solvedProblems}
                      max={cat.totalProblems}
                      color={cat.accentColor}
                      heightClassName="h-2.5"
                    />
                  </div>
                  <div className="col-span-2 text-right text-xs font-semibold text-[var(--text-primary)]">
                    {pct}%
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Achievements (5 cols) */}
        <section className="algo-surface p-5 lg:col-span-5 flex flex-col gap-4">
          <SectionHeader
            icon={<IconTrophy size={18} className="text-[var(--status-warning)]" />}
            title="Achievements"
            action={
              <button
                type="button"
                onClick={() => setAchievementsModalOpen(true)}
                className="text-xs font-medium text-[var(--accent-light)] hover:underline cursor-pointer"
              >
                View All →
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

      {/* Bottom Row: Recent Activity + 14-Day Activity History & Keep Going */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section className="algo-surface p-5 lg:col-span-7 flex flex-col gap-3">
          <SectionHeader
            icon={<IconClock size={18} />}
            title="Recent Activity"
            subtitle="Your latest Java test submissions"
          />

          {data.recentActivity.length === 0 ? (
            <EmptyState
              icon={<IconCode size={22} />}
              title="No submissions recorded"
              description="Submit solutions in the problem editor to track attempts, pass rates, and runtime."
            />
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)]">
              {data.recentActivity.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/problems/${item.problemSlug}`)}
                    className="flex w-full items-center justify-between gap-3 py-2.5 px-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-surface-hover)] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={
                          item.status === "passed"
                            ? "flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[var(--status-success-soft)] text-[var(--status-success)]"
                            : "flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[var(--status-warning-soft)] text-[var(--status-warning)]"
                        }
                      >
                        {item.status === "passed" ? (
                          <IconCheck size={13} />
                        ) : (
                          <IconPlayerPlay size={12} />
                        )}
                      </span>
                      <span className="truncate text-sm text-[var(--text-primary)]">
                        <span className="font-semibold">
                          {item.status === "passed" ? "Solved:" : "Tried:"}
                        </span>{" "}
                        {item.problemTitle}{" "}
                        <span className="text-[var(--text-secondary)]">
                          ({item.categoryName})
                        </span>
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--text-muted)]">
                      {formatRelativeTimestamp(item.submittedAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* 14-day activity chart */}
          <section className="algo-surface p-5">
            <SectionHeader
              icon={<IconBolt size={17} />}
              title="14-Day Activity History"
              subtitle="Daily submission volume"
            />
            <div className="mt-4 flex h-24 items-end gap-1.5">
              {data.dailyHistory.map((day) => {
                const heightPct =
                  day.attempts === 0
                    ? 8
                    : Math.max(18, Math.round((day.attempts / maxDailyAttempts) * 100));
                return (
                  <div
                    key={day.date}
                    title={`${day.label}: ${day.attempts} attempt(s), ${day.passed} passed`}
                    className="flex flex-1 flex-col items-center justify-end gap-1 h-full"
                  >
                    <div
                      className={cn(
                        "w-full rounded-t-[4px] transition-all",
                        day.attempts > 0
                          ? "bg-[var(--accent-primary)]"
                          : "bg-[var(--track-bg)]"
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-[var(--text-muted)]">
              <span>{data.dailyHistory[0]?.label}</span>
              <span>Today</span>
            </div>
          </section>

          {/* Keep Going CTA */}
          <section className="algo-surface algo-hero-backdrop p-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Keep Going!
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                Consistent daily Java practice builds lasting problem-solving fluency.
              </p>
              <div className="mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<IconPlayerPlay size={14} />}
                  onClick={() => navigate("/problems")}
                >
                  Practice More
                </Button>
              </div>
            </div>
          </section>
        </div>
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
        "algo-surface-elevated flex flex-col items-center justify-between p-3.5 text-center transition-opacity",
        !achievement.unlocked && "opacity-70"
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
        <h4 className="text-xs font-semibold text-[var(--text-primary)]">
          {achievement.title}
        </h4>
        <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]">
          {achievement.description}
        </p>
      </div>
      <div className="mt-2.5 w-full space-y-1">
        {achievement.unlocked ? (
          <Badge tone="success" className="text-[10px]">
            Unlocked
          </Badge>
        ) : (
          <span className="text-[10px] font-medium text-[var(--text-muted)]">
            {achievement.currentValue} / {achievement.targetValue}
          </span>
        )}
        {detailed && (
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
