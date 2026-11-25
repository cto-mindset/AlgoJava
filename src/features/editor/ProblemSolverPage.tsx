import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  IconAdjustments,
  IconArrowRight,
  IconBookmark,
  IconBookmarkFilled,
  IconBulb,
  IconCheck,
  IconChevronRight,
  IconCode,
  IconHistory,
  IconListDetails,
  IconMaximize,
  IconMinimize,
  IconPlayerPlay,
  IconRefresh,
  IconSend,
  IconStarFilled,
} from "@tabler/icons-react";
import {
  Badge,
  Button,
  ConfirmDialog,
  ErrorState,
  IconButton,
  LoadingState,
  Select,
  Switch,
} from "@/components/ui";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import {
  getAllTestCasesForProblem,
  getNextProblemSlug,
  getProblemBySlug,
} from "@/lib/db/problemRepository";
import {
  clearDraftCode,
  saveDraftCode,
  saveProblemNotes,
  toggleBookmark,
} from "@/lib/db/progressRepository";
import {
  getSubmissionsForProblem,
  recordSubmission,
} from "@/lib/db/submissionRepository";
import { formatNativeError } from "@/lib/tauri/env";
import { executeJavaCode } from "@/lib/tauri/javaClient";
import { formatRelativeTimestamp } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useJavaRuntimeStore } from "@/stores/javaRuntimeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useToastStore } from "@/stores/toastStore";
import type {
  EditorFontFamily,
  ExecutionOutcome,
  ProblemDetail,
  SubmissionRecord,
  TabSizeOption,
} from "@/types/models";
import { TestResultsPanel } from "./TestResultsPanel";

const LazyJavaCodeEditor = React.lazy(() => import("./JavaCodeEditor"));

type EditorTab = "java" | "solution" | "submissions";

