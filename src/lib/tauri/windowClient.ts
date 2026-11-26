import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isTauriRuntime } from "./env";

export async function minimizeAppWindow(): Promise<void> {
  if (!isTauriRuntime()) return;
  await getCurrentWindow().minimize();
}

export async function toggleMaximizeAppWindow(): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  const win = getCurrentWindow();
  await win.toggleMaximize();
  return win.isMaximized();
}

export async function isAppWindowMaximized(): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  return getCurrentWindow().isMaximized();
}

export async function closeAppWindow(): Promise<void> {
  if (!isTauriRuntime()) return;
  await getCurrentWindow().close();
}

export async function updateSplashStatus(
  message: string,
  progress: number
): Promise<void> {
  if (!isTauriRuntime()) return;
  await invoke("update_splash_status", { message, progress });
}

export async function finishSplashScreen(): Promise<void> {
  if (!isTauriRuntime()) return;
  await invoke("finish_splash_screen");
}
