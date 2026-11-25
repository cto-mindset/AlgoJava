import type {
  ProblemStatus,
  ProgressExportBundle,
  SubmissionStatus,
} from "@/types/models";

const VALID_PROGRESS_STATUSES = new Set<ProblemStatus>([
  "not_started",
  "attempted",
  "solved",
]);

const VALID_SUBMISSION_STATUSES = new Set<SubmissionStatus>([
  "passed",
  "failed",
  "compile_error",
  "runtime_error",
  "timeout",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateProgressExportBundle(
  rawJson: string
): ProgressExportBundle {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error("The selected file does not contain valid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Backup root must be a JSON object.");
  }

  if (parsed.schemaVersion !== 1 || parsed.appName !== "AlgoJava") {
    throw new Error(
      "Unsupported backup format. Expected AlgoJava schemaVersion 1."
    );
  }

  if (typeof parsed.exportedAt !== "string" || !parsed.exportedAt.trim()) {
    throw new Error("Backup is missing a valid exportedAt timestamp.");
  }

  if (!Array.isArray(parsed.userProgress) || !Array.isArray(parsed.submissions)) {
    throw new Error(
      "Backup must include userProgress and submissions arrays."
    );
  }

  const normalizedProgress: ProgressExportBundle["userProgress"] = [];
  for (const item of parsed.userProgress) {
    if (!isRecord(item) || typeof item.problemId !== "string" || !item.problemId) {
      throw new Error("Invalid userProgress entry: missing problemId.");
    }
    const status = item.status as ProblemStatus;
    if (!VALID_PROGRESS_STATUSES.has(status)) {
      throw new Error(`Invalid progress status for ${item.problemId}.`);
    }
    normalizedProgress.push({
      problemId: item.problemId,
      status,
      bookmarked: Boolean(item.bookmarked),
      draftCode: typeof item.draftCode === "string" ? item.draftCode : null,
      notes: typeof item.notes === "string" ? item.notes : null,
      attemptsCount:
        typeof item.attemptsCount === "number" && Number.isFinite(item.attemptsCount)
          ? Math.max(0, Math.floor(item.attemptsCount))
          : 0,
      solvedCount:
        typeof item.solvedCount === "number" && Number.isFinite(item.solvedCount)
          ? Math.max(0, Math.floor(item.solvedCount))
          : 0,
      bestRuntimeMs:
        typeof item.bestRuntimeMs === "number" && Number.isFinite(item.bestRuntimeMs)
          ? Math.max(0, Math.floor(item.bestRuntimeMs))
          : null,
      firstSolvedAt:
        typeof item.firstSolvedAt === "string" ? item.firstSolvedAt : null,
      lastAttemptedAt:
        typeof item.lastAttemptedAt === "string" ? item.lastAttemptedAt : null,
      updatedAt:
        typeof item.updatedAt === "string" && item.updatedAt
          ? item.updatedAt
          : new Date().toISOString(),
    });
  }

  const normalizedSubmissions: ProgressExportBundle["submissions"] = [];
  for (const sub of parsed.submissions) {
    if (
      !isRecord(sub) ||
      typeof sub.id !== "string" ||
      !sub.id ||
      typeof sub.problemId !== "string" ||
      !sub.problemId ||
      typeof sub.sourceCode !== "string"
    ) {
      throw new Error("Invalid submission entry in backup.");
    }
    const status = sub.status as SubmissionStatus;
    if (!VALID_SUBMISSION_STATUSES.has(status)) {
      throw new Error(`Invalid submission status in backup (${sub.id}).`);
    }
    normalizedSubmissions.push({
      id: sub.id,
      problemId: sub.problemId,
      sourceCode: sub.sourceCode,
      status,
      passedCount:
        typeof sub.passedCount === "number" ? Math.max(0, Math.floor(sub.passedCount)) : 0,
      totalCount:
        typeof sub.totalCount === "number" ? Math.max(0, Math.floor(sub.totalCount)) : 0,
      executionTimeMs:
        typeof sub.executionTimeMs === "number"
          ? Math.max(0, Math.floor(sub.executionTimeMs))
          : 0,
      compilerOutput:
        typeof sub.compilerOutput === "string" ? sub.compilerOutput : "",
      stdout: typeof sub.stdout === "string" ? sub.stdout : "",
      stderr: typeof sub.stderr === "string" ? sub.stderr : "",
      submittedAt:
        typeof sub.submittedAt === "string" && sub.submittedAt
          ? sub.submittedAt
          : new Date().toISOString(),
    });
  }

  return {
    schemaVersion: 1,
    appName: "AlgoJava",
    exportedAt: parsed.exportedAt,
    userProgress: normalizedProgress,
    submissions: normalizedSubmissions,
  };
}
