import type { AchievementItem } from "@/types/models";

/**
 * Compute consecutive active days ending today or yesterday (UTC local calendar date strings `YYYY-MM-DD`).
 */
export function calculateCurrentStreak(
  activityDatesIso: string[],
  now: Date = new Date()
): number {
  if (activityDatesIso.length === 0) return 0;

  const daySet = new Set<string>();
  for (const iso of activityDatesIso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      daySet.add(toLocalDayKey(d));
    }
  }
  if (daySet.size === 0) return 0;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = toLocalDayKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toLocalDayKey(yesterday);

  let cursor: Date;
  if (daySet.has(todayKey)) {
    cursor = today;
  } else if (daySet.has(yesterdayKey)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (daySet.has(toLocalDayKey(cursor))) {
    streak++;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return streak;
}

export function toLocalDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface AchievementInput {
  solvedProblems: number;
  totalProblems: number;
  overallPercentage: number;
  currentStreakDays: number;
  completedCategoriesCount: number;
  passedSubmissionsCount: number;
}

export function evaluateAchievements(input: AchievementInput): AchievementItem[] {
  return [
    {
      id: "first-steps",
      title: "First Steps",
      description: "Solve your first problem",
      unlocked: input.solvedProblems >= 1,
      currentValue: Math.min(input.solvedProblems, 1),
      targetValue: 1,
      tone: "emerald",
    },
    {
      id: "code-warrior",
      title: "Code Warrior",
      description: "Solve 25 problems",
      unlocked: input.solvedProblems >= 25,
      currentValue: Math.min(input.solvedProblems, 25),
      targetValue: 25,
      tone: "violet",
    },
    {
      id: "algorithmist",
      title: "Algorithmist",
      description: "Reach 70% progress",
      unlocked: input.overallPercentage >= 70,
      currentValue: Math.min(input.overallPercentage, 70),
      targetValue: 70,
      tone: "amber",
    },
    {
      id: "streak-builder",
      title: "Streak Builder",
      description: "Practice 3 consecutive days",
      unlocked: input.currentStreakDays >= 3,
      currentValue: Math.min(input.currentStreakDays, 3),
      targetValue: 3,
      tone: "blue",
    },
    {
      id: "category-master",
      title: "Category Master",
      description: "Complete every problem in a category",
      unlocked: input.completedCategoriesCount >= 1,
      currentValue: Math.min(input.completedCategoriesCount, 1),
      targetValue: 1,
      tone: "emerald",
    },
    {
      id: "sharp-shooter",
      title: "Sharp Shooter",
      description: "Pass 10 submissions cleanly",
      unlocked: input.passedSubmissionsCount >= 10,
      currentValue: Math.min(input.passedSubmissionsCount, 10),
      targetValue: 10,
      tone: "violet",
    },
  ];
}
