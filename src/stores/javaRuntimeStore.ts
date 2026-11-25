import { create } from "zustand";
import { detectJavaRuntime, validateJdkPath } from "@/lib/tauri/javaClient";
import { formatNativeError } from "@/lib/tauri/env";
import type { JdkInfo } from "@/types/models";

interface JavaRuntimeState {
  jdkInfo: JdkInfo | null;
  checking: boolean;
  error: string | null;
  detectRuntime: (customPath?: string | null) => Promise<JdkInfo>;
  validateAndUsePath: (path: string) => Promise<JdkInfo>;
}

export const useJavaRuntimeStore = create<JavaRuntimeState>((set) => ({
  jdkInfo: null,
  checking: false,
  error: null,

  detectRuntime: async (customPath) => {
    set({ checking: true, error: null });
    try {
      const info = await detectJavaRuntime(customPath);
      set({ jdkInfo: info, checking: false, error: null });
      return info;
    } catch (err) {
      const msg = formatNativeError(err);
      const fallback: JdkInfo = {
        detected: false,
        version: null,
        majorVersion: null,
        jdkPath: customPath?.trim() || null,
        javacPath: null,
        javaPath: null,
        source: "error",
        warning: msg,
      };
      set({ jdkInfo: fallback, checking: false, error: msg });
      return fallback;
    }
  },

  validateAndUsePath: async (path) => {
    set({ checking: true, error: null });
    try {
      const info = await validateJdkPath(path);
      set({ jdkInfo: info, checking: false, error: null });
      return info;
    } catch (err) {
      const msg = formatNativeError(err);
      set({ checking: false, error: msg });
      throw new Error(msg);
    }
  },
}));
