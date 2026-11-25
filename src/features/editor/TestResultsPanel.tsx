import { useNavigate } from "react-router";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconSettings,
  IconSparkles,
  IconTerminal2,
  IconX,
} from "@tabler/icons-react";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import type { ExecutionOutcome, JdkInfo } from "@/types/models";

interface TestResultsPanelProps {
  outcome: ExecutionOutcome | null;
  running: boolean;
  executionError: string | null;
  jdkInfo: JdkInfo | null;
  activeTab: "tests" | "console";
  onTabChange: (tab: "tests" | "console") => void;
  lastMode: "run" | "submit" | null;
}

export function TestResultsPanel({
  outcome,
  running,
  executionError,
  jdkInfo,
  activeTab,
  onTabChange,
  lastMode,
}: TestResultsPanelProps) {
  const navigate = useNavigate();

  const isAllPassed = outcome?.status === "passed";

  return (
    <section className="algo-surface flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTabChange("tests")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
              activeTab === "tests"
                ? "bg-[var(--accent-soft)] text-[var(--accent-light)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {isAllPassed ? (
              <IconCheck size={14} className="text-[var(--status-success)]" />
            ) : (
              <IconSparkles size={14} />
            )}
            <span>Test Results</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("console")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
              activeTab === "console"
                ? "bg-[var(--accent-soft)] text-[var(--accent-light)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <IconTerminal2 size={14} />
            <span>Console &amp; Compiler</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {running && (
            <span className="text-[var(--accent-light)] font-medium">
              Compiling &amp; executing in JVM...
            </span>
          )}
          {!running && outcome && (
            <>
              <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                <IconClock size={13} />
                {outcome.executionTimeMs} ms
              </span>
              {outcome.status === "passed" ? (
                <span className="font-semibold text-[var(--status-success)]">
                  All tests passed!
                </span>
              ) : outcome.status === "compile_error" ? (
                <Badge tone="danger">Compilation Error</Badge>
              ) : outcome.status === "timeout" ? (
                <Badge tone="warning">Time Limit Exceeded</Badge>
              ) : (
                <Badge tone="warning">
                  {outcome.passedCount}/{outcome.totalCount} Passed
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-h-60 overflow-y-auto p-4 text-xs">
        {!jdkInfo?.detected && !outcome && !executionError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--status-warning-border)] bg-[var(--status-warning-soft)] p-3.5">
            <div className="flex items-start gap-2.5">
              <IconAlertTriangle
                size={18}
                className="shrink-0 text-[var(--status-warning)]"
              />
              <div>
                <p className="font-semibold text-[var(--text-primary)]">
                  No JDK Detected on This Machine
                </p>
                <p className="mt-0.5 text-[var(--text-secondary)]">
                  {jdkInfo?.warning ??
                    "Install JDK 17+ or select a custom JDK folder in Settings to compile and execute Java solutions."}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<IconSettings size={14} />}
              onClick={() => navigate("/settings")}
            >
              Configure JDK
            </Button>
          </div>
        )}

        {executionError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--status-danger-border)] bg-[var(--status-danger-soft)] p-3.5">
            <div className="space-y-1">
              <p className="font-semibold text-[var(--status-danger)]">
                Execution Error
              </p>
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
                {executionError}
              </p>
            </div>
            {executionError.toLowerCase().includes("jdk") && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<IconSettings size={14} />}
                onClick={() => navigate("/settings")}
              >
                Open JDK Settings
              </Button>
            )}
          </div>
        )}

        {!running && !outcome && !executionError && jdkInfo?.detected && (
          <p className="py-3 text-center text-[var(--text-muted)]">
            Click <strong>Run</strong> (Ctrl + Enter) to test sample cases, or{" "}
            <strong>Submit</strong> (Ctrl + Shift + Enter) to evaluate all test cases
            and record progress.
          </p>
        )}

        {!running && outcome && activeTab === "tests" && (
          <div className="space-y-2">
            {outcome.status === "compile_error" ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--status-danger-border)] bg-[var(--status-danger-soft)] p-3 font-mono text-xs text-[var(--status-danger)] whitespace-pre-wrap">
                {outcome.compilerOutput || "Compilation failed."}
              </div>
            ) : outcome.testResults.length === 0 ? (
              <p className="text-[var(--text-secondary)]">
                No test case output captured. Check Console &amp; Compiler tab.
              </p>
            ) : (
              <>
                {outcome.testResults.map((tc) => (
                  <div
                    key={tc.caseNumber}
                    className="flex flex-col gap-1 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {tc.passed ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--status-success-soft)] text-[var(--status-success)]">
                            <IconCheck size={12} />
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--status-danger-soft)] text-[var(--status-danger)]">
                            <IconX size={12} />
                          </span>
                        )}
                        <span className="font-semibold text-[var(--text-primary)]">
                          Test Case {tc.caseNumber}
                        </span>
                        {tc.isHidden && <Badge tone="neutral">Hidden</Badge>}
                        <span className="font-mono text-[var(--text-secondary)] truncate">
                          {tc.isHidden
                            ? "(Hidden evaluation case)"
                            : `${tc.displayInput} → ${tc.expectedOutput}`}
                        </span>
                      </div>

                      <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
                        {tc.executionTimeMs} ms
                      </span>
                    </div>

                    {!tc.passed && (
                      <div className="pl-7 font-mono text-[11px] text-[var(--text-secondary)]">
                        {tc.errorMessage ? (
                          <span className="text-[var(--status-danger)]">
                            Runtime error: {tc.errorMessage}
                          </span>
                        ) : (
                          <span>
                            Expected:{" "}
                            <strong className="text-[var(--status-success)]">
                              {tc.isHidden ? "[hidden]" : tc.expectedOutput}
                            </strong>{" "}
                            | Got:{" "}
                            <strong className="text-[var(--status-danger)]">
                              {tc.actualOutput ?? "null"}
                            </strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isAllPassed && (
                  <div className="mt-2 flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--status-success-border)] bg-[var(--status-success-soft)] px-3.5 py-2.5 text-[var(--status-success)]">
                    <IconCheck size={16} />
                    <span className="font-semibold">
                      {lastMode === "submit"
                        ? "Excellent! Your solution passed all test cases and was saved to your progress."
                        : "Sample tests passed! Click Submit to run hidden cases and record your solve."}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!running && outcome && activeTab === "console" && (
          <div className="space-y-3 font-mono text-xs">
            {outcome.outputTruncated && (
              <div className="rounded-[var(--radius-sm)] border border-[var(--status-warning-border)] bg-[var(--status-warning-soft)] px-3 py-1.5 text-[var(--status-warning)]">
                Output exceeded 64 KB and was truncated.
              </div>
            )}

            {outcome.compilerOutput && (
              <div>
                <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-[var(--status-danger)]">
                  Compiler Output (javac)
                </p>
                <pre className="rounded-[var(--radius-sm)] bg-[var(--bg-input)] border border-[var(--status-danger-border)] p-3 text-[var(--status-danger)] whitespace-pre-wrap">
                  {outcome.compilerOutput}
                </pre>
              </div>
            )}

            <div>
              <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Standard Output (stdout)
              </p>
              <pre className="rounded-[var(--radius-sm)] bg-[var(--bg-input)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] whitespace-pre-wrap">
                {outcome.stdout || "(no stdout output)"}
              </pre>
            </div>

            {outcome.stderr && (
              <div>
                <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-[var(--status-danger)]">
                  Standard Error (stderr)
                </p>
                <pre className="rounded-[var(--radius-sm)] bg-[var(--bg-input)] border border-[var(--status-danger-border)] p-3 text-[var(--status-danger)] whitespace-pre-wrap">
                  {outcome.stderr}
                </pre>
              </div>
            )}

            <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] font-sans">
              <span>Exit code: {outcome.exitCode ?? "terminated"}</span>
              <span>Duration: {outcome.executionTimeMs} ms</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
