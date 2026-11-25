import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, useSettingsStore } from "@/stores/settingsStore";

describe("Settings Store", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({
      settings: DEFAULT_SETTINGS,
      hydrated: false,
    });
  });

  it("updates appearance and editor settings and persists locally", async () => {
    await useSettingsStore.getState().hydrateSettings();
    await useSettingsStore.getState().updateSettings({
      theme: "light",
      accentColor: "blue",
      tabSize: 2,
    });

    const { settings } = useSettingsStore.getState();
    expect(settings.theme).toBe("light");
    expect(settings.accentColor).toBe("blue");
    expect(settings.tabSize).toBe(2);
  });

  it("resets only runtime settings when resetRuntimeSettings is called", async () => {
    await useSettingsStore.getState().updateSettings({
      theme: "light",
      customJdkPath: "C:\\Java\\jdk-21",
      executionTimeoutSeconds: 60,
      memoryLimitMb: 1024,
    });

    await useSettingsStore.getState().resetRuntimeSettings();
    const { settings } = useSettingsStore.getState();
    expect(settings.theme).toBe("light");
    expect(settings.customJdkPath).toBe("");
    expect(settings.executionTimeoutSeconds).toBe(DEFAULT_SETTINGS.executionTimeoutSeconds);
    expect(settings.memoryLimitMb).toBe(DEFAULT_SETTINGS.memoryLimitMb);
  });
});
