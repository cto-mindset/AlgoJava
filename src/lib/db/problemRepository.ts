import type {
  Difficulty,
  ProblemDetail,
  ProblemExample,
  ProblemListItem,
  ProblemStatus,
  SimilarProblemRef,
  TestCase,
  UserProblemProgress,
} from "@/types/models";
import { getDatabase } from "./client";

export interface ProblemFilterOptions {
  categoryId?: string | null;
  difficulty?: Difficulty | "All";
  status?: "all" | "solved" | "unsolved" | "bookmarked";
  search?: string;
  showSolved?: boolean;
}

interface ProblemListRow {
  id: string;
  slug: string;
  category_id: string;
  category_name: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  sort_order: number;
  status: ProblemStatus | null;
  bookmarked: number | null;
  attempts_count: number | null;
  best_runtime_ms: number | null;
}

interface ProblemDetailRow {
  id: string;
  slug: string;
  category_id: string;
  category_name: string;
  title: string;
  summary: string;
  description: string;
  difficulty: Difficulty;
  method_name: string;
  method_signature: string;
  parameter_types_json: string;
  return_type: string;
  starter_code: string;
  solution_code: string;
  solution_explanation: string;
  examples_json: string;
  constraints_json: string;
  hints_json: string;
  tags_json: string;
  sort_order: number;
}

interface TestCaseRow {
  id: number;
  problem_id: string;
  case_number: number;
  display_input: string;
  input_args_json: string;
  expected_output: string;
  is_hidden: number;
}

interface ProgressRow {
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
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getProblems(
  filters: ProblemFilterOptions = {}
): Promise<ProblemListItem[]> {
  const db = await getDatabase();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.categoryId && filters.categoryId !== "all") {
    params.push(filters.categoryId);
    conditions.push(`p.category_id = $${params.length}`);
  }

  if (filters.difficulty && filters.difficulty !== "All") {
    params.push(filters.difficulty);
    conditions.push(`p.difficulty = $${params.length}`);
  }

  if (filters.showSolved === false) {
    conditions.push(`COALESCE(up.status, 'not_started') != 'solved'`);
  }

  if (filters.status === "solved") {
    conditions.push(`up.status = 'solved'`);
  } else if (filters.status === "unsolved") {
    conditions.push(`COALESCE(up.status, 'not_started') != 'solved'`);
  } else if (filters.status === "bookmarked") {
    conditions.push(`COALESCE(up.bookmarked, 0) = 1`);
  }

  if (filters.search && filters.search.trim().length > 0) {
    params.push(`%${filters.search.trim().toLowerCase()}%`);
    const pIdx = params.length;
    conditions.push(
      `(LOWER(p.title) LIKE $${pIdx} OR LOWER(p.summary) LIKE $${pIdx} OR LOWER(c.name) LIKE $${pIdx})`
    );
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await db.select<ProblemListRow[]>(
    `SELECT
       p.id,
       p.slug,
       p.category_id,
       c.name AS category_name,
       p.title,
       p.summary,
       p.difficulty,
       p.sort_order,
       up.status,
       up.bookmarked,
       up.attempts_count,
       up.best_runtime_ms
     FROM problems p
     INNER JOIN categories c ON c.id = p.category_id
     LEFT JOIN user_progress up ON up.problem_id = p.id
     ${whereClause}
     ORDER BY c.sort_order ASC, p.sort_order ASC`,
    params
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    categoryId: row.category_id,
    categoryName: row.category_name,
    title: row.title,
    summary: row.summary,
    difficulty: row.difficulty,
    sortOrder: Number(row.sort_order),
    status: row.status ?? "not_started",
    bookmarked: Number(row.bookmarked ?? 0) === 1,
    attemptsCount: Number(row.attempts_count ?? 0),
    bestRuntimeMs:
      row.best_runtime_ms != null ? Number(row.best_runtime_ms) : null,
  }));
}

