import { create } from "zustand";
import { load, type Store } from "@tauri-apps/plugin-store";
import { isTauriRuntime } from "@/lib/tauri/env";
import type { AppSettings } from "@/types/models";

const SETTINGS_FILE = "settings.json";
const SETTINGS_KEY = "preferences";

export const DEFAULT_SETTINGS: AppSettings = {
  userName: "Developer",
  theme: "dark",
  accentColor: "violet",
  fontFamily: "outfit",
  fontSize: "md",
  sidebarCollapsed: false,
  animations: true,

  editorFontFamily: "jetbrains-mono",
  editorFontSize: 14,
  tabSize: 4,
  lineNumbers: true,
  bracketPairColorization: true,
  wordWrap: false,
  minimap: false,
  autoIndent: true,
  autoSave: true,

  customJdkPath: "",
  executionTimeoutSeconds: 15,
  memoryLimitMb: 512,

  autoOpenNextProblem: false,
  showHintsByDefault: true,
  showTestResultsAutomatically: true,
  confirmBeforeResettingCode: true,
  rememberLastCategory: true,
  showSolvedProblems: true,
  lastCategoryId: null,
};

let storeInstancePromise: Promise<Store> | null = null;

function getPreferencesStore(): Promise<Store> {
  if (!storeInstancePromise) {
    storeInstancePromise = load(SETTINGS_FILE, {
      defaults: { [SETTINGS_KEY]: DEFAULT_SETTINGS },
      autoSave: 150,
    });
  }
  return storeInstancePromise;
}

async function persistSettings(settings: AppSettings): Promise<void> {
  if (!isTauriRuntime()) {
    try {
      localStorage.setItem("algojava.settings", JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors in non-desktop environments.
    }
    return;
  }

  const store = await getPreferencesStore();
  await store.set(SETTINGS_KEY, settings);
  await store.save();
}

interface SettingsState {
  settings: AppSettings;
  hydrated: boolean;
  hydrateSettings: () => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  resetRuntimeSettings: () => Promise<void>;
  resetAllSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  hydrated: false,

  hydrateSettings: async () => {
    try {
      let stored: Partial<AppSettings> | undefined;
      if (isTauriRuntime()) {
        const store = await getPreferencesStore();
        stored = await store.get<Partial<AppSettings>>(SETTINGS_KEY);
      } else {
        const raw = localStorage.getItem("algojava.settings");
        if (raw) {
          stored = JSON.parse(raw) as Partial<AppSettings>;
        }
      }

      const merged: AppSettings = {
        ...DEFAULT_SETTINGS,
        ...(stored ?? {}),
      };
      set({ settings: merged, hydrated: true });
    } catch {
      set({ settings: DEFAULT_SETTINGS, hydrated: true });
    }
  },

  updateSettings: async (patch) => {
    const next: AppSettings = {
      ...get().settings,
      ...patch,
    };
    set({ settings: next });
    await persistSettings(next);
  },

  resetRuntimeSettings: async () => {
    await get().updateSettings({
      customJdkPath: DEFAULT_SETTINGS.customJdkPath,
      executionTimeoutSeconds: DEFAULT_SETTINGS.executionTimeoutSeconds,
      memoryLimitMb: DEFAULT_SETTINGS.memoryLimitMb,
    });
  },

  resetAllSettings: async () => {
    set({ settings: DEFAULT_SETTINGS });
    await persistSettings(DEFAULT_SETTINGS);
  },
}));
