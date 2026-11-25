import type {
  DailyActivityPoint,
  DashboardData,
  DatabaseDetails,
  ProblemStatus,
  ProgressExportBundle,
  ProgressPageData,
  RecentActivityItem,
  SubmissionStatus,
} from "@/types/models";
import {
  calculateCurrentStreak,
  evaluateAchievements,
  toLocalDayKey,
} from "@/lib/utils/stats";
import { getCategoriesWithProgress } from "./categoryRepository";
import { getDatabase } from "./client";

interface RecentSubmissionRow {
  id: string;
  problem_id: string;
  problem_slug: string;
  problem_title: string;
  category_name: string;
  status: SubmissionStatus;
  passed_count: number;
  total_count: number;
  execution_time_ms: number;
  submitted_at: string;
}

export async function saveDraftCode(
  problemId: string,
  draftCode: string
): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await db.execute(
    `INSERT INTO user_progress (problem_id, status, draft_code, updated_at)
     VALUES ($1, 'not_started', $2, $3)
     ON CONFLICT(problem_id) DO UPDATE SET
       draft_code = excluded.draft_code,
       updated_at = excluded.updated_at`,
    [problemId, draftCode, nowIso]
  );
}

export async function clearDraftCode(problemId: string): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await db.execute(
    `UPDATE user_progress
     SET draft_code = NULL, updated_at = $1
     WHERE problem_id = $2`,
    [nowIso, problemId]
  );
}

export async function toggleBookmark(problemId: string): Promise<boolean> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  const existing = await db.select<Array<{ bookmarked: number }>>(
    `SELECT bookmarked FROM user_progress WHERE problem_id = $1 LIMIT 1`,
    [problemId]
  );

  const nextVal = existing[0] && Number(existing[0].bookmarked) === 1 ? 0 : 1;

  await db.execute(
    `INSERT INTO user_progress (problem_id, status, bookmarked, updated_at)
     VALUES ($1, 'not_started', $2, $3)
     ON CONFLICT(problem_id) DO UPDATE SET
       bookmarked = excluded.bookmarked,
       updated_at = excluded.updated_at`,
    [problemId, nextVal, nowIso]
  );

  return nextVal === 1;
}

export async function saveProblemNotes(
  problemId: string,
  notes: string
): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await db.execute(
    `INSERT INTO user_progress (problem_id, status, notes, updated_at)
     VALUES ($1, 'not_started', $2, $3)
     ON CONFLICT(problem_id) DO UPDATE SET
       notes = excluded.notes,
       updated_at = excluded.updated_at`,
    [problemId, notes, nowIso]
  );
}

async function fetchRecentActivity(limit: number): Promise<RecentActivityItem[]> {
  const db = await getDatabase();
  const rows = await db.select<RecentSubmissionRow[]>(
    `SELECT
       s.id,
       s.problem_id,
       p.slug AS problem_slug,
       p.title AS problem_title,
       c.name AS category_name,
       s.status,
       s.passed_count,
       s.total_count,
       s.execution_time_ms,
       s.submitted_at
     FROM submissions s
     INNER JOIN problems p ON p.id = s.problem_id
     INNER JOIN categories c ON c.id = p.category_id
     ORDER BY s.submitted_at DESC
     LIMIT $1`,
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    problemId: row.problem_id,
    problemSlug: row.problem_slug,
    problemTitle: row.problem_title,
    categoryName: row.category_name,
    status: row.status,
    passedCount: Number(row.passed_count),
    totalCount: Number(row.total_count),
    executionTimeMs: Number(row.execution_time_ms),
    submittedAt: row.submitted_at,
  }));
}

export async function getDashboardData(): Promise<DashboardData> {
  const db = await getDatabase();
  const [categories, attemptsRes, submissionDates, recentActivity, nextRows] =
    await Promise.all([
      getCategoriesWithProgress(),
      db.select<Array<{ count: number }>>(
        `SELECT COUNT(*) AS count FROM submissions`
      ),
      db.select<Array<{ submitted_at: string }>>(
        `SELECT submitted_at FROM submissions ORDER BY submitted_at DESC`
      ),
      fetchRecentActivity(5),
      db.select<Array<{ slug: string }>>(
        `SELECT p.slug
         FROM problems p
         INNER JOIN categories c ON c.id = p.category_id
         LEFT JOIN user_progress up ON up.problem_id = p.id
         ORDER BY CASE WHEN COALESCE(up.status, 'not_started') = 'solved' THEN 1 ELSE 0 END ASC,
                  c.sort_order ASC,
                  p.sort_order ASC
         LIMIT 1`
      ),
    ]);

  const totalProblems = categories.reduce((sum, c) => sum + c.totalProblems, 0);
  const solvedProblems = categories.reduce(
    (sum, c) => sum + c.solvedProblems,
    0
  );
  const overallPercentage =
    totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  const totalAttempts = Number(attemptsRes[0]?.count ?? 0);
  const currentStreakDays = calculateCurrentStreak(
    submissionDates.map((d) => d.submitted_at)
  );

  return {
    categories,
    totalProblems,
    solvedProblems,
    overallPercentage,
    totalAttempts,
    currentStreakDays,
    recentActivity,
    nextRecommendedSlug: nextRows[0]?.slug ?? null,
  };
}

