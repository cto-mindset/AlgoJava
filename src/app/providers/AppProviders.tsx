import React, { useEffect } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { useSettingsStore } from "@/stores/settingsStore";
import { useJavaRuntimeStore } from "@/stores/javaRuntimeStore";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrateSettings = useSettingsStore((s) => s.hydrateSettings);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const customJdkPath = useSettingsStore((s) => s.settings.customJdkPath);
  const detectRuntime = useJavaRuntimeStore((s) => s.detectRuntime);

  useEffect(() => {
    void hydrateSettings();
  }, [hydrateSettings]);

  useEffect(() => {
    if (!hydrated) return;
    void detectRuntime(customJdkPath);
  }, [hydrated, customJdkPath, detectRuntime]);

  return <ThemeProvider>{children}</ThemeProvider>;
}
