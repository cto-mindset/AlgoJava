import { openPath, openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";
import { isTauriRuntime } from "./env";

export async function openExternalUrl(url: string): Promise<void> {
  if (!isTauriRuntime()) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  await openUrl(url);
}

export async function openLocalDirectory(dirPath: string): Promise<void> {
  if (!isTauriRuntime() || !dirPath) return;
  try {
    await revealItemInDir(dirPath);
  } catch {
    await openPath(dirPath);
  }
}
