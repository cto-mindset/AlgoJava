import "@fontsource-variable/outfit";
import "@fontsource-variable/jetbrains-mono";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface SplashProgressPayload {
  message: string;
  progress: number;
}

const STAGE_THRESHOLDS: Array<{ key: string; min: number; doneAt: number }> = [
  { key: "preferences", min: 0, doneAt: 55 },
  { key: "database", min: 55, doneAt: 82 },
  { key: "jdk", min: 82, doneAt: 100 },
  { key: "workspace", min: 100, doneAt: 101 },
];

const statusEl = document.getElementById("splash-status");
const percentEl = document.getElementById("splash-percent");
const barEl = document.getElementById("splash-bar");

function updateChecklistStages(clamped: number): void {
  for (const stage of STAGE_THRESHOLDS) {
    const el = document.querySelector<HTMLElement>(`[data-stage="${stage.key}"]`);
    if (!el) continue;

    if (clamped >= stage.doneAt) {
      el.dataset.state = "done";
    } else if (clamped >= stage.min) {
      el.dataset.state = "active";
    } else {
      el.dataset.state = "pending";
    }
  }
}

function applyProgress(message: string, progress: number): void {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  if (statusEl) statusEl.textContent = message;
  if (percentEl) percentEl.textContent = `${clamped}%`;
  if (barEl) barEl.style.width = `${clamped}%`;
  updateChecklistStages(clamped);
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