export async function getProgressPageData(): Promise<ProgressPageData> {
  const db = await getDatabase();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [
    categories,
    subAggRows,
    allSubmissions,
    weeklySolvedRows,
    weeklyAttemptsRows,
    recentActivity,
  ] = await Promise.all([
    getCategoriesWithProgress(),
    db.select<
      Array<{
        total_attempts: number;
        passed_attempts: number;
        total_time_ms: number;
      }>
    >(
      `SELECT
         COUNT(*) AS total_attempts,
         COALESCE(SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END), 0) AS passed_attempts,
         COALESCE(SUM(execution_time_ms), 0) AS total_time_ms
       FROM submissions`
    ),
    db.select<Array<{ status: SubmissionStatus; submitted_at: string }>>(
      `SELECT status, submitted_at FROM submissions ORDER BY submitted_at DESC`
    ),
    db.select<Array<{ count: number }>>(
      `SELECT COUNT(*) AS count FROM user_progress
       WHERE status = 'solved' AND first_solved_at >= $1`,
      [sevenDaysAgo]
    ),
    db.select<Array<{ count: number }>>(
      `SELECT COUNT(*) AS count FROM submissions WHERE submitted_at >= $1`,
      [sevenDaysAgo]
    ),
    fetchRecentActivity(8),
  ]);

  const totalProblems = categories.reduce((sum, c) => sum + c.totalProblems, 0);
  const solvedProblems = categories.reduce(
    (sum, c) => sum + c.solvedProblems,
    0
  );
  const overallPercentage =
    totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  const agg = subAggRows[0];
  const totalAttempts = Number(agg?.total_attempts ?? 0);
  const passedAttempts = Number(agg?.passed_attempts ?? 0);
  const totalExecutionTimeMs = Number(agg?.total_time_ms ?? 0);
  const successRate =
    totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  const currentStreakDays = calculateCurrentStreak(
    allSubmissions.map((s) => s.submitted_at)
  );
  const completedCategoriesCount = categories.filter(
    (c) => c.totalProblems > 0 && c.solvedProblems >= c.totalProblems
  ).length;

  const achievements = evaluateAchievements({
    solvedProblems,
    totalProblems,
    overallPercentage,
    currentStreakDays,
    completedCategoriesCount,
    passedSubmissionsCount: passedAttempts,
  });

  // Build 14-day daily activity series
  const countsByDay = new Map<string, { attempts: number; passed: number }>();
  for (const row of allSubmissions) {
    const dt = new Date(row.submitted_at);
    if (Number.isNaN(dt.getTime())) continue;
    const key = toLocalDayKey(dt);
    const entry = countsByDay.get(key) ?? { attempts: 0, passed: 0 };
    entry.attempts += 1;
    if (row.status === "passed") entry.passed += 1;
    countsByDay.set(key, entry);
  }

  const dailyHistory: DailyActivityPoint[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const day = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i
    );
    const key = toLocalDayKey(day);
    const entry = countsByDay.get(key) ?? { attempts: 0, passed: 0 };
    dailyHistory.push({
      date: key,
      label: day.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      attempts: entry.attempts,
      passed: entry.passed,
    });
  }

  return {
    totalProblems,
    solvedProblems,
    weeklySolvedDelta: Number(weeklySolvedRows[0]?.count ?? 0),
    totalAttempts,
    weeklyAttemptsDelta: Number(weeklyAttemptsRows[0]?.count ?? 0),
    overallPercentage,
    successRate,
    totalExecutionTimeMs,
    currentStreakDays,
    categories,
    achievements,
    recentActivity,
    dailyHistory,
  };
}

export async function getDatabaseDetails(): Promise<DatabaseDetails> {
  const db = await getDatabase();
  const tableNames = [
    "categories",
    "problems",
    "test_cases",
    "submissions",
    "execution_results",
    "user_progress",
  ] as const;

  const counts = await Promise.all(
    tableNames.map(async (tableName) => {
      const res = await db.select<Array<{ count: number }>>(
        `SELECT COUNT(*) AS count FROM ${tableName}`
      );
      return {
        tableName,
        rowCount: Number(res[0]?.count ?? 0),
      };
    })
  );

  let schemaVersion = 2;
  try {
    const ver = await db.select<Array<{ version: number }>>(
      `SELECT COALESCE(MAX(version), 0) AS version FROM _sqlx_migrations`
    );
    schemaVersion = Number(ver[0]?.version ?? 2);
  } catch {
    schemaVersion = 2;
  }

  return {
    schemaVersion,
    tables: counts,
  };
}

