import { useState } from "react";
import {
  IconCheck,
  IconCoffee,
  IconFolderOpen,
  IconRefresh,
  IconRotateClockwise,
  IconX,
} from "@tabler/icons-react";
import { Badge, Button, Input, Select } from "@/components/ui";
import { JavaCupEmblem } from "@/components/shared/Illustrations";
import { pickJdkFolder } from "@/lib/tauri/dialogClient";
import { useJavaRuntimeStore } from "@/stores/javaRuntimeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useToastStore } from "@/stores/toastStore";

export function JavaRuntimeCard() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetRuntimeSettings = useSettingsStore((s) => s.resetRuntimeSettings);

  const jdkInfo = useJavaRuntimeStore((s) => s.jdkInfo);
  const checking = useJavaRuntimeStore((s) => s.checking);
  const detectRuntime = useJavaRuntimeStore((s) => s.detectRuntime);
  const validateAndUsePath = useJavaRuntimeStore((s) => s.validateAndUsePath);
  const pushToast = useToastStore((s) => s.pushToast);

  const [pathDraft, setPathDraft] = useState(settings.customJdkPath);

  const handleSelectJdkFolder = async () => {
    try {
      const selected = await pickJdkFolder(
        pathDraft || jdkInfo?.jdkPath || undefined
      );
      if (!selected) return;

      await validateAndUsePath(selected);
      setPathDraft(selected);
      await updateSettings({ customJdkPath: selected });
      pushToast({
        title: "Custom JDK verified",
        description: `Configured JDK at ${selected}`,
        tone: "success",
      });
    } catch (err) {
      pushToast({
        title: "Invalid JDK folder",
        description: err instanceof Error ? err.message : String(err),
        tone: "error",
      });
    }
  };

  const handleApplyPath = async () => {
    const trimmed = pathDraft.trim();
    if (!trimmed) {
      await updateSettings({ customJdkPath: "" });
      await detectRuntime(null);
      return;
    }

    try {
      await validateAndUsePath(trimmed);
      await updateSettings({ customJdkPath: trimmed });
      pushToast({
        title: "JDK path validated",
        tone: "success",
      });
    } catch (err) {
      pushToast({
        title: "Invalid JDK path",
        description: err instanceof Error ? err.message : String(err),
        tone: "error",
      });
    }
  };

  const handleReset = async () => {
    await resetRuntimeSettings();
    setPathDraft("");
    await detectRuntime(null);
    pushToast({
      title: "Java runtime settings reset to defaults",
      tone: "info",
    });
  };

  return (
    <section className="algo-surface p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent-light)]">
            <IconCoffee size={18} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Java Runtime
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Manage local JDK compilation and JVM execution limits.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          loading={checking}
          leftIcon={<IconRefresh size={14} />}
          onClick={() => void detectRuntime(settings.customJdkPath)}
        >
          Detect
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-center">
        <div className="sm:col-span-4 flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] py-4 px-2">
          <JavaCupEmblem className="w-16 h-16" />
          <span className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
            Java
          </span>
        </div>

        <div className="sm:col-span-8 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[var(--text-secondary)]">Java Version</span>
            {jdkInfo?.detected ? (
              <Badge tone="success">
                <span>JDK {jdkInfo.version ?? jdkInfo.majorVersion}</span>
                <IconCheck size={12} />
              </Badge>
            ) : (
              <Badge tone="warning">
                <span>Not Detected</span>
                <IconX size={12} />
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[var(--text-secondary)]">JDK Location</span>
            <div className="flex items-center gap-1.5">
              <Input
                aria-label="JDK Location"
                value={pathDraft}
                onChange={(e) => setPathDraft(e.target.value)}
                onBlur={() => void handleApplyPath()}
                placeholder={
                  jdkInfo?.jdkPath ?? "Auto-detect (JAVA_HOME / PATH) or browse..."
                }
                containerClassName="flex-1"
              />
              <Button
                variant="secondary"
                size="sm"
                title="Browse for JDK folder"
                onClick={() => void handleSelectJdkFolder()}
                leftIcon={<IconFolderOpen size={14} />}
              >
                Browse
              </Button>
            </div>
            {jdkInfo?.warning && (
              <p className="text-[11px] text-[var(--status-warning)]">
                {jdkInfo.warning}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)]">Timeout</span>
              <Select<number>
                ariaLabel="Execution Timeout"
                value={settings.executionTimeoutSeconds}
                onChange={(executionTimeoutSeconds) =>
                  void updateSettings({ executionTimeoutSeconds })
                }
                options={[
                  { value: 5, label: "5s" },
                  { value: 15, label: "15s" },
                  { value: 30, label: "30s" },
                  { value: 60, label: "60s" },
                ]}
                className="w-20"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)]">JVM Heap (-Xmx)</span>
              <Select<number>
                ariaLabel="JVM Heap Memory Limit"
                value={settings.memoryLimitMb}
                onChange={(memoryLimitMb) =>
                  void updateSettings({ memoryLimitMb })
                }
                options={[
                  { value: 128, label: "128 MB" },
                  { value: 256, label: "256 MB" },
                  { value: 512, label: "512 MB" },
                  { value: 1024, label: "1024 MB" },
                ]}
                className="w-26"
              />
            </div>
          </div>

          <p className="text-[11px] text-[var(--text-muted)]">
            Note: <code>-Xmx</code> caps Java object heap allocation only; total OS
            process memory (JVM metaspace, thread stacks, native libraries) is higher
            and not strictly sandboxed by Windows.
          </p>

          <div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<IconRotateClockwise size={14} />}
              onClick={() => void handleReset()}
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
