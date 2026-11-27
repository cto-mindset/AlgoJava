import { describe, expect, it } from "vitest";
import { installProductionWebviewHardening } from "@/lib/tauri/productionHardening";

describe("Production WebView context-menu and shortcut hardening", () => {
  it("does not install listeners when disabled (development mode)", () => {
    const dispose = installProductionWebviewHardening({ enabled: false });
    const ctxEvent = new MouseEvent("contextmenu", { cancelable: true });
    window.dispatchEvent(ctxEvent);
    expect(ctxEvent.defaultPrevented).toBe(false);
    dispose();
  });

  it("blocks right-click context menus and context-menu keys when enabled", () => {
    const dispose = installProductionWebviewHardening({ enabled: true });
    try {
      const ctxEvent = new MouseEvent("contextmenu", { cancelable: true });
      window.dispatchEvent(ctxEvent);
      expect(ctxEvent.defaultPrevented).toBe(true);

      const shiftF10 = new KeyboardEvent("keydown", {
        key: "F10",
        shiftKey: true,
        cancelable: true,
      });
      window.dispatchEvent(shiftF10);
      expect(shiftF10.defaultPrevented).toBe(true);

      const contextMenuKey = new KeyboardEvent("keydown", {
        key: "ContextMenu",
        cancelable: true,
      });
      window.dispatchEvent(contextMenuKey);
      expect(contextMenuKey.defaultPrevented).toBe(true);
    } finally {
      dispose();
    }
  });

  it("blocks browser DevTools, reload, print, source view, and history shortcuts", () => {
    const dispose = installProductionWebviewHardening({ enabled: true });
    try {
      const blockedEvents = [
        new KeyboardEvent("keydown", { key: "F12", cancelable: true }),
        new KeyboardEvent("keydown", { key: "F5", cancelable: true }),
        new KeyboardEvent("keydown", { key: "F7", cancelable: true }),
        new KeyboardEvent("keydown", { key: "I", ctrlKey: true, shiftKey: true, cancelable: true }),
        new KeyboardEvent("keydown", { key: "J", ctrlKey: true, shiftKey: true, cancelable: true }),
        new KeyboardEvent("keydown", { key: "C", ctrlKey: true, shiftKey: true, cancelable: true }),
        new KeyboardEvent("keydown", { key: "u", ctrlKey: true, cancelable: true }),
        new KeyboardEvent("keydown", { key: "r", ctrlKey: true, cancelable: true }),
        new KeyboardEvent("keydown", { key: "p", ctrlKey: true, cancelable: true }),
        new KeyboardEvent("keydown", { key: "ArrowLeft", altKey: true, cancelable: true }),
      ];

      for (const evt of blockedEvents) {
        window.dispatchEvent(evt);
        expect(evt.defaultPrevented).toBe(true);
      }
    } finally {
      dispose();
    }
  });

  it("keeps editor search inside CodeMirror and normal copy/paste/save/run shortcuts working", () => {
    const dispose = installProductionWebviewHardening({ enabled: true });
    const editorHost = document.createElement("div");
    editorHost.className = "cm-editor";
    const inner = document.createElement("div");
    editorHost.appendChild(inner);
    document.body.appendChild(editorHost);

    try {
      // Ctrl+F outside CodeMirror is blocked
      const findOutside = new KeyboardEvent("keydown", {
        key: "f",
        ctrlKey: true,
        cancelable: true,
      });
      window.dispatchEvent(findOutside);
      expect(findOutside.defaultPrevented).toBe(true);

      // Ctrl+F inside CodeMirror is allowed
      const findInside = new KeyboardEvent("keydown", {
        key: "f",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      inner.dispatchEvent(findInside);
      expect(findInside.defaultPrevented).toBe(false);

      // Standard editing and AlgoJava shortcuts remain allowed
      const allowed = [
        new KeyboardEvent("keydown", { key: "c", ctrlKey: true, cancelable: true }),
        new KeyboardEvent("keydown", { key: "v", ctrlKey: true, cancelable: true }),
        new KeyboardEvent("keydown", { key: "s", ctrlKey: true, cancelable: true }),
        new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, cancelable: true }),
        new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, shiftKey: true, cancelable: true }),
      ];
      for (const evt of allowed) {
        window.dispatchEvent(evt);
        expect(evt.defaultPrevented).toBe(false);
      }
    } finally {
      editorHost.remove();
      dispose();
    }
  });

  it("prevents drag/drop navigation and cleanly removes listeners on dispose", () => {
    const dispose = installProductionWebviewHardening({ enabled: true });
    const dropEvent = new Event("drop", { cancelable: true });
    window.dispatchEvent(dropEvent);
    expect(dropEvent.defaultPrevented).toBe(true);

    dispose();

    const afterDispose = new MouseEvent("contextmenu", { cancelable: true });
    window.dispatchEvent(afterDispose);
    expect(afterDispose.defaultPrevented).toBe(false);
  });
});
