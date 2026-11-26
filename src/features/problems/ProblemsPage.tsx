import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  IconArrowRight,
  IconArrowsShuffle,
  IconBookmarkFilled,
  IconChartBar,
  IconCheck,
  IconChevronRight,
  IconCircle,
  IconClock,
  IconLayersSubtract,
  IconLayoutGrid,
  IconPlayerPlay,
  IconRefresh,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  ProgressBar,
} from "@/components/ui";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { getCategoriesWithProgress } from "@/lib/db/categoryRepository";
import { getProblems } from "@/lib/db/problemRepository";
import { formatNativeError } from "@/lib/tauri/env";
import { cn } from "@/lib/utils/cn";
import { useSettingsStore } from "@/stores/settingsStore";
import type { CategorySummary, Difficulty, ProblemListItem } from "@/types/models";

type DifficultyFilter = Difficulty | "All";
type StatusFilter = "all" | "unsolved" | "solved" | "bookmarked";

const DIFFICULTY_OPTIONS: Array<{
  value: DifficultyFilter;
  label: string;
  dotColor?: string;
}> = [
  { value: "All", label: "All" },
  { value: "Easy", label: "Easy", dotColor: "var(--status-success)" },
  { value: "Medium", label: "Medium", dotColor: "var(--status-warning)" },
  { value: "Hard", label: "Hard", dotColor: "var(--status-info)" },
];

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All Status" },
  { value: "unsolved", label: "Not Solved" },
  { value: "solved", label: "Solved" },
  { value: "bookmarked", label: "Bookmarked" },
];

