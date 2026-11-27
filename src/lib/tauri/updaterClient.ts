import { invoke } from "@tauri-apps/api/core";
import { check, type DownloadEvent, type Update } from "@tauri-apps/plugin-updater";
import { isTauriRuntime } from "./env";

export interface AvailableUpdateInfo {
  version: string;
  currentVersion: string;
  date?: string;
  notes: string;
}

export interface UpdateDownloadProgress {
  downloadedBytes: number;
  totalBytes: number | null;
  percent: number | null;
}

export type UpdateErrorKind =
  | "offline"
  | "signature"
  | "not_configured"
  | "download"
  | "unknown";

export interface UpdateCheckResult {
  status: "up_to_date" | "available" | "offline" | "not_configured" | "error";
  message: string;
  update?: AvailableUpdateInfo;
  errorKind?: UpdateErrorKind;
}

export interface SanitizedUpdaterError {
  kind: UpdateErrorKind;
  message: string;
}

let pendingUpdateHandle: Update | null = null;

/**
 * Releases any previously fetched Tauri `Update` resource cleanly.
 */
export async function clearPendingUpdate(): Promise<void> {
  if (!pendingUpdateHandle) return;
  const handle = pendingUpdateHandle;
  pendingUpdateHandle = null;
  try {
    await handle.close();
  } catch {
    // Ignore cleanup errors when releasing stale update resources.
  }
}

/**
 * Checks via native Rust command whether both an Ed25519 public key and HTTPS
 * update endpoint are configured in the running bundle.
 */
export async function isUpdaterConfigured(): Promise<boolean> {
  if (!isTauriRuntime()) {
    return false;
  }
  try {
    return await invoke<boolean>("is_updater_configured");
  } catch {
    return false;
  }
}

/**
 * Maps raw updater exceptions to safe user-facing messages without exposing
 * endpoints, tokens, paths, or raw internals.
 */
export function sanitizeUpdaterError(err: unknown): SanitizedUpdaterError {
  const raw = (err instanceof Error ? err.message : String(err)).toLowerCase();

  if (
    raw.includes("signature") ||
    raw.includes("minisign") ||
    raw.includes("pubkey") ||
    raw.includes("signed version") ||
    raw.includes("signedversion") ||
    raw.includes("verification") ||
    raw.includes("decode")
  ) {
    if (raw.includes("empty")) {
      return {
        kind: "not_configured",
        message: "Automatic updates are not configured in this build.",
      };
    }
    return {
      kind: "signature",
      message:
        "Update security verification failed. The package signature did not match and installation was blocked.",
    };
  }

  if (
    raw.includes("endpoint") ||
    raw.includes("empty") ||
    raw.includes("not configured")
  ) {
    return {
      kind: "not_configured",
      message: "Automatic updates are not configured in this build.",
    };
  }

  if (
    raw.includes("network") ||
    raw.includes("offline") ||
    raw.includes("dns") ||
    raw.includes("timeout") ||
    raw.includes("timed out") ||
    raw.includes("connect") ||
    raw.includes("reqwest") ||
    raw.includes("lookup") ||
    raw.includes("tls") ||
    raw.includes("certificate")
  ) {
    return {
      kind: "offline",
      message:
        "Unable to reach the update server. Check your internet connection and try again.",
    };
  }

  if (
    raw.includes("download") ||
    raw.includes("status") ||
    raw.includes("http") ||
    raw.includes("io")
  ) {
    return {
      kind: "download",
      message: "The update download could not complete. Please try again later.",
    };
  }

  return {
    kind: "unknown",
    message: "Unable to complete the update check right now. Please try again later.",
  };
}

function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * Performs a safe update check and retains the verified `Update` handle in memory
 * until the user confirms installation or dismisses/clears it.
 */
