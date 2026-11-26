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
    <div className="mx-auto max-w-[1320px] space-y-5 p-6">
      {/* Hero Banner */}
      <section className="algo-surface algo-hero-backdrop relative overflow-hidden px-7 py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)]/70 bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-light)]">
              <IconCode size={13} />
              <span>Offline Java Practice Studio</span>
            </div>

            <h1 className="text-3xl sm:text-[38px] font-bold tracking-[-0.025em] leading-[1.12] text-[var(--text-primary)]">
              Welcome back,
              <br />
              <span className="algo-accent-text">{userName}!</span>
            </h1>

            <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] max-w-md">
              Sharpen your Java skills with focused algorithm challenges and track
              every solution locally.
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

          <div className="hidden lg:flex shrink-0 justify-end pr-1">
            <DashboardHeroArtwork />
          </div>
        </div>
      </section>

      {/* Main Content Grid: Categories (Left) + Stats & Quote (Right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Problem Categories (8 cols on xl, 7 on lg) */}
        <section className="algo-surface p-5 lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <SectionHeader
            icon={<IconLayersSubtract size={18} />}
            title="Problem Categories"
            subtitle="Jump directly into a core Java topic"
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
            {featuredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/problems?category=${cat.id}`)}
                className="group flex flex-col justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)] cursor-pointer"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border"
                      style={{
                        backgroundColor: `${cat.accentColor}1a`,
                        borderColor: `${cat.accentColor}38`,
                      }}
                    >
                      <CategoryIcon icon={cat.icon} color={cat.accentColor} size={18} />
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

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="algo-tabular font-medium text-[var(--text-secondary)]">
                      {cat.solvedProblems} / {cat.totalProblems}
                    </span>
                    <span className="algo-tabular text-[11px] text-[var(--text-muted)]">
                      {cat.totalProblems > 0
                        ? Math.round((cat.solvedProblems / cat.totalProblems) * 100)
                        : 0}
                      %
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

        {/* Right Column: Your Stats + Quote (4 cols on xl, 5 on lg) */}
        <div className="flex flex-col gap-4 lg:col-span-5 xl:col-span-4">
          <section className="algo-surface p-5 flex-1 flex flex-col justify-between">
            <SectionHeader
              icon={<IconTrophy size={18} className="text-[var(--status-warning)]" />}
              title="Your Stats"
            />

            <div className="my-4 flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
              <CircularProgress percentage={data.overallPercentage} size={114} />

              <div className="flex-1 w-full divide-y divide-[var(--border-subtle)]">
                <div className="flex items-center justify-between py-2 first:pt-0">
                  <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                    <IconCheck size={15} className="text-[var(--status-success)] shrink-0" />
                    <span>Solved</span>
                  </div>
                  <span className="algo-tabular text-sm font-bold text-[var(--text-primary)]">
                    {data.solvedProblems}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                    <IconPlayerPlay size={15} className="text-[var(--accent-light)] shrink-0" />
                    <span>Attempts</span>
                  </div>
                  <span className="algo-tabular text-sm font-bold text-[var(--text-primary)]">
                    {data.totalAttempts}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 last:pb-0">
                  <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                    <IconFlame size={15} className="text-[var(--status-warning)] shrink-0" />
                    <span>Streak</span>
                  </div>
                  <span className="algo-tabular text-sm font-bold text-[var(--text-primary)]">
                    {data.currentStreakDays}{" "}
                    {data.currentStreakDays === 1 ? "day" : "days"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="algo-surface border-l-2 border-l-[var(--accent-primary)] px-5 py-4 flex items-center gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent-light)]">
              <IconQuote size={18} />
            </span>
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
            action={
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<IconPlayerPlay size={14} />}
                onClick={handleStartPracticing}
              >
                Solve First Problem
              </Button>
            }
          />
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
                    <span className="truncate text-[13.5px] text-[var(--text-primary)]">
                      <span className="font-semibold">
                        {item.status === "passed" ? "Solved:" : "Attempted:"}
                      </span>{" "}
                      {item.problemTitle}{" "}
                      <span className="text-[var(--text-secondary)]">
                        ({item.categoryName})
                      </span>
                    </span>
                  </div>
                  <div className="algo-tabular flex items-center gap-3 shrink-0 text-xs text-[var(--text-muted)]">
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
