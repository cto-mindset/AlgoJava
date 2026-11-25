import { formatDistanceToNow, parseISO } from "date-fns";
import type { EditorFontFamily } from "@/types/models";

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIdx = 0;
  while (value >= 1024 && unitIdx < units.length - 1) {
    value /= 1024;
    unitIdx++;
  }
  return `${value >= 10 || unitIdx === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIdx]}`;
}

export function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0 ms";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins === 0) return `${(ms / 1000).toFixed(2)}s`;
  const hours = Math.floor(mins / 60);
  if (hours === 0) return `${mins}m ${secs}s`;
  return `${hours}h ${mins % 60}m`;
}

export function formatRelativeTimestamp(isoString: string): string {
  try {
    const parsed = parseISO(isoString);
    if (Number.isNaN(parsed.getTime())) return isoString;
    return formatDistanceToNow(parsed, { addSuffix: true });
  } catch {
    return isoString;
  }
}

export function resolveEditorFontCss(family: EditorFontFamily): string {
  switch (family) {
    case "geist-mono":
      return "'Geist Mono Variable', Consolas, monospace";
    case "google-sans-code":
      return "'Google Sans Code Variable', Consolas, monospace";
    case "jetbrains-mono":
    default:
      return "'JetBrains Mono Variable', Consolas, monospace";
  }
}