export function ProblemsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const rememberLastCategory = useSettingsStore(
    (s) => s.settings.rememberLastCategory
  );
  const lastCategoryId = useSettingsStore((s) => s.settings.lastCategoryId);
  const showSolvedProblems = useSettingsStore(
    (s) => s.settings.showSolvedProblems
  );
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const initialCat =
    searchParams.get("category") ??
    (rememberLastCategory && lastCategoryId ? lastCategoryId : "all");

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, list] = await Promise.all([
        getCategoriesWithProgress(),
        getProblems({
          categoryId: selectedCategory,
          difficulty,
          status: statusFilter,
          search: searchQuery,
          showSolved: statusFilter === "solved" ? true : showSolvedProblems,
        }),
      ]);
      setCategories(cats);
      setProblems(list);
    } catch (err) {
      setError(formatNativeError(err));
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, difficulty, statusFilter, searchQuery, showSolvedProblems]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === "all") {
      searchParams.delete("category");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category: catId }, { replace: true });
    }
    if (rememberLastCategory) {
      void updateSettings({ lastCategoryId: catId === "all" ? null : catId });
    }
  };

  const handleResetFilters = () => {
    setDifficulty("All");
    setStatusFilter("all");
    setSearchQuery("");
    handleSelectCategory("all");
  };

  const totals = useMemo(() => {
    const total = categories.reduce((acc, c) => acc + c.totalProblems, 0);
    const solved = categories.reduce((acc, c) => acc + c.solvedProblems, 0);
    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { total, solved, percentage };
  }, [categories]);

  const activeCategory = useMemo(
    () =>
      selectedCategory === "all"
        ? null
        : categories.find((c) => c.id === selectedCategory) ?? null,
    [categories, selectedCategory]
  );

  const difficultyBreakdown = useMemo(() => {
    let easy = 0;
    let medium = 0;
    let hard = 0;
    for (const p of problems) {
      if (p.difficulty === "Easy") easy++;
      else if (p.difficulty === "Medium") medium++;
      else if (p.difficulty === "Hard") hard++;
    }
    return { easy, medium, hard };
  }, [problems]);

  const nextUnsolvedProblem = useMemo(
    () => problems.find((p) => p.status !== "solved") ?? problems[0] ?? null,
    [problems]
  );

  const hasActiveFilters =
    selectedCategory !== "all" ||
    difficulty !== "All" ||
    statusFilter !== "all" ||
    searchQuery.trim().length > 0;

  const handleRandomProblem = () => {
    if (problems.length === 0) return;
    const pool = problems.filter((p) => p.status !== "solved");
    const source = pool.length > 0 ? pool : problems;
    const picked = source[Math.floor(Math.random() * source.length)];
    if (picked) {
      navigate(`/problems/${picked.slug}`);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-[1380px] flex-col gap-4 p-5 lg:p-6">
      {/* Top Architectural Command Header */}
      <section className="algo-surface algo-hero-backdrop shrink-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-5 pb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-light)]">
              <IconLayersSubtract size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[24px] leading-tight font-bold tracking-[-0.02em] text-[var(--text-primary)]">
                  Problems
                </h1>
                <span className="algo-tabular inline-flex items-center rounded-full border border-[var(--accent-border)]/70 bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11.5px] font-medium text-[var(--accent-light)]">
                  {totals.solved}/{totals.total} solved · {totals.percentage}%
                </span>
              </div>
              <p className="mt-0.5 text-[13.5px] text-[var(--text-secondary)]">
                Sharpen your Java skills with structured offline algorithm tracks.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={!nextUnsolvedProblem}
              leftIcon={<IconPlayerPlay size={14} />}
              onClick={() =>
                nextUnsolvedProblem &&
                navigate(`/problems/${nextUnsolvedProblem.slug}`)
              }
            >
              Next Unsolved
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={problems.length === 0}
              leftIcon={<IconArrowsShuffle size={14} />}
              onClick={handleRandomProblem}
            >
              Random
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<IconChartBar size={14} />}
              onClick={() => navigate("/progress")}
            >
              Progress
            </Button>
          </div>
        </div>

        {/* Integrated Search & Filter Pill Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/80 px-5 py-3">
          <Input
            ref={searchInputRef}
            aria-label="Search problems"
            placeholder="Search problems by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && searchQuery) {
                setSearchQuery("");
              }
            }}
            leftIcon={<IconSearch size={15} />}
            rightElement={
              searchQuery ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="rounded-[var(--radius-xs)] p-0.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <IconX size={14} />
                </button>
              ) : (
                <kbd className="algo-kbd text-[10px] px-1.5 py-0">/</kbd>
              )
            }
            containerClassName="flex-1 min-w-[220px]"
          />

          {/* Difficulty Pills */}
          <div
            role="group"
            aria-label="Filter by difficulty"
            className="inline-flex h-9 items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-input)] p-0.5 gap-0.5"
          >
            {DIFFICULTY_OPTIONS.map((opt) => {
              const active = difficulty === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDifficulty(opt.value)}
                  className={cn(
                    "inline-flex h-full items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-medium transition-all cursor-pointer",
                    active
                      ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]/70"
                  )}
                >
                  {opt.dotColor && (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: active ? "#ffffff" : opt.dotColor,
                      }}
                    />
                  )}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Pills */}
          <div
            role="group"
            aria-label="Filter by status"
            className="inline-flex h-9 items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-input)] p-0.5 gap-0.5 overflow-x-auto max-w-full"
          >
            {STATUS_OPTIONS.map((opt) => {
              const active = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    "inline-flex h-full items-center rounded-[6px] px-2.5 text-xs font-medium whitespace-nowrap transition-all cursor-pointer",
                    active
                      ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-xs"
                      : "border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<IconRefresh size={13} />}
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          )}
        </div>
      </section>

      {error ? (
        <ErrorState message={error} onRetry={() => void loadCatalog()} />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left Topics Rail (3 cols) */}
          <aside className="algo-surface flex max-h-60 lg:max-h-none flex-col overflow-hidden lg:col-span-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[var(--text-primary)]">
                <IconLayoutGrid size={16} className="text-[var(--accent-light)]" />
                <span>Topics</span>
                <span className="algo-tabular rounded-full bg-[var(--bg-surface-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
                  {categories.length}
                </span>
              </div>
              {selectedCategory !== "all" && (
                <button
                  type="button"
                  onClick={() => handleSelectCategory("all")}
                  className="text-xs font-medium text-[var(--accent-light)] hover:underline cursor-pointer"
                >
                  Show All
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
              <button
                type="button"
                onClick={() => handleSelectCategory("all")}
                className={cn(
                  "relative flex w-full flex-col gap-2 rounded-[var(--radius-sm)] border px-3 py-2.5 text-left transition-all cursor-pointer",
                  selectedCategory === "all"
                    ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                    : "border-transparent hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
                )}
              >
                {selectedCategory === "all" && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--accent-primary)]"
                  />
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--accent-light)]">
                      <IconLayersSubtract size={15} />
                    </span>
                    <span className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                      All Categories
                    </span>
                  </div>
                  <span className="algo-tabular shrink-0 text-[11px] font-medium text-[var(--text-muted)]">
                    {totals.solved}/{totals.total}
                  </span>
                </div>
                <ProgressBar
                  value={totals.solved}
                  max={totals.total}
                  heightClassName="h-1"
                />
              </button>

              {categories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={cn(
                      "relative flex w-full flex-col gap-2 rounded-[var(--radius-sm)] border px-3 py-2.5 text-left transition-all cursor-pointer",
                      active
                        ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                        : "border-transparent hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--accent-primary)]"
                      />
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-[var(--radius-xs)] border"
                          style={{
                            backgroundColor: `${cat.accentColor}18`,
                            borderColor: `${cat.accentColor}35`,
                          }}
                        >
                          <CategoryIcon
                            icon={cat.icon}
                            color={cat.accentColor}
                            size={15}
                          />
                        </span>
                        <span className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                          {cat.name}
                        </span>
                      </div>
                      <span className="algo-tabular shrink-0 text-[11px] font-medium text-[var(--text-muted)]">
                        {cat.solvedProblems}/{cat.totalProblems}
                      </span>
                    </div>
                    <ProgressBar
                      value={cat.solvedProblems}
                      max={cat.totalProblems}
                      color={cat.accentColor}
                      heightClassName="h-1"
                    />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Explorer Surface (9 cols) */}
          <section className="algo-surface flex min-h-0 flex-1 flex-col overflow-hidden lg:col-span-9">
            {/* Active Context Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                {activeCategory ? (
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border"
                    style={{
                      backgroundColor: `${activeCategory.accentColor}1a`,
                      borderColor: `${activeCategory.accentColor}38`,
                    }}
                  >
                    <CategoryIcon
                      icon={activeCategory.icon}
                      color={activeCategory.accentColor}
                      size={18}
                    />
                  </span>
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--accent-border)]/50 bg-[var(--accent-soft)] text-[var(--accent-light)]">
                    <IconLayersSubtract size={18} />
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                      {activeCategory ? activeCategory.name : "All Java Problems"}
                    </h2>
                    <span className="algo-tabular rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
                      {problems.length} {problems.length === 1 ? "problem" : "problems"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {activeCategory
                      ? activeCategory.description
                      : "Browse every problem or filter by topic, difficulty, and status."}
                  </p>
                </div>
              </div>

              {/* Difficulty breakdown chips */}
              <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium">
                <span className="algo-tabular rounded-full bg-[var(--status-success-soft)] px-2.5 py-0.5 text-[var(--status-success)]">
                  Easy: {difficultyBreakdown.easy}
                </span>
                <span className="algo-tabular rounded-full bg-[var(--status-warning-soft)] px-2.5 py-0.5 text-[var(--status-warning)]">
                  Medium: {difficultyBreakdown.medium}
                </span>
                <span className="algo-tabular rounded-full bg-[var(--status-info-soft)] px-2.5 py-0.5 text-[var(--status-info)]">
                  Hard: {difficultyBreakdown.hard}
                </span>
              </div>
            </div>

            {/* Table Column Strip */}
            <div className="hidden sm:grid sm:grid-cols-12 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/60 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              <div className="col-span-7">Problem</div>
              <div className="col-span-2">Difficulty</div>
              <div className="col-span-3 text-right">Status</div>
            </div>

            {/* Scrollable Problem Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <LoadingState label="Loading problems..." />
              ) : problems.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="No matching problems"
                    description="Try clearing your search query or adjusting the category, difficulty, and status filters."
                    action={
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleResetFilters}
                      >
                        Reset Filters
                      </Button>
                    }
                  />
                </div>
              ) : (
                problems.map((problem, index) => (
                  <button
                    key={problem.id}
                    type="button"
                    onClick={() => navigate(`/problems/${problem.slug}`)}
                    className="group flex sm:grid sm:grid-cols-12 w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[var(--bg-surface-hover)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-light)] cursor-pointer"
                  >
                    {/* Problem Info */}
                    <div className="sm:col-span-7 flex items-center gap-3.5 min-w-0">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                          problem.status === "solved"
                            ? "border-[var(--status-success-border)] bg-[var(--status-success-soft)] text-[var(--status-success)]"
                            : problem.status === "attempted"
                            ? "border-[var(--status-warning-border)] bg-[var(--status-warning-soft)] text-[var(--status-warning)]"
                            : "border-[var(--border-subtle)] bg-[var(--bg-input)] text-[var(--text-muted)]"
                        )}
                      >
                        {problem.status === "solved" ? (
                          <IconCheck size={14} />
                        ) : problem.status === "attempted" ? (
                          <IconPlayerPlay size={12} />
                        ) : (
                          <IconCircle size={12} />
                        )}
                      </span>

                      <span className="algo-tabular hidden md:inline-block w-6 shrink-0 text-xs font-semibold text-[var(--text-muted)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-[14px] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-light)] transition-colors">
                            {problem.title}
                          </h3>
                          {problem.bookmarked && (
                            <IconBookmarkFilled
                              size={13}
                              className="shrink-0 text-[var(--status-warning)]"
                            />
                          )}
                          {selectedCategory === "all" && (
                            <span className="hidden lg:inline-flex shrink-0 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--text-muted)]">
                              {problem.categoryName}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[12.5px] text-[var(--text-secondary)] truncate">
                          {problem.summary}
                        </p>
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="sm:col-span-2 flex items-center shrink-0">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </div>

                    {/* Status + Runtime */}
                    <div className="sm:col-span-3 flex items-center justify-end gap-2.5 shrink-0">
                      {problem.bestRuntimeMs !== null ? (
                        <span className="algo-tabular hidden xl:inline-flex items-center gap-1 rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
                          <IconClock size={11} className="text-[var(--text-muted)]" />
                          <span>{problem.bestRuntimeMs} ms</span>
                        </span>
                      ) : problem.attemptsCount > 0 ? (
                        <span className="algo-tabular hidden xl:inline-flex rounded-[var(--radius-xs)] bg-[var(--bg-surface-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                          {problem.attemptsCount}{" "}
                          {problem.attemptsCount === 1 ? "try" : "tries"}
                        </span>
                      ) : null}

                      <span
                        className={cn(
                          "text-xs font-medium w-20 text-right",
                          problem.status === "solved"
                            ? "text-[var(--status-success)]"
                            : problem.status === "attempted"
                            ? "text-[var(--status-warning)]"
                            : "text-[var(--text-muted)]"
                        )}
                      >
                        {problem.status === "solved"
                          ? "Solved"
                          : problem.status === "attempted"
                          ? "Attempted"
                          : "Not Solved"}
                      </span>

                      <IconChevronRight
                        size={15}
                        className="text-[var(--text-muted)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]"
                      />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Integrated Explorer Footer */}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/70 px-5 py-2.5">
              <div className="algo-tabular flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                <div className="hidden sm:block w-28">
                  <ProgressBar
                    value={totals.solved}
                    max={totals.total}
                    heightClassName="h-1.5"
                  />
                </div>
                <span>
                  Total Problems:{" "}
                  <strong className="text-[var(--text-primary)]">
                    {totals.total}
                  </strong>
                </span>
                <span className="text-[var(--text-muted)]">|</span>
                <span>
                  Solved:{" "}
                  <strong className="text-[var(--text-primary)]">
                    {totals.solved}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/progress")}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-light)] hover:underline cursor-pointer"
              >
                <span>View Full Progress</span>
                <IconArrowRight size={13} />
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
