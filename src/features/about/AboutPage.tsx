import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  IconBolt,
  IconCheck,
  IconCode,
  IconCoffee,
  IconCpu,
  IconHeartHandshake,
  IconKeyboard,
  IconLock,
  IconPlayerPlay,
  IconSettings,
  IconShieldCheck,
  IconShieldLock,
  IconSparkles,
  IconUser,
  IconWifiOff,
} from "@tabler/icons-react";
import { Badge, Button, SectionHeader } from "@/components/ui";
import { JavaCupEmblem } from "@/components/shared/Illustrations";
import { getAppBuildInfo } from "@/lib/tauri/storageClient";
import { useJavaRuntimeStore } from "@/stores/javaRuntimeStore";
import type { AppBuildInfo } from "@/types/models";

const HIGHLIGHTS = [
  {
    icon: IconWifiOff,
    title: "Offline Edition of CodingBat (codingbat.com)",
    description:
      "Inspired by codingbat.com, AlgoJava brings structured Java practice tracks — Warmup, String, Array, Logic, Recursion, Sorting, and Searching — directly to your desktop without needing internet access.",
  },
  {
    icon: IconHeartHandshake,
    title: "100% Free & Local-First",
    description:
      "No accounts, no paywalls, and no cloud lock-in. Every solution, draft, note, and submission record is stored locally on your machine under your complete control.",
  },
  {
    icon: IconCpu,
    title: "Native Rust Engine & Local JDK",
    description:
      "A lightweight native core written in Rust manages isolated temporary workspaces, strict timeouts, and direct javac / java execution using your installed JDK.",
  },
];

const SHORTCUTS = [
  { keys: "Ctrl + Enter", action: "Run sample test cases" },
  { keys: "Ctrl + Shift + Enter", action: "Submit against all tests" },
  { keys: "Ctrl + S", action: "Save draft code locally" },
  { keys: "Escape", action: "Close dialogs & popovers" },
];

