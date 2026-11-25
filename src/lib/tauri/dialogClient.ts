import { open, save } from "@tauri-apps/plugin-dialog";
import { isTauriRuntime } from "./env";

export async function pickJdkFolder(defaultPath?: string): Promise<string | null> {
  if (!isTauriRuntime()) return null;
  const selected = await open({
    title: "Select JDK Installation Folder",
    directory: true,
    multiple: false,
    defaultPath: defaultPath || undefined,
  });
  return typeof selected === "string" ? selected : null;
}

export async function pickExportJsonPath(defaultPath: string): Promise<string | null> {
  if (!isTauriRuntime()) return null;
  return save({
    title: "Export AlgoJava Progress",
    defaultPath,
    filters: [{ name: "JSON Backup", extensions: ["json"] }],
  });
}

export async function pickImportJsonPath(): Promise<string | null> {
  if (!isTauriRuntime()) return null;
  const selected = await open({
    title: "Import AlgoJava Progress",
    multiple: false,
    directory: false,
    filters: [{ name: "JSON Backup", extensions: ["json"] }],
  });
  return typeof selected === "string" ? selected : null;
}