export async function checkForAppUpdate(options?: {
  timeoutMs?: number;
}): Promise<UpdateCheckResult> {
  if (!isTauriRuntime()) {
    return {
      status: "not_configured",
      errorKind: "not_configured",
      message: "Update checks are available only in the packaged AlgoJava desktop application.",
    };
  }

  const configured = await isUpdaterConfigured();
  if (!configured) {
    await clearPendingUpdate();
    return {
      status: "not_configured",
      errorKind: "not_configured",
      message: "Updates are not enabled yet in this build (missing signing key or endpoint).",
    };
  }

  if (isBrowserOffline()) {
    return {
      status: "offline",
      errorKind: "offline",
      message: "You appear to be offline. Connect to the internet to check for updates.",
    };
  }

  try {
    await clearPendingUpdate();
    const update = await check({ timeout: options?.timeoutMs ?? 8000 });
    if (!update) {
      return {
        status: "up_to_date",
        message: "You are running the latest version of AlgoJava.",
      };
    }

    pendingUpdateHandle = update;
    return {
      status: "available",
      message: `AlgoJava v${update.version} is ready to download.`,
      update: {
        version: update.version,
        currentVersion: update.currentVersion,
        date: update.date,
        notes:
          update.body?.trim() ||
          `AlgoJava ${update.version} is available with stability and security updates.`,
      },
    };
  } catch (err) {
    await clearPendingUpdate();
    const sanitized = sanitizeUpdaterError(err);
    if (sanitized.kind === "offline") {
      return {
        status: "offline",
        errorKind: "offline",
        message: sanitized.message,
      };
    }
    if (sanitized.kind === "not_configured") {
      return {
        status: "not_configured",
        errorKind: "not_configured",
        message: sanitized.message,
      };
    }
    return {
      status: "error",
      errorKind: sanitized.kind,
      message: sanitized.message,
    };
  }
}

/**
 * Downloads, verifies signature/version, and installs the currently staged update.
 * Caller must ensure explicit user confirmation before invoking this function.
 */
export async function downloadAndInstallPendingUpdate(
  onProgress: (progress: UpdateDownloadProgress) => void
): Promise<void> {
  const handle = pendingUpdateHandle;
  if (!handle) {
    throw new Error("No pending update is available. Check for updates again.");
  }

  let totalBytes: number | null = null;
  let downloadedBytes = 0;

  try {
    await handle.downloadAndInstall(
      (event: DownloadEvent) => {
        if (event.event === "Started") {
          totalBytes =
            typeof event.data.contentLength === "number" &&
            event.data.contentLength > 0
              ? event.data.contentLength
              : null;
          downloadedBytes = 0;
          onProgress({
            downloadedBytes,
            totalBytes,
            percent: totalBytes ? 0 : null,
          });
        } else if (event.event === "Progress") {
          downloadedBytes += event.data.chunkLength;
          const percent = totalBytes
            ? Math.min(100, Math.round((downloadedBytes / totalBytes) * 100))
            : null;
          onProgress({
            downloadedBytes,
            totalBytes,
            percent,
          });
        } else if (event.event === "Finished") {
          onProgress({
            downloadedBytes: totalBytes ?? downloadedBytes,
            totalBytes,
            percent: 100,
          });
        }
      },
      { restartAfterInstall: true }
    );
  } catch (err) {
    const sanitized = sanitizeUpdaterError(err);
    throw new Error(sanitized.message);
  } finally {
    await clearPendingUpdate();
  }
}

/**
 * Restarts the desktop application cleanly after an update finishes installing.
 */
export async function restartApplication(): Promise<void> {
  if (!isTauriRuntime()) return;
  await invoke("restart_app");
}

/**
 * Backward-compatible alias for single-shot safe update checking.
 */
export async function checkForUpdatesSafely(): Promise<{
  status: "up_to_date" | "available" | "not_configured" | "error";
  message: string;
  availableVersion?: string;
}> {
  const result = await checkForAppUpdate({ timeoutMs: 5000 });
  if (result.status === "offline") {
    return { status: "error", message: result.message };
  }
  return {
    status: result.status,
    message: result.message,
    availableVersion: result.update?.version,
  };
}