export async function exportProgressBundle(): Promise<ProgressExportBundle> {
  const db = await getDatabase();

  const [progressRows, submissionRows] = await Promise.all([
    db.select<
      Array<{
        problem_id: string;
        status: ProblemStatus;
        bookmarked: number;
        draft_code: string | null;
        notes: string | null;
        attempts_count: number;
        solved_count: number;
        best_runtime_ms: number | null;
        first_solved_at: string | null;
        last_attempted_at: string | null;
        updated_at: string;
      }>
    >(`SELECT * FROM user_progress`),
    db.select<
      Array<{
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
      }>
    >(`SELECT * FROM submissions ORDER BY submitted_at ASC`),
  ]);

  return {
    schemaVersion: 1,
    appName: "AlgoJava",
    exportedAt: new Date().toISOString(),
    userProgress: progressRows.map((p) => ({
      problemId: p.problem_id,
      status: p.status,
      bookmarked: Number(p.bookmarked) === 1,
      draftCode: p.draft_code,
      notes: p.notes,
      attemptsCount: Number(p.attempts_count),
      solvedCount: Number(p.solved_count),
      bestRuntimeMs:
        p.best_runtime_ms != null ? Number(p.best_runtime_ms) : null,
      firstSolvedAt: p.first_solved_at,
      lastAttemptedAt: p.last_attempted_at,
      updatedAt: p.updated_at,
    })),
    submissions: submissionRows.map((s) => ({
      id: s.id,
      problemId: s.problem_id,
      sourceCode: s.source_code,
      status: s.status,
      passedCount: Number(s.passed_count),
      totalCount: Number(s.total_count),
      executionTimeMs: Number(s.execution_time_ms),
      compilerOutput: s.compiler_output,
      stdout: s.stdout,
      stderr: s.stderr,
      submittedAt: s.submitted_at,
    })),
  };
}

export async function importProgressBundle(
  bundle: ProgressExportBundle
): Promise<{ importedProgressCount: number; importedSubmissionsCount: number }> {
  const db = await getDatabase();
  const validProblemRows = await db.select<Array<{ id: string }>>(
    `SELECT id FROM problems`
  );
  const validIds = new Set(validProblemRows.map((r) => r.id));

  let importedProgressCount = 0;
  let importedSubmissionsCount = 0;

  for (const p of bundle.userProgress) {
    if (!validIds.has(p.problemId)) continue;
    await db.execute(
      `INSERT INTO user_progress (
         problem_id, status, bookmarked, draft_code, notes,
         attempts_count, solved_count, best_runtime_ms,
         first_solved_at, last_attempted_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT(problem_id) DO UPDATE SET
         status = excluded.status,
         bookmarked = excluded.bookmarked,
         draft_code = excluded.draft_code,
         notes = excluded.notes,
         attempts_count = excluded.attempts_count,
         solved_count = excluded.solved_count,
         best_runtime_ms = excluded.best_runtime_ms,
         first_solved_at = excluded.first_solved_at,
         last_attempted_at = excluded.last_attempted_at,
         updated_at = excluded.updated_at`,
      [
        p.problemId,
        p.status,
        p.bookmarked ? 1 : 0,
        p.draftCode,
        p.notes,
        p.attemptsCount,
        p.solvedCount,
        p.bestRuntimeMs,
        p.firstSolvedAt,
        p.lastAttemptedAt,
        p.updatedAt,
      ]
    );
    importedProgressCount++;
  }

  for (const s of bundle.submissions) {
    if (!validIds.has(s.problemId)) continue;
    await db.execute(
      `INSERT OR IGNORE INTO submissions (
         id, problem_id, source_code, status, passed_count, total_count,
         execution_time_ms, compiler_output, stdout, stderr, submitted_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        s.id,
        s.problemId,
        s.sourceCode,
        s.status,
        s.passedCount,
        s.totalCount,
        s.executionTimeMs,
        s.compilerOutput,
        s.stdout,
        s.stderr,
        s.submittedAt,
      ]
    );
    importedSubmissionsCount++;
  }

  return { importedProgressCount, importedSubmissionsCount };
}

export async function resetAllProgress(): Promise<void> {
  const db = await getDatabase();
  await db.execute(`DELETE FROM execution_results`);
  await db.execute(`DELETE FROM submissions`);
  await db.execute(`DELETE FROM user_progress`);
}
