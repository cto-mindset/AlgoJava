import { describe, expect, it } from "vitest";
import { formatBytes, formatDurationMs } from "@/lib/utils/format";
import { calculateCurrentStreak, evaluateAchievements } from "@/lib/utils/stats";
import { validateProgressExportBundle } from "@/lib/validation/importExportValidation";

describe("Formatting utilities", () => {
  it("formats bytes cleanly across units", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(2.4 * 1024 * 1024)).toBe("2.4 MB");
  });

  it("formats execution durations", () => {
    expect(formatDurationMs(42)).toBe("42 ms");
    expect(formatDurationMs(1500)).toBe("1.50s");
    expect(formatDurationMs(65_000)).toBe("1m 5s");
  });
});

describe("Progress statistics calculations", () => {
  it("computes consecutive day streaks up to today or yesterday", () => {
    const now = new Date(2026, 10, 25, 14, 0, 0);
    const dates = [
      new Date(2026, 10, 25, 9, 0, 0).toISOString(),
      new Date(2026, 10, 24, 18, 0, 0).toISOString(),
      new Date(2026, 10, 23, 10, 0, 0).toISOString(),
      new Date(2026, 10, 20, 10, 0, 0).toISOString(),
    ];
    expect(calculateCurrentStreak(dates, now)).toBe(3);

    const staleDates = [new Date(2026, 10, 22, 10, 0, 0).toISOString()];
    expect(calculateCurrentStreak(staleDates, now)).toBe(0);
  });

  it("evaluates milestone achievements accurately", () => {
    const list = evaluateAchievements({
      solvedProblems: 26,
      totalProblems: 47,
      overallPercentage: 55,
      currentStreakDays: 3,
      completedCategoriesCount: 1,
      passedSubmissionsCount: 28,
    });

    const byId = Object.fromEntries(list.map((a) => [a.id, a]));
    expect(byId["first-steps"].unlocked).toBe(true);
    expect(byId["code-warrior"].unlocked).toBe(true);
    expect(byId["algorithmist"].unlocked).toBe(false);
    expect(byId["streak-builder"].unlocked).toBe(true);
    expect(byId["category-master"].unlocked).toBe(true);
  });
});

describe("Import/export backup validation", () => {
  it("accepts a valid AlgoJava backup bundle", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      appName: "AlgoJava",
      exportedAt: "2026-11-25T18:00:00Z",
      userProgress: [
        {
          problemId: "warmup-01",
          status: "solved",
          bookmarked: true,
          draftCode: "public class Solution {}",
          notes: "O(1)",
          attemptsCount: 2,
          solvedCount: 1,
          bestRuntimeMs: 14,
          firstSolvedAt: "2026-11-25T17:00:00Z",
          lastAttemptedAt: "2026-11-25T17:00:00Z",
          updatedAt: "2026-11-25T17:00:00Z",
        },
      ],
      submissions: [
        {
          id: "sub-1",
          problemId: "warmup-01",
          sourceCode: "public class Solution {}",
          status: "passed",
          passedCount: 5,
          totalCount: 5,
          executionTimeMs: 14,
          compilerOutput: "",
          stdout: "",
          stderr: "",
          submittedAt: "2026-11-25T17:00:00Z",
        },
      ],
    });

    const parsed = validateProgressExportBundle(raw);
    expect(parsed.userProgress).toHaveLength(1);
    expect(parsed.submissions).toHaveLength(1);
  });

  it("rejects malformed JSON and unsupported schema versions", () => {
    expect(() => validateProgressExportBundle("{broken")).toThrow();
    expect(() =>
      validateProgressExportBundle(
        JSON.stringify({ schemaVersion: 99, appName: "Other" })
      )
    ).toThrow();
  });
});