export function AboutPage() {
  const navigate = useNavigate();
  const jdkInfo = useJavaRuntimeStore((s) => s.jdkInfo);
  const [buildInfo, setBuildInfo] = useState<AppBuildInfo | null>(null);

  useEffect(() => {
    void getAppBuildInfo().then(setBuildInfo).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-[1320px] space-y-5 p-6">
      {/* Architectural Hero Banner */}
      <section className="algo-surface relative overflow-hidden p-7 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 algo-hero-grid opacity-80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "var(--hero-orb-primary)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-24 -bottom-24 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "var(--hero-orb-secondary)" }}
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">
                <IconSparkles size={12} />
                <span>100% Free</span>
              </Badge>
              <Badge tone="success">
                <IconBolt size={12} />
                <span>100% Offline</span>
              </Badge>
              <Badge tone="neutral">
                <IconCode size={12} />
                <span>Offline CodingBat Edition</span>
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-[40px] font-bold tracking-[-0.03em] leading-[1.08] text-[var(--text-primary)]">
              About <span className="algo-accent-text">AlgoJava</span>
            </h1>

            <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
              AlgoJava is a 100% free and offline desktop edition of{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                codingbat.com
              </span>
              , built for distraction-free daily Java algorithm practice with instant
              local compilation and zero internet dependency.
            </p>
          </div>

          {/* Live Version & Runtime Card */}
          <div className="algo-surface-elevated flex items-center gap-4 px-5 py-4 shrink-0">
            <JavaCupEmblem className="w-12 h-12 shrink-0" />
            <div className="space-y-1 text-xs">
              <div className="algo-tabular text-sm font-bold text-[var(--text-primary)]">
                AlgoJava v{buildInfo?.appVersion ?? "1.0.0-alpha.1"}
              </div>
              <div className="algo-tabular text-[var(--text-muted)]">
                Build {buildInfo?.buildDate ?? "2026.11.25"} · Rust Native Core
              </div>
              <div className="pt-0.5">
                {jdkInfo?.detected ? (
                  <Badge tone="success">
                    <IconCoffee size={12} />
                    <span>JDK {jdkInfo.version ?? jdkInfo.majorVersion}</span>
                  </Badge>
                ) : (
                  <Link
                    to="/settings?tab=runtime"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--status-warning)] hover:underline"
                  >
                    <IconCoffee size={13} />
                    <span>Configure JDK →</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12-Column Story & Creator Bento Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: Purpose & Philosophy (7 cols) */}
        <section className="algo-surface p-6 lg:col-span-7 flex flex-col gap-4">
          <SectionHeader
            icon={<IconCode size={18} />}
            title="Built for Focused Java Practice"
            subtitle="Why AlgoJava exists and how it works offline"
          />

          <div className="space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-3.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--accent-border)]/60 bg-[var(--accent-soft)] text-[var(--accent-light)]">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-semibold text-[var(--text-primary)]">
                    {title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Creator Spotlight Card (5 cols) */}
        <section className="algo-surface relative overflow-hidden p-6 lg:col-span-5 flex flex-col justify-between gap-5 border-t-2 border-t-[var(--accent-primary)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-2xl"
            style={{ background: "var(--hero-orb-primary)" }}
          />

          <div className="relative z-10 space-y-4">
            <SectionHeader
              icon={<IconUser size={18} />}
              title="Author & Creator"
              subtitle="Crafted with care for Java learners"
            />

            <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--accent-border)]/50 bg-[var(--bg-surface-secondary)] p-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-lg font-bold text-[var(--text-on-accent)] shadow-[var(--shadow-accent)]"
                style={{ background: "var(--accent-gradient)" }}
              >
                DF
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Created by
                </div>
                <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] truncate">
                  Dilshod Fayzullayev
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="accent">Dylan</Badge>
                  <span className="text-xs text-[var(--text-secondary)]">
                    Software Developer
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
              AlgoJava was created to deliver the simplicity and effectiveness of{" "}
              <span className="font-medium text-[var(--text-primary)]">
                codingbat.com
              </span>{" "}
              inside a refined, fast desktop studio you can rely on anywhere — even
              completely offline.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<IconPlayerPlay size={14} />}
              onClick={() => navigate("/problems")}
            >
              Start Practicing
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<IconSettings size={14} />}
              onClick={() => navigate("/settings")}
            >
              Open Settings
            </Button>
          </div>
        </section>
      </div>

      {/* Privacy & Local Security Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Privacy & Voluntary Diagnostics */}
        <section className="algo-surface p-6 lg:col-span-6 space-y-3.5">
          <SectionHeader
            icon={<IconShieldCheck size={18} className="text-[var(--status-success)]" />}
            title="Privacy &amp; Voluntary Diagnostics"
            subtitle="Your data stays strictly on your computer"
          />

          <p className="text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
            AlgoJava works 100% offline and never collects background telemetry,
            analytics, or personal activity automatically.
          </p>

          <div className="space-y-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-4 text-[13px] text-[var(--text-secondary)]">
            <div className="flex items-start gap-2.5">
              <IconLock size={16} className="mt-0.5 shrink-0 text-[var(--accent-light)]" />
              <span>
                <strong className="text-[var(--text-primary)]">
                  Voluntary diagnostics only:
                </strong>{" "}
                Any system or diagnostic details are shared only if you choose to
                provide them upon a separate explicit request, solely for identifying
                and fixing bugs or technical issues.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <IconCheck size={16} className="mt-0.5 shrink-0 text-[var(--status-success)]" />
              <span>
                All problem drafts, notes, and solve history remain inside your local
                storage and can be exported or cleared anytime in Settings.
              </span>
            </div>
          </div>
        </section>

        {/* Local Execution Security */}
        <section className="algo-surface p-6 lg:col-span-6 space-y-3.5">
          <SectionHeader
            icon={<IconShieldLock size={18} />}
            title="Local Execution Security &amp; Isolation Limitations"
            subtitle="How your Java code is compiled and run"
          />

          <p className="text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
            AlgoJava compiles and executes your Java code locally using your installed{" "}
            <code className="font-mono text-xs text-[var(--text-primary)]">
              javac
            </code>{" "}
            and{" "}
            <code className="font-mono text-xs text-[var(--text-primary)]">
              java
            </code>{" "}
            binaries invoked directly with separate process arguments (without shell
            command interpolation) inside an isolated temporary directory that is
            cleaned up after every run. Execution is bounded by configurable
            timeouts, process-tree termination on timeout, stdout/stderr size caps,
            and JVM heap limits (
            <code className="font-mono text-xs text-[var(--text-primary)]">
              -Xmx
            </code>
            ).
          </p>

          <p className="rounded-[var(--radius-sm)] border border-[var(--status-warning-border)] bg-[var(--status-warning-soft)] px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">
              Important limitation:
            </strong>{" "}
            Running local JVM code is not a complete OS sandbox. Timeouts and{" "}
            <code className="font-mono text-xs text-[var(--text-primary)]">
              -Xmx
            </code>{" "}
            heap bounds do not prevent user-authored Java code from performing local
            file or network calls under your Windows user account permissions. Only
            run code you authored or trust.
          </p>
        </section>
      </div>

      {/* Compact Keyboard Shortcuts Strip */}
      <section className="algo-surface p-5 space-y-3.5">
        <SectionHeader
          icon={<IconKeyboard size={18} />}
          title="Editor Keyboard Shortcuts"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.keys}
              className="flex flex-col justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-3.5 py-3"
            >
              <span className="text-[13px] font-medium text-[var(--text-secondary)]">
                {sc.action}
              </span>
              <div>
                <kbd className="algo-kbd">{sc.keys}</kbd>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
