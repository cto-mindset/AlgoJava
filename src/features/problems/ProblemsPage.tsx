import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  IconArrowRight,
  IconBookmarkFilled,
  IconChartBar,
  IconCheck,
  IconChevronRight,
  IconCircle,
  IconInfoCircle,
  IconLayoutGrid,
  IconLayersSubtract,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
  Select,
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

export function ProblemsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
    return { total, solved };
  }, [categories]);

  return (
    <div className="mx-auto flex h-full max-w-[1320px] flex-col gap-5 p-6">
      {/* Top Header + Search / Filters */}
      <PageHeader
        icon={<IconLayersSubtract size={22} />}
        title="Problems"
        subtitle="Sharpen your Java skills with carefully crafted problems."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Input
              aria-label="Search problems"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<IconSearch size={15} />}
              containerClassName="w-60"
            />
            <Select<DifficultyFilter>
              ariaLabel="Filter by difficulty"
              value={difficulty}
              onChange={setDifficulty}
              options={[
                { value: "All", label: "All Levels" },
                { value: "Easy", label: "Easy" },
                { value: "Medium", label: "Medium" },
                { value: "Hard", label: "Hard" },
              ]}
              className="w-32"
            />
            <Select<StatusFilter>
              ariaLabel="Filter by completion status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All Status" },
                { value: "unsolved", label: "Not Solved" },
                { value: "solved", label: "Solved" },
                { value: "bookmarked", label: "Bookmarked" },
              ]}
              className="w-32"
            />
          </div>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void loadCatalog()} />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Categories Panel (4 cols) */}
          <aside className="algo-surface flex flex-col p-4 lg:col-span-4 overflow-y-auto">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <IconLayoutGrid size={17} className="text-[var(--accent-light)]" />
                <span>Categories</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-[var(--radius-xs)] px-2 py-1 text-xs font-medium text-[var(--accent-light)] hover:bg-[var(--accent-soft)] cursor-pointer"
              >
                <IconRefresh size={13} />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleSelectCategory("all")}
                className={cn(
                  "flex w-full items-center justify-between rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left transition-all cursor-pointer",
                  selectedCategory === "all"
                    ? "border-[var(--accent-border)] bg-[var(--accent-primary)]/18 text-[var(--text-primary)]"
                    : "border-transparent hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-input)] text-[var(--accent-light)]">
                    <IconLayersSubtract size={18} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      All Categories
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {totals.total} problems
                    </div>
                  </div>
                </div>
                {selectedCategory === "all" && (
                  <IconChevronRight size={16} className="text-[var(--accent-light)]" />
                )}
              </button>

              {categories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left transition-all cursor-pointer",
                      active
                        ? "border-[var(--accent-border)] bg-[var(--accent-primary)]/18 text-[var(--text-primary)]"
                        : "border-transparent hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-input)]">
                        <CategoryIcon icon={cat.icon} color={cat.accentColor} size={18} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {cat.name}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {cat.solvedProblems}/{cat.totalProblems} solved ·{" "}
                          {cat.totalProblems} problems
                        </div>
                      </div>
                    </div>
                    {active && (
                      <IconChevronRight
                        size={16}
                        className="shrink-0 text-[var(--accent-light)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Problems List (8 cols) */}
          <section className="flex min-h-0 flex-col gap-2.5 lg:col-span-8 overflow-y-auto pr-1">
            {loading ? (
              <LoadingState label="Loading problems..." />
            ) : problems.length === 0 ? (
              <div className="algo-surface p-8">
                <EmptyState
                  title="No matching problems"
                  description="Try clearing your search query or adjusting the category and difficulty filters."
                  action={
                    <Button variant="secondary" size="sm" onClick={handleResetFilters}>
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
                  className="group flex w-full items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3.5 text-left transition-all duration-150 hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface-elevated)] cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-7 shrink-0 text-center text-sm font-semibold text-[var(--text-muted)]">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-light)] transition-colors">
                          {problem.title}
                        </h3>
                        {problem.bookmarked && (
                          <IconBookmarkFilled
                            size={14}
                            className="shrink-0 text-[var(--status-warning)]"
                          />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)] truncate">
                        {problem.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <DifficultyBadge difficulty={problem.difficulty} />

                    <div className="flex w-24 items-center gap-1.5 text-xs font-medium">
                      {problem.status === "solved" ? (
                        <>
                          <IconCheck
                            size={15}
                            className="text-[var(--status-success)] shrink-0"
                          />
                          <span className="text-[var(--status-success)]">Solved</span>
                        </>
                      ) : problem.status === "attempted" ? (
                        <>
                          <IconCircle
                            size={14}
                            className="text-[var(--status-warning)] shrink-0"
                          />
                          <span className="text-[var(--status-warning)]">Attempted</span>
                        </>
                      ) : (
                        <>
                          <IconCircle
                            size={14}
                            className="text-[var(--text-muted)] shrink-0"
                          />
                          <span className="text-[var(--text-muted)]">Not Solved</span>
                        </>
                      )}
                    </div>

                    <IconChevronRight
                      size={16}
                      className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                    />
                  </div>
                </button>
              ))
            )}
          </section>
        </div>
      )}

      {/* Bottom Summary Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
        <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
          <IconInfoCircle size={16} className="text-[var(--accent-light)]" />
          <span>
            Total Problems:{" "}
            <strong className="text-[var(--text-primary)]">{totals.total}</strong>
          </span>
          <span className="text-[var(--text-muted)]">|</span>
          <span>
            Solved:{" "}
            <strong className="text-[var(--text-primary)]">{totals.solved}</strong>
          </span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<IconChartBar size={14} />}
          rightIcon={<IconArrowRight size={14} />}
          onClick={() => navigate("/progress")}
        >
          View Progress
        </Button>
      </footer>
    </div>
  );
}
