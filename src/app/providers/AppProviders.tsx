import React, { useEffect, useRef } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { getDatabase } from "@/lib/db/client";
import { isTauriRuntime } from "@/lib/tauri/env";
import {
  finishSplashScreen,
  updateSplashStatus,
} from "@/lib/tauri/windowClient";
import { useJavaRuntimeStore } from "@/stores/javaRuntimeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUpdaterStore } from "@/stores/updaterStore";

const MIN_SPLASH_MS = 950;
const STARTUP_UPDATE_DELAY_MS = 6000;

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrateSettings = useSettingsStore((s) => s.hydrateSettings);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const customJdkPath = useSettingsStore((s) => s.settings.customJdkPath);
  const detectRuntime = useJavaRuntimeStore((s) => s.detectRuntime);

  const initialBootDoneRef = useRef(false);
  const prevJdkPathRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootWorkspace = async () => {
      const startedAt =
        typeof performance !== "undefined" ? performance.now() : Date.now();

      try {
        await updateSplashStatus("Loading workspace preferences...", 25);
        await hydrateSettings();
        if (cancelled) return;

        await updateSplashStatus("Opening local SQLite database...", 55);
        if (isTauriRuntime()) {
          await getDatabase().catch(() => {});
        }
        if (cancelled) return;

        await updateSplashStatus("Detecting local Java JDK runtime...", 82);
        const latestJdkPath =
          useSettingsStore.getState().settings.customJdkPath;
        await detectRuntime(latestJdkPath);
        if (cancelled) return;

        await updateSplashStatus("Launching AlgoJava workspace...", 100);
        if (isTauriRuntime()) {
          const now =
            typeof performance !== "undefined" ? performance.now() : Date.now();
          const remaining = MIN_SPLASH_MS - (now - startedAt);
          if (remaining > 0) {
            await new Promise<void>((resolve) => {
              window.setTimeout(resolve, remaining);
            });
          }
        }
      } finally {
        if (!cancelled) {
          initialBootDoneRef.current = true;
          prevJdkPathRef.current =
            useSettingsStore.getState().settings.customJdkPath;
          await finishSplashScreen().catch(() => {});
        }
      }
    };

    void bootWorkspace();

    return () => {
      cancelled = true;
    };
  }, [hydrateSettings, detectRuntime]);

  useEffect(() => {
    if (!hydrated || !initialBootDoneRef.current) return;
    if (customJdkPath === prevJdkPathRef.current) return;
    prevJdkPathRef.current = customJdkPath;
    void detectRuntime(customJdkPath);
  }, [hydrated, customJdkPath, detectRuntime]);

  useEffect(() => {
    if (!hydrated || !isTauriRuntime()) return;
    const timer = window.setTimeout(() => {
      void useUpdaterStore.getState().runStartupCheck();
    }, STARTUP_UPDATE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated]);

  return <ThemeProvider>{children}</ThemeProvider>;
}
