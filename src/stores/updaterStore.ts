import { create } from "zustand";
import {
  checkForAppUpdate,
  clearPendingUpdate,
  downloadAndInstallPendingUpdate,
  restartApplication,
  type AvailableUpdateInfo,
  type UpdateDownloadProgress,
  type UpdateErrorKind,
} from "@/lib/tauri/updaterClient";
import { useSettingsStore } from "./settingsStore";

export type UpdaterUiStatus =
  | "idle"
  | "checking"
  | "up_to_date"
  | "available"
  | "downloading"
  | "installing"
  | "installed"
  | "offline"
  | "not_configured"
  | "error";

interface UpdaterStoreState {
  status: UpdaterUiStatus;
  availableUpdate: AvailableUpdateInfo | null;
  progress: UpdateDownloadProgress;
  errorKind: UpdateErrorKind | null;
  errorMessage: string | null;
  notificationOpen: boolean;
  confirmOpen: boolean;
  autoCheckedSession: boolean;

  runStartupCheck: () => Promise<void>;
  checkManually: () => Promise<void>;
  openNotification: () => void;
  dismissNotification: (skipVersion?: boolean) => void;
  openInstallConfirmation: () => void;
  closeInstallConfirmation: () => void;
  confirmDownloadAndInstall: () => Promise<void>;
  restartNow: () => Promise<void>;
  resetError: () => void;
}

const INITIAL_PROGRESS: UpdateDownloadProgress = {
  downloadedBytes: 0,
  totalBytes: null,
  percent: null,
};

function isBusyStatus(status: UpdaterUiStatus): boolean {
  return (
    status === "checking" ||
    status === "downloading" ||
    status === "installing"
  );
}

export const useUpdaterStore = create<UpdaterStoreState>((set, get) => ({
  status: "idle",
  availableUpdate: null,
  progress: INITIAL_PROGRESS,
  errorKind: null,
  errorMessage: null,
  notificationOpen: false,
  confirmOpen: false,
  autoCheckedSession: false,

  runStartupCheck: async () => {
    const state = get();
    if (state.autoCheckedSession || isBusyStatus(state.status)) {
      return;
    }

    set({ autoCheckedSession: true, status: "checking", errorKind: null, errorMessage: null });

    const res = await checkForAppUpdate({ timeoutMs: 8000 });
    if (res.status === "up_to_date") {
      await useSettingsStore
        .getState()
        .updateSettings({ lastUpdateCheckAt: new Date().toISOString() })
        .catch(() => {});
      set({
        status: "up_to_date",
        availableUpdate: null,
        errorKind: null,
        errorMessage: null,
      });
      return;
    }

    if (res.status === "available" && res.update) {
      await useSettingsStore
        .getState()
        .updateSettings({ lastUpdateCheckAt: new Date().toISOString() })
        .catch(() => {});
      const dismissed =
        useSettingsStore.getState().settings.dismissedUpdateVersion;
      const shouldNotify = dismissed !== res.update.version;
      set({
        status: "available",
        availableUpdate: res.update,
        notificationOpen: shouldNotify,
        errorKind: null,
        errorMessage: null,
      });
      return;
    }

    // Automatic startup checks handle offline / not_configured / network errors silently.
    set({
      status: res.status === "offline" ? "offline" : res.status === "not_configured" ? "not_configured" : "idle",
      availableUpdate: null,
      errorKind: null,
      errorMessage: null,
    });
  },

  checkManually: async () => {
    if (isBusyStatus(get().status)) {
      return;
    }

    set({
      status: "checking",
      errorKind: null,
      errorMessage: null,
      progress: INITIAL_PROGRESS,
    });

    const res = await checkForAppUpdate({ timeoutMs: 10000 });

    if (res.status === "up_to_date") {
      await useSettingsStore
        .getState()
        .updateSettings({ lastUpdateCheckAt: new Date().toISOString() })
        .catch(() => {});
      set({
        status: "up_to_date",
        availableUpdate: null,
        errorKind: null,
        errorMessage: null,
      });
      return;
    }

    if (res.status === "available" && res.update) {
      await useSettingsStore
        .getState()
        .updateSettings({
          lastUpdateCheckAt: new Date().toISOString(),
          dismissedUpdateVersion: null,
        })
        .catch(() => {});
      set({
        status: "available",
        availableUpdate: res.update,
        errorKind: null,
        errorMessage: null,
      });
      return;
    }

    if (res.status === "offline") {
      set({
        status: "offline",
        errorKind: "offline",
        errorMessage: res.message,
      });
      return;
    }

    if (res.status === "not_configured") {
      set({
        status: "not_configured",
        errorKind: "not_configured",
        errorMessage: res.message,
      });
      return;
    }

    set({
      status: "error",
      errorKind: res.errorKind ?? "unknown",
      errorMessage: res.message,
    });
  },

  openNotification: () => {
    if (get().availableUpdate) {
      set({ notificationOpen: true });
    }
  },

  dismissNotification: (skipVersion = false) => {
    const version = get().availableUpdate?.version;
    if (skipVersion && version) {
      void useSettingsStore
        .getState()
        .updateSettings({ dismissedUpdateVersion: version })
        .catch(() => {});
    }
    set({ notificationOpen: false, confirmOpen: false });
  },

  openInstallConfirmation: () => {
    const { status, availableUpdate } = get();
    if (!availableUpdate || isBusyStatus(status)) return;
    set({ confirmOpen: true, notificationOpen: false });
  },

  closeInstallConfirmation: () => {
    if (get().status === "downloading" || get().status === "installing") return;
    set({ confirmOpen: false });
  },

  confirmDownloadAndInstall: async () => {
    const { status, availableUpdate } = get();
    if (!availableUpdate || isBusyStatus(status)) {
      return;
    }

    set({
      status: "downloading",
      confirmOpen: true,
      notificationOpen: false,
      errorKind: null,
      errorMessage: null,
      progress: { downloadedBytes: 0, totalBytes: null, percent: 0 },
    });

    try {
      await downloadAndInstallPendingUpdate((nextProgress) => {
        const isDone = nextProgress.percent === 100;
        set({
          status: isDone ? "installing" : "downloading",
          progress: nextProgress,
        });
      });

      set({
        status: "installed",
        progress: { ...get().progress, percent: 100 },
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Update installation failed. Please try again later.";
      await clearPendingUpdate();
      set({
        status: "error",
        errorKind: msg.toLowerCase().includes("signature")
          ? "signature"
          : "download",
        errorMessage: msg,
      });
    }
  },

  restartNow: async () => {
    await restartApplication();
  },

  resetError: () => {
    set({ errorKind: null, errorMessage: null });
  },
}));
