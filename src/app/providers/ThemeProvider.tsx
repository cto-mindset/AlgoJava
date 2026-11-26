import React, { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import type { ThemeMode } from "@/types/models";

function resolveEffectiveTheme(mode: ThemeMode): "dark" | "light" {
  if (mode === "system") {
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }
    return "dark";
  }
  return mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.settings.theme);
  const accentColor = useSettingsStore((s) => s.settings.accentColor);
  const fontFamily = useSettingsStore((s) => s.settings.fontFamily);
  const editorFontFamily = useSettingsStore((s) => s.settings.editorFontFamily);
  const fontSize = useSettingsStore((s) => s.settings.fontSize);
  const animations = useSettingsStore((s) => s.settings.animations);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = resolveEffectiveTheme(theme);
      root.dataset.accent = accentColor;
      root.dataset.fontFamily = fontFamily;
      root.dataset.editorFont = editorFontFamily;
      root.dataset.fontScale = fontSize;
      root.dataset.animations = animations ? "on" : "off";
    };

    apply();

    if (theme === "system" && typeof window.matchMedia === "function") {
      const media = window.matchMedia("(prefers-color-scheme: light)");
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme, accentColor, fontFamily, editorFontFamily, fontSize, animations]);

  return <>{children}</>;
}
