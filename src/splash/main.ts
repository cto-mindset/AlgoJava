import "@fontsource-variable/outfit";
import "@fontsource-variable/jetbrains-mono";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface SplashProgressPayload {
  message: string;
  progress: number;
}

const statusEl = document.getElementById("splash-status");
const percentEl = document.getElementById("splash-percent");
const barEl = document.getElementById("splash-bar");

function applyProgress(message: string, progress: number): void {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  if (statusEl) statusEl.textContent = message;
  if (percentEl) percentEl.textContent = `${clamped}%`;
  if (barEl) barEl.style.width = `${clamped}%`;
}

function waitTwoFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function initSplash(): Promise<void> {
  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
    return;
  }

  void listen<SplashProgressPayload>("splash-progress", (event) => {
    if (event.payload) {
      applyProgress(event.payload.message, event.payload.progress);
    }
  }).catch(() => {});

  const fontsReady =
    typeof document !== "undefined" && document.fonts?.ready
      ? document.fonts.ready
      : Promise.resolve();

  await Promise.race([
    fontsReady,
    new Promise<void>((resolve) => window.setTimeout(resolve, 250)),
  ]);

  await waitTwoFrames();

  try {
    const cached = await invoke<SplashProgressPayload | null>(
      "show_splash_screen"
    );
    if (cached) {
      applyProgress(cached.message, cached.progress);
    }
  } catch {
    // Non-fatal fallback
  }
}

void initSplash();