export function ProblemSolverPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const jdkInfo = useJavaRuntimeStore((s) => s.jdkInfo);
  const pushToast = useToastStore((s) => s.pushToast);

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editorTab, setEditorTab] = useState<EditorTab>("java");
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [showHints, setShowHints] = useState(settings.showHintsByDefault);
  const [isFullscreenEditor, setIsFullscreenEditor] = useState(false);
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<ExecutionOutcome | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [resultsTab, setResultsTab] = useState<"tests" | "console">("tests");
  const [resultsOpen, setResultsOpen] = useState(true);
  const [lastMode, setLastMode] = useState<"run" | "submit" | null>(null);

  const autoSaveTimerRef = useRef<number | null>(null);

  const loadProblem = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setOutcome(null);
    setExecutionError(null);
    setLastMode(null);
    setEditorTab("java");
    setSolutionRevealed(false);

    try {
      const detail = await getProblemBySlug(slug);
      if (!detail) {
        setError(`Problem "${slug}" was not found.`);
        setProblem(null);
        return;
      }
      setProblem(detail);
      setCode(detail.progress?.draftCode ?? detail.starterCode);
      setNotes(detail.progress?.notes ?? "");
      setShowHints(settings.showHintsByDefault);
      setSolutionRevealed(detail.progress?.status === "solved");

      const subs = await getSubmissionsForProblem(detail.id);
      setSubmissions(subs);
    } catch (err) {
      setError(formatNativeError(err));
    } finally {
      setLoading(false);
    }
  }, [slug, settings.showHintsByDefault]);

  useEffect(() => {
    void loadProblem();
  }, [loadProblem]);

  // Debounced auto-save draft to SQLite
  const handleCodeChange = useCallback(
    (nextCode: string) => {
      setCode(nextCode);
      if (!settings.autoSave || !problem) return;

      if (autoSaveTimerRef.current !== null) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = window.setTimeout(() => {
        void saveDraftCode(problem.id, nextCode).catch(() => {});
      }, 600);
    },
    [settings.autoSave, problem]
  );

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current !== null) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const handleSaveDraftNow = useCallback(async () => {
    if (!problem) return;
    try {
      await saveDraftCode(problem.id, code);
      pushToast({ title: "Draft saved locally", tone: "info" });
    } catch (err) {
      pushToast({
        title: "Failed to save draft",
        description: formatNativeError(err),
        tone: "error",
      });
    }
  }, [problem, code, pushToast]);

  const executeCases = useCallback(
    async (mode: "run" | "submit") => {
      if (!problem || running) return;

      setRunning(true);
      setExecutionError(null);
      setLastMode(mode);
      if (settings.showTestResultsAutomatically) {
        setResultsOpen(true);
      }

      try {
        await saveDraftCode(problem.id, code);

        const casesToRun =
          mode === "submit"
            ? await getAllTestCasesForProblem(problem.id)
            : problem.visibleTestCases;

        const result = await executeJavaCode({
          sourceCode: code,
          methodName: problem.methodName,
          methodSignature: problem.methodSignature,
          parameterTypes: problem.parameterTypes,
          returnType: problem.returnType,
          testCases: casesToRun.map((tc) => ({
            id: tc.id,
            caseNumber: tc.caseNumber,
            displayInput: tc.displayInput,
            inputArgsJson: tc.inputArgsJson,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
          })),
          config: {
            customJdkPath: settings.customJdkPath.trim() || null,
            timeoutSeconds: settings.executionTimeoutSeconds,
            memoryLimitMb: settings.memoryLimitMb,
          },
        });

        setOutcome(result);
        setResultsTab(
          result.status === "compile_error" || result.status === "timeout"
            ? "console"
            : "tests"
        );

        if (mode === "submit") {
          const savedSub = await recordSubmission(problem.id, code, result);
          setSubmissions((prev) => [savedSub, ...prev].slice(0, 15));

          const refreshed = await getProblemBySlug(problem.slug);
          if (refreshed) {
            setProblem(refreshed);
          }

          if (result.status === "passed") {
            pushToast({
              title: "Solution Accepted!",
              description: `${result.passedCount}/${result.totalCount} test cases passed in ${result.executionTimeMs} ms.`,
              tone: "success",
            });

            if (settings.autoOpenNextProblem) {
              const nextSlug = await getNextProblemSlug(
                problem.id,
                problem.categoryId,
                problem.sortOrder
              );
              if (nextSlug) {
                window.setTimeout(() => {
                  navigate(`/problems/${nextSlug}`);
                }, 1200);
              }
            }
          }
        }
      } catch (err) {
        setExecutionError(formatNativeError(err));
        setResultsTab("tests");
      } finally {
        setRunning(false);
      }
    },
    [problem, running, code, settings, pushToast, navigate]
  );

  const performResetCode = async () => {
    if (!problem) return;
    setCode(problem.starterCode);
    setOutcome(null);
    setExecutionError(null);
    setConfirmResetOpen(false);
    await clearDraftCode(problem.id).catch(() => {});
    pushToast({ title: "Code reset to starter template", tone: "info" });
  };

  const handleResetClick = () => {
    if (settings.confirmBeforeResettingCode) {
      setConfirmResetOpen(true);
    } else {
      void performResetCode();
    }
  };

  const handleToggleBookmark = async () => {
    if (!problem) return;
    try {
      const nextBookmarked = await toggleBookmark(problem.id);
      setProblem((prev) =>
        prev
          ? {
              ...prev,
              progress: {
                problemId: prev.id,
                status: prev.progress?.status ?? "not_started",
                bookmarked: nextBookmarked,
                draftCode: prev.progress?.draftCode ?? code,
                notes: prev.progress?.notes ?? notes,
                attemptsCount: prev.progress?.attemptsCount ?? 0,
                solvedCount: prev.progress?.solvedCount ?? 0,
                bestRuntimeMs: prev.progress?.bestRuntimeMs ?? null,
                firstSolvedAt: prev.progress?.firstSolvedAt ?? null,
                lastAttemptedAt: prev.progress?.lastAttemptedAt ?? null,
                updatedAt: new Date().toISOString(),
              },
            }
          : null
      );
    } catch (err) {
      pushToast({
        title: "Bookmark update failed",
        description: formatNativeError(err),
        tone: "error",
      });
    }
  };

  if (loading) return <LoadingState label="Opening problem workspace..." />;
  if (error || !problem) {
    return (
      <ErrorState
        message={error ?? "Problem not found."}
        onRetry={() => void loadProblem()}
      />
    );
  }

  const isSolved = problem.progress?.status === "solved";
  const isBookmarked = problem.progress?.bookmarked ?? false;

  return (
    <div className="mx-auto flex h-full max-w-[1440px] flex-col gap-4 p-4 lg:p-5 overflow-hidden">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Problem Description Pane */}
        {!isFullscreenEditor && (
          <aside className="algo-surface flex min-h-0 flex-col overflow-y-auto p-5 lg:col-span-5 space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <DifficultyBadge difficulty={problem.difficulty} />
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">
                    {problem.title}
                  </h1>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isSolved && (
                    <Badge tone="success">
                      <IconCheck size={12} /> Solved
                    </Badge>
                  )}
                  <IconButton
                    label={isBookmarked ? "Remove bookmark" : "Bookmark problem"}
                    onClick={() => void handleToggleBookmark()}
                  >
                    {isBookmarked ? (
                      <IconBookmarkFilled
                        size={18}
                        className="text-[var(--status-warning)]"
                      />
                    ) : (
                      <IconBookmark size={18} />
                    )}
                  </IconButton>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                {problem.description}
              </p>
              <div className="mt-2.5 inline-flex items-center rounded-[var(--radius-xs)] bg-[var(--bg-input)] border border-[var(--border-subtle)] px-2.5 py-1 font-mono text-xs text-[var(--accent-light)]">
                {problem.methodSignature}
              </div>
            </div>

            {/* Examples */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <IconPlayerPlay size={15} className="text-[var(--accent-light)]" />
                <span>Examples</span>
              </div>
              {problem.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] p-3.5 font-mono text-xs space-y-1"
                >
                  <div>
                    <span className="text-[var(--text-muted)]">Input: </span>
                    <span className="text-[var(--text-primary)]">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Output: </span>
                    <span className="text-[var(--text-primary)]">{ex.output}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            {problem.constraints.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <IconBulb size={16} className="text-[var(--accent-light)]" />
                  <span>Constraints</span>
                </div>
                <ul className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-4 py-3 space-y-1 text-xs font-mono text-[var(--text-secondary)] list-disc list-inside">
                  {problem.constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hints */}
            {problem.hints.length > 0 && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowHints((prev) => !prev)}
                  className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-light)] cursor-pointer"
                >
                  <IconListDetails size={16} className="text-[var(--accent-light)]" />
                  <span>Hints ({problem.hints.length})</span>
                </button>
                {showHints && (
                  <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                    {problem.hints.map((hint, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {hint}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Similar Problems */}
            {problem.similarProblems.length > 0 && (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                    <IconStarFilled
                      size={15}
                      className="text-[var(--accent-light)]"
                    />
                    <span>Similar Problems</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/problems?category=${problem.categoryId}`)
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-light)] hover:underline cursor-pointer"
                  >
                    <span>View All</span>
                    <IconArrowRight size={13} />
                  </button>
                </div>

                <div className="space-y-1">
                  {problem.similarProblems.map((sim) => (
                    <button
                      key={sim.id}
                      type="button"
                      onClick={() => navigate(`/problems/${sim.slug}`)}
                      className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-xs)] px-2 py-1.5 text-left text-xs hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-[var(--text-primary)] truncate">
                        <IconChevronRight
                          size={13}
                          className="text-[var(--text-muted)] shrink-0"
                        />
                        <span className="truncate">{sim.title}</span>
                      </span>
                      <DifficultyBadge difficulty={sim.difficulty} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Right Editor + Results Pane */}
        <section
          className={cn(
            "flex min-h-0 flex-col gap-3",
            isFullscreenEditor ? "lg:col-span-12" : "lg:col-span-7"
          )}
        >
          {/* Code Editor Surface */}
          <div className="algo-surface relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-3 py-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditorTab("java")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    editorTab === "java"
                      ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                      : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                  )}
                >
                  <IconCode size={14} className="text-[var(--accent-light)]" />
                  <span>Java</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorTab("solution")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    editorTab === "solution"
                      ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                      : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                  )}
                >
                  <IconBulb size={14} />
                  <span>Solution</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorTab("submissions")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    editorTab === "submissions"
                      ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                      : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                  )}
                >
                  <IconHistory size={14} />
                  <span>Submissions ({submissions.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <IconButton
                  label="Quick editor preferences"
                  size="sm"
                  onClick={() => setQuickSettingsOpen((prev) => !prev)}
                >
                  <IconAdjustments size={15} />
                </IconButton>
                <IconButton
                  label={
                    isFullscreenEditor ? "Exit expanded editor" : "Expand editor"
                  }
                  size="sm"
                  onClick={() => setIsFullscreenEditor((prev) => !prev)}
                >
                  {isFullscreenEditor ? (
                    <IconMinimize size={15} />
                  ) : (
                    <IconMaximize size={15} />
                  )}
                </IconButton>
              </div>
            </div>

            {/* Quick Editor Popover */}
            {quickSettingsOpen && (
              <div className="absolute right-3 top-12 z-30 w-64 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] p-3.5 shadow-[var(--shadow-md)] space-y-3 text-xs">
                <div className="flex items-center justify-between font-semibold text-[var(--text-primary)]">
                  <span>Editor Settings</span>
                  <button
                    type="button"
                    onClick={() => setQuickSettingsOpen(false)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Done
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[var(--text-secondary)]">Font Family</span>
                  <Select<EditorFontFamily>
                    value={settings.editorFontFamily}
                    onChange={(v) =>
                      void updateSettings({ editorFontFamily: v })
                    }
                    options={[
                      { value: "jetbrains-mono", label: "JetBrains Mono" },
                      { value: "geist-mono", label: "Geist Mono" },
                      { value: "google-sans-code", label: "Google Sans Code" },
                    ]}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--text-secondary)]">Font Size</span>
                  <Select<number>
                    value={settings.editorFontSize}
                    onChange={(v) => void updateSettings({ editorFontSize: v })}
                    options={[12, 13, 14, 15, 16, 18].map((n) => ({
                      value: n,
                      label: `${n} px`,
                    }))}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--text-secondary)]">Tab Size</span>
                  <Select<TabSizeOption>
                    value={settings.tabSize}
                    onChange={(v) => void updateSettings({ tabSize: v })}
                    options={[
                      { value: 2, label: "2 spaces" },
                      { value: 4, label: "4 spaces" },
                      { value: 8, label: "8 spaces" },
                    ]}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Word Wrap</span>
                  <Switch
                    checked={settings.wordWrap}
                    onCheckedChange={(v) => void updateSettings({ wordWrap: v })}
                  />
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div className="min-h-0 flex-1 overflow-hidden">
              {editorTab === "java" && (
                <Suspense fallback={<LoadingState label="Loading CodeMirror editor..." />}>
                  <LazyJavaCodeEditor
                    value={code}
                    onChange={handleCodeChange}
                    onRunShortcut={() => void executeCases("run")}
                    onSubmitShortcut={() => void executeCases("submit")}
                    onSaveShortcut={() => void handleSaveDraftNow()}
                  />
                </Suspense>
              )}

              {editorTab === "solution" && (
                <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4">
                  {!solutionRevealed ? (
                    <div className="flex flex-1 flex-col items-center justify-center text-center gap-3">
                      <IconBulb size={28} className="text-[var(--status-warning)]" />
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                        Reference Solution Hidden
                      </h3>
                      <p className="max-w-sm text-xs text-[var(--text-secondary)]">
                        Try solving the problem first, or reveal the reference Java
                        solution and complexity explanation below.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSolutionRevealed(true)}
                      >
                        Reveal Solution
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] p-3.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                        <strong className="text-[var(--text-primary)]">
                          Approach Explanation:{" "}
                        </strong>
                        {problem.solutionExplanation}
                      </div>
                      <div className="min-h-56 flex-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                        <Suspense fallback={<LoadingState label="Loading solution..." />}>
                          <LazyJavaCodeEditor value={problem.solutionCode} readOnly />
                        </Suspense>
                      </div>
                    </>
                  )}
                </div>
              )}

              {editorTab === "submissions" && (
                <div className="h-full overflow-y-auto p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        Personal Notes
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          void saveProblemNotes(problem.id, notes).then(() =>
                            pushToast({ title: "Notes saved", tone: "info" })
                          );
                        }}
                      >
                        Save Notes
                      </Button>
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Write time complexity notes, edge cases, or reminders..."
                      rows={3}
                      className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-input)] p-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-border)] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      Submission History
                    </h3>
                    {submissions.length === 0 ? (
                      <p className="text-xs text-[var(--text-secondary)]">
                        No submissions yet for this problem. Click Submit to evaluate
                        against all {problem.allTestCasesCount} test cases.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {submissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 py-2 text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <Badge
                                tone={
                                  sub.status === "passed"
                                    ? "success"
                                    : sub.status === "compile_error"
                                    ? "danger"
                                    : "warning"
                                }
                              >
                                {sub.status}
                              </Badge>
                              <span className="text-[var(--text-secondary)]">
                                {sub.passedCount}/{sub.totalCount} cases ·{" "}
                                {sub.executionTimeMs} ms
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--text-muted)]">
                                {formatRelativeTimestamp(sub.submittedAt)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCode(sub.sourceCode);
                                  setEditorTab("java");
                                }}
                              >
                                Load
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar: Reset / Run / Submit */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<IconRefresh size={14} />}
                  onClick={handleResetClick}
                  disabled={running}
                >
                  Reset
                </Button>
                <button
                  type="button"
                  onClick={() => setResultsOpen((prev) => !prev)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1 cursor-pointer"
                >
                  {resultsOpen ? "Hide Results" : "Show Results"}
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="secondary"
                  size="md"
                  loading={running && lastMode === "run"}
                  disabled={running}
                  leftIcon={<IconPlayerPlay size={15} />}
                  onClick={() => void executeCases("run")}
                >
                  Run{" "}
                  <span className="ml-1 text-[11px] opacity-70">Ctrl + Enter</span>
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={running && lastMode === "submit"}
                  disabled={running}
                  leftIcon={<IconSend size={15} />}
                  onClick={() => void executeCases("submit")}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>

          {/* Test Results & Console Panel */}
          {resultsOpen && (
            <TestResultsPanel
              outcome={outcome}
              running={running}
              executionError={executionError}
              jdkInfo={jdkInfo}
              activeTab={resultsTab}
              onTabChange={setResultsTab}
              lastMode={lastMode}
            />
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={performResetCode}
        title="Reset Starter Code?"
        message="This will replace your current code in the editor with the original problem template. Your past submissions and solved status will not be affected."
        confirmLabel="Reset Code"
        danger
      />
    </div>
  );
}
