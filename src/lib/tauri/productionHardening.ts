export interface ProductionHardeningOptions {
  enabled?: boolean;
  targetWindow?: Window;
}

/**
 * Returns true when an event target lives inside CodeMirror 6 so editor-native
 * search shortcuts (such as Ctrl+F) continue working cleanly.
 */
export function isInsideCodeEditor(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(".cm-editor"));
}

/**
 * Determines whether a keyboard shortcut should be suppressed in production
 * desktop builds to prevent browser DevTools, context menus, reload, print,
 * or history navigation while keeping normal editing and AlgoJava shortcuts intact.
 */
export function shouldBlockBrowserKeydown(
  event: KeyboardEvent,
  target: EventTarget | null
): boolean {
  const key = event.key;
  const lower = key.toLowerCase();
  const primaryModifier = event.ctrlKey || event.metaKey;

  if (key === "ContextMenu" || (event.shiftKey && key === "F10")) {
    return true;
  }

  if (
    key === "F12" ||
    key === "F5" ||
    key === "F3" ||
    key === "F7" ||
    key === "BrowserRefresh" ||
    key === "BrowserBack" ||
    key === "BrowserForward"
  ) {
    return true;
  }

  if (event.altKey && (key === "ArrowLeft" || key === "ArrowRight")) {
    return true;
  }

  if (!primaryModifier) {
    return false;
  }

  if (event.shiftKey && (lower === "i" || lower === "j" || lower === "c" || lower === "r")) {
    return true;
  }

  if (lower === "u" || lower === "r" || lower === "p") {
    return true;
  }

  if (lower === "f" && !isInsideCodeEditor(target)) {
    return true;
  }

  return false;
}

/**
 * Installs capture-phase WebView hardening listeners for production builds.
 * In development mode (`enabled = false`), returns a no-op cleanup so DevTools,
 * inspect element, and hot-reload remain usable.
 */
export function installProductionWebviewHardening(
  options?: ProductionHardeningOptions
): () => void {
  const enabled = options?.enabled ?? import.meta.env.PROD;
  const win =
    options?.targetWindow ?? (typeof window !== "undefined" ? window : undefined);

  if (!enabled || !win) {
    return () => {};
  }

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (shouldBlockBrowserKeydown(event, event.target)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleDragNavigate = (event: DragEvent) => {
    event.preventDefault();
  };

  win.addEventListener("contextmenu", handleContextMenu, { capture: true });
  win.addEventListener("keydown", handleKeyDown, { capture: true });
  win.addEventListener("dragover", handleDragNavigate, { capture: true });
  win.addEventListener("drop", handleDragNavigate, { capture: true });

  return () => {
    win.removeEventListener("contextmenu", handleContextMenu, { capture: true });
    win.removeEventListener("keydown", handleKeyDown, { capture: true });
    win.removeEventListener("dragover", handleDragNavigate, { capture: true });
    win.removeEventListener("drop", handleDragNavigate, { capture: true });
  };
}
