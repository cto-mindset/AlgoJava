import { useEffect, useState } from "react";
import {
  IconCode,
  IconCpu,
  IconInfoCircle,
  IconKeyboard,
  IconPackages,
  IconShieldLock,
} from "@tabler/icons-react";
import { Badge, PageHeader, SectionHeader } from "@/components/ui";
import { JavaCupEmblem } from "@/components/shared/Illustrations";
import { getAppBuildInfo } from "@/lib/tauri/storageClient";
import { useJavaRuntimeStore } from "@/stores/javaRuntimeStore";
import type { AppBuildInfo } from "@/types/models";

const OPEN_SOURCE_LIBS = [
  { name: "Tauri 2", license: "Apache-2.0 / MIT", purpose: "Native Windows desktop shell & IPC" },
  { name: "React 19", license: "MIT", purpose: "Declarative UI component framework" },
  { name: "CodeMirror 6", license: "MIT", purpose: "Java/JSON/XML code editing engine" },
  { name: "React Router 8", license: "MIT", purpose: "Client-side application routing" },
  { name: "Zustand 5", license: "MIT", purpose: "Lightweight application state store" },
  { name: "Tabler Icons React", license: "MIT", purpose: "Consistent vector iconography" },
  { name: "Tailwind CSS 4", license: "MIT", purpose: "Utility styling & design tokens" },
  { name: "SQLite (via tauri-plugin-sql)", license: "Public Domain / MIT", purpose: "Offline relational persistence" },
];

const SHORTCUTS = [
  { keys: "Ctrl + Enter", action: "Run sample test cases in Code Editor" },
  { keys: "Ctrl + Shift + Enter", action: "Submit solution against all test cases" },
  { keys: "Ctrl + S", action: "Save draft code immediately to SQLite" },
  { keys: "Escape", action: "Close open dialogs and popovers" },
];

export function AboutPage() {
  const jdkInfo = useJavaRuntimeStore((s) => s.jdkInfo);
  const [buildInfo, setBuildInfo] = useState<AppBuildInfo | null>(null);

  useEffect(() => {
    void getAppBuildInfo().then(setBuildInfo).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 p-6">
      <section className="algo-surface algo-hero-backdrop p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            icon={<IconInfoCircle size={24} />}
            title="About AlgoJava"
            subtitle="Offline-first Java coding practice desktop environment powered by Tauri 2, React, and Rust."
          />
          <div className="flex items-center gap-3">
            <JavaCupEmblem className="w-14 h-14" />
            <div className="text-xs">
              <div className="font-semibold text-[var(--text-primary)]">
                Version {buildInfo?.appVersion ?? "0.1.0"}
              </div>
              <div className="text-[var(--text-muted)]">
                Build {buildInfo?.buildDate ?? "2026.11.25"} ({buildInfo?.targetOs ?? "windows"})
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Runtime & Architecture */}
        <section className="algo-surface p-5 space-y-4">
          <SectionHeader
            icon={<IconCpu size={18} />}
            title="Environment &amp; Runtime Details"
          />
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-[var(--text-secondary)]">Application</span>
              <span className="font-semibold text-[var(--text-primary)]">
                AlgoJava Desktop ({buildInfo?.buildProfile ?? "dev"})
              </span>
            </div>
            <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-[var(--text-secondary)]">Tauri / Rust Edition</span>
              <span className="font-semibold text-[var(--text-primary)]">
                Tauri {buildInfo?.tauriVersion ?? "2.x"} / Rust {buildInfo?.rustEdition ?? "2024"}
              </span>
            </div>
            <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-[var(--text-secondary)]">Detected JDK</span>
              <Badge tone={jdkInfo?.detected ? "success" : "warning"}>
                {jdkInfo?.detected
                  ? `JDK ${jdkInfo.version ?? jdkInfo.majorVersion}`
                  : "Not Detected"}
              </Badge>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-secondary)] shrink-0">JDK Path</span>
              <span className="font-mono text-[var(--text-primary)] truncate">
                {jdkInfo?.jdkPath ?? "Configure in Settings → Java Runtime"}
              </span>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="algo-surface p-5 space-y-4">
          <SectionHeader
            icon={<IconKeyboard size={18} />}
            title="Editor Keyboard Shortcuts"
          />
          <div className="space-y-2.5 text-xs">
            {SHORTCUTS.map((sc) => (
              <div
                key={sc.keys}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] px-3 py-2"
              >
                <span className="text-[var(--text-secondary)]">{sc.action}</span>
                <kbd className="rounded bg-[var(--bg-input)] border border-[var(--border-default)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--accent-light)]">
                  {sc.keys}
                </kbd>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Security & Isolation Notice */}
      <section className="algo-surface p-5 space-y-2.5">
        <SectionHeader
          icon={<IconShieldLock size={18} />}
          title="Local Execution Security &amp; Isolation Limitations"
        />
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          AlgoJava compiles and executes your Java code locally using your installed{" "}
          <code>javac</code> and <code>java</code> binaries invoked directly with
          separate process arguments (without shell command interpolation) inside an
          isolated temporary directory that is cleaned up after every run. Execution
          is bounded by configurable timeouts, process-tree termination on timeout,
          stdout/stderr size caps, and JVM heap limits (<code>-Xmx</code>).
        </p>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          <strong>Important limitation:</strong> Running local JVM code is not a
          complete OS sandbox. Timeouts and <code>-Xmx</code> heap bounds do not
          prevent user-authored Java code from performing local file or network calls
          under your Windows user account permissions. Only run code you authored or
          trust.
        </p>
      </section>

      {/* Open Source Credits */}
      <section className="algo-surface p-5 space-y-4">
        <SectionHeader
          icon={<IconPackages size={18} />}
          title="Open-Source Libraries &amp; Credits"
          subtitle="Built with open-source desktop, editor, and database tooling."
        />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {OPEN_SOURCE_LIBS.map((lib) => (
            <div
              key={lib.name}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3.5 py-2.5 text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                  <IconCode size={14} className="text-[var(--accent-light)]" />
                  <span>{lib.name}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                  {lib.purpose}
                </p>
              </div>
              <Badge tone="neutral">{lib.license}</Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
