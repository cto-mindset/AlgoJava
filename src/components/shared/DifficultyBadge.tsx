import { Badge } from "@/components/ui/Badge";
import type { Difficulty } from "@/types/models";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const tone =
    difficulty === "Easy"
      ? "success"
      : difficulty === "Medium"
      ? "warning"
      : "info";

  return (
    <Badge tone={tone} className={className}>
      {difficulty}
    </Badge>
  );
}
