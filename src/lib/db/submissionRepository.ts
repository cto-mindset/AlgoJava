import type { ExecutionOutcome, SubmissionRecord, SubmissionStatus } from "@/types/models";
import { getDatabase } from "./client";

interface ExistingProgressRow {
  status: "not_started" | "attempted" | "solved";
  attempts_count: number;
  solved_count: number;
  best_runtime_ms: number | null;
  first_solved_at: string | null;
}

interface SubmissionRow {
  id: string;
  problem_id: string;
  source_code: string;
  status: SubmissionStatus;
  passed_count: number;
  total_count: number;
  execution_time_ms: number;
  compiler_output: string;
  stdout: string;
  stderr: string;
  submitted_at: string;
}

export async function recordSubmission(
  problemId: string,
  sourceCode: string,
  outcome: ExecutionOutcome
): Promise<SubmissionRecord> {
  const db = await getDatabase();
  const submissionId = crypto.randomUUID();
  const nowIso = new Date().toISOString();

  await db.execute(
    `INSERT INTO submissions (
       id, problem_id, source_code, status, passed_count, total_count,
       execution_time_ms, compiler_output, stdout, stderr, submitted_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      submissionId,
      problemId,
      sourceCode,
      outcome.status,
      outcome.passedCount,
      outcome.totalCount,
      outcome.executionTimeMs,
      outcome.compilerOutput,
      outcome.stdout,
      outcome.stderr,
      nowIso,
    ]
  );

  for (const tc of outcome.testResults) {
    await db.execute(
      `INSERT INTO execution_results (
         submission_id, test_case_id, case_number, passed,
         expected_output, actual_output, error_message, execution_time_ms
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        submissionId,
        tc.testCaseId > 0 ? tc.testCaseId : null,
        tc.caseNumber,
        tc.passed ? 1 : 0,
        tc.expectedOutput,
        tc.actualOutput,
        tc.errorMessage,
        tc.executionTimeMs,
      ]
    );
  }

  const existingRows = await db.select<ExistingProgressRow[]>(
    `SELECT status, attempts_count, solved_count, best_runtime_ms, first_solved_at
     FROM user_progress WHERE problem_id = $1 LIMIT 1`,
    [problemId]
  );

  const existing = existingRows[0];
  const isSolvedNow = outcome.status === "passed";
  const nextStatus =
    existing?.status === "solved" || isSolvedNow ? "solved" : "attempted";
  const attemptsCount = Number(existing?.attempts_count ?? 0) + 1;
  const solvedCount = Number(existing?.solved_count ?? 0) + (isSolvedNow ? 1 : 0);
  const prevBest =
    existing?.best_runtime_ms != null ? Number(existing.best_runtime_ms) : null;
  const bestRuntimeMs = isSolvedNow
    ? prevBest != null
      ? Math.min(prevBest, outcome.executionTimeMs)
      : outcome.executionTimeMs
    : prevBest;
  const firstSolvedAt =
    existing?.first_solved_at ?? (isSolvedNow ? nowIso : null);

  await db.execute(
    `INSERT INTO user_progress (
       problem_id, status, draft_code, attempts_count, solved_count,
       best_runtime_ms, first_solved_at, last_attempted_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT(problem_id) DO UPDATE SET
       status = excluded.status,
       draft_code = excluded.draft_code,
       attempts_count = excluded.attempts_count,
       solved_count = excluded.solved_count,
       best_runtime_ms = excluded.best_runtime_ms,
       first_solved_at = excluded.first_solved_at,
       last_attempted_at = excluded.last_attempted_at,
       updated_at = excluded.updated_at`,
    [
      problemId,
      nextStatus,
      sourceCode,
      attemptsCount,
      solvedCount,
      bestRuntimeMs,
      firstSolvedAt,
      nowIso,
      nowIso,
    ]
  );

  return {
    id: submissionId,
    problemId,
    sourceCode,
    status: outcome.status,
    passedCount: outcome.passedCount,
    totalCount: outcome.totalCount,
    executionTimeMs: outcome.executionTimeMs,
    compilerOutput: outcome.compilerOutput,
    stdout: outcome.stdout,
    stderr: outcome.stderr,
    submittedAt: nowIso,
  };
}

export async function getSubmissionsForProblem(
  problemId: string,
  limit = 15
): Promise<SubmissionRecord[]> {
  const db = await getDatabase();
  const rows = await db.select<SubmissionRow[]>(
    `SELECT * FROM submissions
     WHERE problem_id = $1
     ORDER BY submitted_at DESC
     LIMIT $2`,
    [problemId, limit]
  );

  return rows.map((row) => ({
    id: row.id,
    problemId: row.problem_id,
    sourceCode: row.source_code,
    status: row.status,
    passedCount: Number(row.passed_count),
    totalCount: Number(row.total_count),
    executionTimeMs: Number(row.execution_time_ms),
    compilerOutput: row.compiler_output,
    stdout: row.stdout,
    stderr: row.stderr,
    submittedAt: row.submitted_at,
  }));
}
