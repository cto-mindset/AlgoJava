import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS, useSettingsStore } from "@/stores/settingsStore";
import { useUpdaterStore } from "@/stores/updaterStore";
import { sanitizeUpdaterError } from "@/lib/tauri/updaterClient";

const mockCheckForAppUpdate = vi.fn();
const mockDownloadAndInstall = vi.fn();
const mockClearPending = vi.fn();
const mockRestartApp = vi.fn();

vi.mock("@/lib/tauri/updaterClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/tauri/updaterClient")>();
  return {
    ...actual,
    checkForAppUpdate: (...args: unknown[]) => mockCheckForAppUpdate(...args),
    downloadAndInstallPendingUpdate: (...args: unknown[]) =>
      mockDownloadAndInstall(...args),
    clearPendingUpdate: (...args: unknown[]) => mockClearPending(...args),
    restartApplication: (...args: unknown[]) => mockRestartApp(...args),
  };
});

describe("Updater store & safety guarantees", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({
      settings: {
        ...DEFAULT_SETTINGS,
        lastUpdateCheckAt: null,
        dismissedUpdateVersion: null,
      },
      hydrated: true,
    });
    useUpdaterStore.setState({
      status: "idle",
      availableUpdate: null,
      progress: { downloadedBytes: 0, totalBytes: null, percent: null },
      errorKind: null,
      errorMessage: null,
      notificationOpen: false,
      confirmOpen: false,
      autoCheckedSession: false,
    });
  });

  it("checks manually, updates lastUpdateCheckAt, and handles up-to-date state", async () => {
    mockCheckForAppUpdate.mockResolvedValue({
      status: "up_to_date",
      message: "You are running the latest version of AlgoJava.",
    });

    await useUpdaterStore.getState().checkManually();

    expect(useUpdaterStore.getState().status).toBe("up_to_date");
    expect(useSettingsStore.getState().settings.lastUpdateCheckAt).not.toBeNull();
    expect(useUpdaterStore.getState().notificationOpen).toBe(false);
  });

  it("prevents simultaneous manual checks while already checking", async () => {
    let resolveCheck!: (val: unknown) => void;
    mockCheckForAppUpdate.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCheck = resolve;
        })
    );

    const p1 = useUpdaterStore.getState().checkManually();
    const p2 = useUpdaterStore.getState().checkManually();

    expect(mockCheckForAppUpdate).toHaveBeenCalledTimes(1);
    expect(useUpdaterStore.getState().status).toBe("checking");

    resolveCheck({ status: "up_to_date", message: "Up to date" });
    await Promise.all([p1, p2]);
    expect(useUpdaterStore.getState().status).toBe("up_to_date");
  });

  it("handles offline checks gracefully during startup and manual checks", async () => {
    mockCheckForAppUpdate.mockResolvedValue({
      status: "offline",
      errorKind: "offline",
      message: "You appear to be offline.",
    });

    await useUpdaterStore.getState().runStartupCheck();
    expect(useUpdaterStore.getState().status).toBe("offline");
    expect(useUpdaterStore.getState().notificationOpen).toBe(false);
    expect(useUpdaterStore.getState().errorMessage).toBeNull();

    // Repeated startup check in same session does not re-trigger
    await useUpdaterStore.getState().runStartupCheck();
    expect(mockCheckForAppUpdate).toHaveBeenCalledTimes(1);

    await useUpdaterStore.getState().checkManually();
    expect(useUpdaterStore.getState().status).toBe("offline");
    expect(useUpdaterStore.getState().errorMessage).toContain("offline");
  });

  it("notifies once on startup update and respects Skip Version dismissal", async () => {
    mockCheckForAppUpdate.mockResolvedValue({
      status: "available",
      message: "Update available",
      update: {
        version: "1.1.0",
        currentVersion: "1.0.0-alpha.1",
        date: "2026-11-27T00:00:00Z",
        notes: "- Added new practice problems",
      },
    });

    await useUpdaterStore.getState().runStartupCheck();
    expect(useUpdaterStore.getState().notificationOpen).toBe(true);
    expect(useUpdaterStore.getState().availableUpdate?.version).toBe("1.1.0");

    // User clicks Skip Version -> persists dismissedUpdateVersion
    useUpdaterStore.getState().dismissNotification(true);
    expect(useUpdaterStore.getState().notificationOpen).toBe(false);
    expect(useSettingsStore.getState().settings.dismissedUpdateVersion).toBe(
      "1.1.0"
    );

    // Next session startup check with same dismissed version suppresses modal
    useUpdaterStore.setState({ autoCheckedSession: false });
    await useUpdaterStore.getState().runStartupCheck();
    expect(useUpdaterStore.getState().status).toBe("available");
    expect(useUpdaterStore.getState().notificationOpen).toBe(false);
  });

  it("requires explicit confirmation before downloading and tracks download progress", async () => {
    mockCheckForAppUpdate.mockResolvedValue({
      status: "available",
      message: "Update available",
      update: {
        version: "1.2.0",
        currentVersion: "1.0.0-alpha.1",
        notes: "Security fixes",
      },
    });
    mockDownloadAndInstall.mockImplementation(
      async (onProgress: (p: { downloadedBytes: number; totalBytes: number | null; percent: number | null }) => void) => {
        onProgress({ downloadedBytes: 500, totalBytes: 1000, percent: 50 });
        onProgress({ downloadedBytes: 1000, totalBytes: 1000, percent: 100 });
      }
    );

    await useUpdaterStore.getState().checkManually();
    expect(mockDownloadAndInstall).not.toHaveBeenCalled();

    useUpdaterStore.getState().openInstallConfirmation();
    expect(useUpdaterStore.getState().confirmOpen).toBe(true);
    expect(mockDownloadAndInstall).not.toHaveBeenCalled();

    await useUpdaterStore.getState().confirmDownloadAndInstall();
    expect(mockDownloadAndInstall).toHaveBeenCalledTimes(1);
    expect(useUpdaterStore.getState().status).toBe("installed");
    expect(useUpdaterStore.getState().progress.percent).toBe(100);
  });

  it("blocks invalid signatures and surfaces sanitized failure messages without crashing", async () => {
    mockCheckForAppUpdate.mockResolvedValue({
      status: "available",
      message: "Update available",
      update: {
        version: "1.2.0",
        currentVersion: "1.0.0-alpha.1",
        notes: "Test",
      },
    });
    mockDownloadAndInstall.mockRejectedValue(
      new Error("Signature verification failed: invalid minisign signature")
    );

    await useUpdaterStore.getState().checkManually();
    useUpdaterStore.getState().openInstallConfirmation();
    await useUpdaterStore.getState().confirmDownloadAndInstall();

    expect(mockClearPending).toHaveBeenCalled();
    expect(useUpdaterStore.getState().status).toBe("error");
    expect(useUpdaterStore.getState().errorKind).toBe("signature");
    expect(useUpdaterStore.getState().errorMessage).toContain("signature");

    const netSanitized = sanitizeUpdaterError(
      new Error("reqwest error: dns lookup failed for internal.host")
    );
    expect(netSanitized.kind).toBe("offline");
    expect(netSanitized.message).not.toContain("internal.host");

    const tlsSanitized = sanitizeUpdaterError(
      new Error("TLS certificate verify failed")
    );
    expect(tlsSanitized.kind).toBe("signature");
    expect(tlsSanitized.message).toContain("HTTPS");
  });

  it("handles download errors cleanly and allows retry without locking the store", async () => {
    mockCheckForAppUpdate.mockResolvedValue({
      status: "available",
      message: "Update available",
      update: {
        version: "1.2.0",
        currentVersion: "1.0.0-alpha.1",
        notes: "Retry test",
      },
    });
    mockDownloadAndInstall
      .mockRejectedValueOnce(new Error("The update download could not complete."))
      .mockResolvedValueOnce(undefined);

    await useUpdaterStore.getState().checkManually();
    useUpdaterStore.getState().openInstallConfirmation();
    await useUpdaterStore.getState().confirmDownloadAndInstall();

    expect(useUpdaterStore.getState().status).toBe("error");
    expect(useUpdaterStore.getState().errorKind).toBe("download");

    // Re-checking recovers cleanly
    await useUpdaterStore.getState().checkManually();
    expect(useUpdaterStore.getState().status).toBe("available");
    expect(useUpdaterStore.getState().errorMessage).toBeNull();
  });

  it("preserves legacy user settings during upgrade hydration without new updater fields", async () => {
    localStorage.setItem(
      "algojava.settings",
      JSON.stringify({
        userName: "Dylan",
        theme: "light",
        editorFontSize: 16,
      })
    );

    await useSettingsStore.getState().hydrateSettings();
    const hydrated = useSettingsStore.getState().settings;
    expect(hydrated.userName).toBe("Dylan");
    expect(hydrated.theme).toBe("light");
    expect(hydrated.editorFontSize).toBe(16);
    expect(hydrated.lastUpdateCheckAt).toBeNull();
    expect(hydrated.dismissedUpdateVersion).toBeNull();
  });
});
