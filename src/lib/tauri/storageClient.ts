import { invoke } from "@tauri-apps/api/core";
import type { AppBuildInfo, ClearCacheResult, StorageInfo } from "@/types/models";
import { isTauriRuntime } from "./env";

export async function getStorageInfo(): Promise<StorageInfo> {
  if (!isTauriRuntime()) {
    return {
      storageDir: "Unavailable in browser preview",
      cacheDir: "Unavailable in browser preview",
      dbFilePath: "algojava.db",
      dbSizeBytes: 0,
      cacheSizeBytes: 0,
    };
  }
  return invoke<StorageInfo>("get_storage_info");
}

export async function clearAppCache(): Promise<ClearCacheResult> {
  if (!isTauriRuntime()) {
    return { clearedBytes: 0, removedEntries: 0 };
  }
  return invoke<ClearCacheResult>("clear_app_cache");
}

export async function exportProgressFile(
  path: string,
  payloadJson: string
): Promise<number> {
  if (!isTauriRuntime()) {
    throw new Error("File export requires the AlgoJava desktop runtime.");
  }
  return invoke<number>("export_progress_file", { path, payloadJson });
}

export async function importProgressFile(path: string): Promise<string> {
  if (!isTauriRuntime()) {
    throw new Error("File import requires the AlgoJava desktop runtime.");
  }
  return invoke<string>("import_progress_file", { path });
}

export async function getAppBuildInfo(): Promise<AppBuildInfo> {
  if (!isTauriRuntime()) {
    return {
      appVersion: "1.0.0",
      buildDate: "2026.11.27",
      tauriVersion: "2.x",
      rustEdition: "2024",
      targetOs: "windows",
      targetArch: "x86_64",
      buildProfile: "browser",
    };
  }
  return invoke<AppBuildInfo>("get_app_build_info");
}
