import { invoke } from "@tauri-apps/api/core";
import type { ExecutionOutcome, ExecutionRequest, JdkInfo } from "@/types/models";
import { isTauriRuntime } from "./env";

export async function detectJavaRuntime(customJdkPath?: string | null): Promise<JdkInfo> {
  if (!isTauriRuntime()) {
    return {
      detected: false,
      version: null,
      majorVersion: null,
      jdkPath: null,
      javacPath: null,
      javaPath: null,
      source: "browser",
      warning: "Java runtime detection is only available inside the AlgoJava desktop application.",
    };
  }
  return invoke<JdkInfo>("detect_java_runtime", {
    customJdkPath: customJdkPath?.trim() || null,
  });
}

export async function validateJdkPath(jdkPath: string): Promise<JdkInfo> {
  if (!isTauriRuntime()) {
    throw new Error("JDK validation requires the AlgoJava desktop runtime.");
  }
  return invoke<JdkInfo>("validate_jdk_path", { jdkPath });
}

export async function executeJavaCode(request: ExecutionRequest): Promise<ExecutionOutcome> {
  if (!isTauriRuntime()) {
    throw new Error(
      "Local Java compilation and execution require the AlgoJava desktop runtime."
    );
  }
  return invoke<ExecutionOutcome>("execute_java_code", { request });
}
