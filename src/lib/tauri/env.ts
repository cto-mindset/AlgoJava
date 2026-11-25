export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function formatNativeError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const record = err as Record<string, unknown>;
    if (typeof record.message === "string") {
      return record.message;
    }
  }
  if (err instanceof Error) return err.message;
  return "An unexpected application error occurred.";
}
