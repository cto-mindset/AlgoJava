import {
  IconArrowsSort,
  IconBinaryTree,
  IconChartBar,
  IconCode,
  IconCube,
  IconLetterT,
  IconRefresh,
  IconRocket,
  IconSearch,
  IconStar,
} from "@tabler/icons-react";

interface CategoryIconProps {
  icon: string;
  color?: string;
  size?: number;
}

export function CategoryIcon({ icon, color, size = 20 }: CategoryIconProps) {
  const style = color ? { color } : undefined;

  switch (icon) {
    case "rocket":
      return <IconRocket size={size} style={style} />;
    case "letter-t":
      return <IconLetterT size={size} style={style} />;
    case "cube":
      return <IconCube size={size} style={style} />;
    case "binary-tree":
      return <IconBinaryTree size={size} style={style} />;
    case "chart-bar":
      return <IconChartBar size={size} style={style} />;
    case "refresh":
      return <IconRefresh size={size} style={style} />;
    case "arrows-sort":
      return <IconArrowsSort size={size} style={style} />;
    case "search":
      return <IconSearch size={size} style={style} />;
    case "star":
      return <IconStar size={size} style={style} />;
    default:
      return <IconCode size={size} style={style} />;
  }
}