export async function getProblemBySlug(slug: string): Promise<ProblemDetail | null> {
  const db = await getDatabase();
  const rows = await db.select<ProblemDetailRow[]>(
    `SELECT
       p.*,
       c.name AS category_name
     FROM problems p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE p.slug = $1
     LIMIT 1`,
    [slug]
  );

  const row = rows[0];
  if (!row) return null;

  const [testCaseRows, progressRows, similarRows] = await Promise.all([
    db.select<TestCaseRow[]>(
      `SELECT id, problem_id, case_number, display_input, input_args_json, expected_output, is_hidden
       FROM test_cases
       WHERE problem_id = $1
       ORDER BY case_number ASC`,
      [row.id]
    ),
    db.select<ProgressRow[]>(
      `SELECT * FROM user_progress WHERE problem_id = $1 LIMIT 1`,
      [row.id]
    ),
    db.select<
      Array<{
        id: string;
        slug: string;
        title: string;
        difficulty: Difficulty;
        status: ProblemStatus | null;
      }>
    >(
      `SELECT p.id, p.slug, p.title, p.difficulty, up.status
       FROM problems p
       LEFT JOIN user_progress up ON up.problem_id = p.id
       WHERE p.category_id = $1 AND p.id != $2
       ORDER BY p.sort_order ASC
       LIMIT 3`,
      [row.category_id, row.id]
    ),
  ]);

  const visibleTestCases: TestCase[] = testCaseRows
    .filter((tc) => Number(tc.is_hidden) === 0)
    .map((tc) => ({
      id: Number(tc.id),
      problemId: tc.problem_id,
      caseNumber: Number(tc.case_number),
      displayInput: tc.display_input,
      inputArgsJson: tc.input_args_json,
      expectedOutput: tc.expected_output,
      isHidden: false,
    }));

  const progRow = progressRows[0];
  const progress: UserProblemProgress | null = progRow
    ? {
        problemId: progRow.problem_id,
        status: progRow.status,
        bookmarked: Number(progRow.bookmarked) === 1,
        draftCode: progRow.draft_code,
        notes: progRow.notes,
        attemptsCount: Number(progRow.attempts_count),
        solvedCount: Number(progRow.solved_count),
        bestRuntimeMs:
          progRow.best_runtime_ms != null
            ? Number(progRow.best_runtime_ms)
            : null,
        firstSolvedAt: progRow.first_solved_at,
        lastAttemptedAt: progRow.last_attempted_at,
        updatedAt: progRow.updated_at,
      }
    : null;

  const similarProblems: SimilarProblemRef[] = similarRows.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    difficulty: s.difficulty,
    status: s.status ?? "not_started",
  }));

  return {
    id: row.id,
    slug: row.slug,
    categoryId: row.category_id,
    categoryName: row.category_name,
    title: row.title,
    summary: row.summary,
    description: row.description,
    difficulty: row.difficulty,
    methodName: row.method_name,
    methodSignature: row.method_signature,
    parameterTypes: safeJsonParse<string[]>(row.parameter_types_json, []),
    returnType: row.return_type,
    starterCode: row.starter_code,
    solutionCode: row.solution_code,
    solutionExplanation: row.solution_explanation,
    examples: safeJsonParse<ProblemExample[]>(row.examples_json, []),
    constraints: safeJsonParse<string[]>(row.constraints_json, []),
    hints: safeJsonParse<string[]>(row.hints_json, []),
    tags: safeJsonParse<string[]>(row.tags_json, []),
    sortOrder: Number(row.sort_order),
    visibleTestCases,
    allTestCasesCount: testCaseRows.length,
    progress,
    similarProblems,
  };
}

export async function getAllTestCasesForProblem(
  problemId: string
): Promise<TestCase[]> {
  const db = await getDatabase();
  const rows = await db.select<TestCaseRow[]>(
    `SELECT id, problem_id, case_number, display_input, input_args_json, expected_output, is_hidden
     FROM test_cases
     WHERE problem_id = $1
     ORDER BY case_number ASC`,
    [problemId]
  );

  return rows.map((tc) => ({
    id: Number(tc.id),
    problemId: tc.problem_id,
    caseNumber: Number(tc.case_number),
    displayInput: tc.display_input,
    inputArgsJson: tc.input_args_json,
    expectedOutput: tc.expected_output,
    isHidden: Number(tc.is_hidden) === 1,
  }));
}

export async function getNextProblemSlug(
  currentProblemId: string,
  categoryId: string,
  currentSortOrder: number
): Promise<string | null> {
  const db = await getDatabase();
  const sameCategory = await db.select<Array<{ slug: string }>>(
    `SELECT p.slug
     FROM problems p
     LEFT JOIN user_progress up ON up.problem_id = p.id
     WHERE p.category_id = $1 AND p.sort_order > $2 AND p.id != $3
     ORDER BY CASE WHEN COALESCE(up.status, 'not_started') = 'solved' THEN 1 ELSE 0 END ASC, p.sort_order ASC
     LIMIT 1`,
    [categoryId, currentSortOrder, currentProblemId]
  );

  if (sameCategory[0]) return sameCategory[0].slug;

  const anyUnsolved = await db.select<Array<{ slug: string }>>(
    `SELECT p.slug
     FROM problems p
     INNER JOIN categories c ON c.id = p.category_id
     LEFT JOIN user_progress up ON up.problem_id = p.id
     WHERE p.id != $1 AND COALESCE(up.status, 'not_started') != 'solved'
     ORDER BY c.sort_order ASC, p.sort_order ASC
     LIMIT 1`,
    [currentProblemId]
  );

  return anyUnsolved[0]?.slug ?? null;
}
