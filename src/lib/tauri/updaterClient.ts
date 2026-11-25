import { check } from "@tauri-apps/plugin-updater";
import { isTauriRuntime } from "./env";

export interface UpdateCheckStatus {
  status: "up_to_date" | "available" | "not_configured" | "error";
  message: string;
  availableVersion?: string;
}

export async function checkForUpdatesSafely(): Promise<UpdateCheckStatus> {
  if (!isTauriRuntime()) {
    return {
      status: "not_configured",
      message: "Update checks are available only in the packaged AlgoJava desktop application.",
    };
  }

  try {
    const update = await check({ timeout: 5000 });
    if (!update) {
      return {
        status: "up_to_date",
        message: "You are running the latest version of AlgoJava.",
      };
    }
    const version = update.version;
    await update.close();
    return {
      status: "available",
      availableVersion: version,
      message: `Version ${version} is available.`,
    };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    if (
      raw.toLowerCase().includes("endpoint") ||
      raw.toLowerCase().includes("pubkey") ||
      raw.toLowerCase().includes("empty")
    ) {
      return {
        status: "not_configured",
        message:
          "Offline build: no remote update server or signing public key is configured.",
      };
    }
    return {
      status: "error",
      message: `Unable to check for updates: ${raw}`,
    };
  }
}
