import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  IconArrowRight,
  IconChartBar,
  IconCheck,
  IconClock,
  IconCode,
  IconFlame,
  IconLayersSubtract,
  IconPlayerPlay,
  IconQuote,
  IconTrophy,
} from "@tabler/icons-react";
import {
  Button,
  CircularProgress,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
  SectionHeader,
} from "@/components/ui";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { DashboardHeroArtwork } from "@/components/shared/Illustrations";
import { getDashboardData } from "@/lib/db/progressRepository";
import { formatNativeError } from "@/lib/tauri/env";
import { formatRelativeTimestamp } from "@/lib/utils/format";
import { useSettingsStore } from "@/stores/settingsStore";
import type { DashboardData } from "@/types/models";

export function DashboardPage() {
  const navigate = useNavigate();
  const userName = useSettingsStore((s) => s.settings.userName || "Developer");

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleStartPracticing = () => {
    if (data.nextRecommendedSlug) {
      navigate(`/problems/${data.nextRecommendedSlug}`);
    } else {
      navigate("/problems");
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-5 p-6">
      {/* Hero Banner */}
      <section className="algo-surface algo-hero-backdrop relative overflow-hidden px-7 py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight leading-tight text-[var(--text-primary)]">
              Welcome back,
              <br />
              <span className="algo-accent-text">{userName}!</span>
            </h1>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Sharpen your Java skills with practice problems
              <br className="hidden sm:inline" /> and become a better developer.
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

          <div className="hidden md:flex justify-end pr-2">
            <DashboardHeroArtwork />
          </div>
        </div>
      </section>

      {/* Main Content Grid: Categories (Left) + Stats & Quote (Right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Problem Categories (7 cols) */}
        <section className="algo-surface p-5 lg:col-span-7 flex flex-col gap-4">
          <SectionHeader
            icon={<IconLayersSubtract size={18} />}
            title="Problem Categories"
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {featuredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/problems?category=${cat.id}`)}
                className="group flex flex-col justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-3.5 text-left transition-all duration-150 hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
              >
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                      <CategoryIcon icon={cat.icon} color={cat.accentColor} size={18} />
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-1">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-secondary)]">
                      {cat.solvedProblems} / {cat.totalProblems}
                    </span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-input)] text-[var(--text-secondary)] transition-colors group-hover:bg-[var(--accent-primary)] group-hover:text-white">
                      <IconArrowRight size={13} />
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
            ))}
          </div>
        </section>

        {/* Right Column: Your Stats + Quote (5 cols) */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <section className="algo-surface p-5 flex-1">
            <SectionHeader
              icon={<IconTrophy size={18} className="text-[var(--status-warning)]" />}
              title="Your Stats"
            />

            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
              <CircularProgress percentage={data.overallPercentage} />

              <div className="flex-1 w-full space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <IconCheck size={15} className="text-[var(--status-success)]" />
                    <span>Solved Problems</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {data.solvedProblems}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <IconPlayerPlay size={15} className="text-[var(--accent-light)]" />
                    <span>Total Attempts</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {data.totalAttempts}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <IconFlame size={15} className="text-orange-400" />
                    <span>Current Streak</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {data.currentStreakDays}{" "}
                    {data.currentStreakDays === 1 ? "day" : "days"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="algo-surface px-5 py-4 flex items-center gap-3.5">
            <IconQuote size={26} className="shrink-0 text-[var(--accent-light)]" />
            <div>
              <p className="text-sm italic text-[var(--text-primary)]">
                "Practice makes perfect."
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">— AlgoJava</p>
            </div>
          </section>
        </div>
      </div>

      {/* Recent Activity */}
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
          <EmptyState
            icon={<IconCode size={22} />}
            title="No activity yet"
            description="Start solving problems to see your activity here."
          />
        ) : (
          <ul className="mt-4 divide-y divide-[var(--border-subtle)]">
            {data.recentActivity.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/problems/${item.problemSlug}`)}
                  className="flex w-full items-center justify-between gap-4 py-2.5 px-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-surface-hover)] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={
                        item.status === "passed"
                          ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--status-success-soft)] text-[var(--status-success)]"
                          : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--status-warning-soft)] text-[var(--status-warning)]"
                      }
                    >
                      {item.status === "passed" ? (
                        <IconCheck size={14} />
                      ) : (
                        <IconPlayerPlay size={13} />
                      )}
                    </span>
                    <span className="truncate text-sm text-[var(--text-primary)]">
                      <span className="font-semibold">
                        {item.status === "passed" ? "Solved:" : "Attempted:"}
                      </span>{" "}
                      {item.problemTitle}{" "}
                      <span className="text-[var(--text-secondary)]">
                        ({item.categoryName})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-[var(--text-muted)]">
                    <span>
                      {item.passedCount}/{item.totalCount} tests
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
