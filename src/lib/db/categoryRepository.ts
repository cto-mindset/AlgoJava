import type { CategorySummary } from "@/types/models";
import { getDatabase } from "./client";

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent_color: string;
  is_featured: number;
  sort_order: number;
  total_problems: number;
  solved_problems: number;
}

export async function getCategoriesWithProgress(): Promise<CategorySummary[]> {
  const db = await getDatabase();
  const rows = await db.select<CategoryRow[]>(
    `SELECT
       c.id,
       c.name,
       c.description,
       c.icon,
       c.accent_color,
       c.is_featured,
       c.sort_order,
       COUNT(p.id) AS total_problems,
       COALESCE(SUM(CASE WHEN up.status = 'solved' THEN 1 ELSE 0 END), 0) AS solved_problems
     FROM categories c
     LEFT JOIN problems p ON p.category_id = c.id
     LEFT JOIN user_progress up ON up.problem_id = p.id
     GROUP BY c.id
     ORDER BY c.sort_order ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    accentColor: row.accent_color,
    isFeatured: Number(row.is_featured) === 1,
    sortOrder: Number(row.sort_order),
    totalProblems: Number(row.total_problems),
    solvedProblems: Number(row.solved_problems),
  }));
}
