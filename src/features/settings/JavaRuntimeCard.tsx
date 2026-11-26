import { useState } from "react";
import {
  IconCheck,
  IconCoffee,
  IconFolderOpen,
  IconRefresh,
  IconRotateClockwise,
  IconX,
} from "@tabler/icons-react";
import {
  Badge,
  Button,
  Input,
  Select,
  SettingCard,
} from "@/components/ui";
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
    <SettingCard
      id="settings-runtime"
      icon={<IconCoffee size={18} />}
      title="Java Runtime"
      description="Manage local JDK detection, compilation timeout, and JVM heap cap."
      action={
        <div className="flex items-center gap-2">
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
      }
    >
      <div className="space-y-1.5">
        <label
          htmlFor="settings-jdk-location"
          className="block text-[13.5px] font-medium text-[var(--text-primary)]"
        >
          JDK Location
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="settings-jdk-location"
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
            size="md"
            title="Browse for JDK folder"
            onClick={() => void handleSelectJdkFolder()}
            leftIcon={<IconFolderOpen size={15} />}
          >
            Browse
          </Button>
        </div>
        {jdkInfo?.warning && (
          <p className="text-xs text-[var(--status-warning)]">
            {jdkInfo.warning}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-3.5 py-2.5">
          <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
            Timeout
          </span>
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
            className="w-24"
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-3.5 py-2.5">
          <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
            JVM Heap (-Xmx)
          </span>
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
            className="w-28"
          />
        </div>
      </div>

      <p className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3.5 py-2.5 text-xs leading-relaxed text-[var(--text-muted)]">
        Note: <code className="font-mono text-[var(--text-secondary)]">-Xmx</code>{" "}
        caps Java object heap allocation only; total OS process memory (JVM
        metaspace, thread stacks, native libraries) is higher and not strictly
        sandboxed by Windows.
      </p>

      <div className="flex justify-end pt-1">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<IconRotateClockwise size={14} />}
          onClick={() => void handleReset()}
        >
          Reset to Default
        </Button>
      </div>
    </SettingCard>
  );
}
