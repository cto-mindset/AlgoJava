import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  IconCode,
  IconExternalLink,
  IconInfoCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { Button, Dialog, SettingCard } from "@/components/ui";
import { getAppBuildInfo } from "@/lib/tauri/storageClient";
import { checkForUpdatesSafely } from "@/lib/tauri/updaterClient";
import { useJavaRuntimeStore } from "@/stores/javaRuntimeStore";
import { useToastStore } from "@/stores/toastStore";
import type { AppBuildInfo } from "@/types/models";

export function AboutSummaryCard() {
  const navigate = useNavigate();
  const jdkInfo = useJavaRuntimeStore((s) => s.jdkInfo);
  const pushToast = useToastStore((s) => s.pushToast);

  const [buildInfo, setBuildInfo] = useState<AppBuildInfo | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [licenseOpen, setLicenseOpen] = useState(false);

  useEffect(() => {
    void getAppBuildInfo().then(setBuildInfo).catch(() => {});
  }, []);

  const handleCheckUpdates = async () => {
    setCheckingUpdate(true);
    try {
      const res = await checkForUpdatesSafely();
      pushToast({
        title:
          res.status === "available"
            ? "Update Available"
            : res.status === "up_to_date"
            ? "Up to Date"
            : "Update Check",
        description: res.message,
        tone:
          res.status === "error"
            ? "error"
            : res.status === "available"
            ? "success"
            : "info",
      });
    } finally {
      setCheckingUpdate(false);
    }
  };

  return (
    <SettingCard
      id="settings-about"
      icon={<IconInfoCircle size={18} />}
      title="About AlgoJava"
      description="Version details, detected Java runtime, and open-source notices."
      action={
        <Button
          variant="primary"
          size="sm"
          loading={checkingUpdate}
          leftIcon={<IconRefresh size={14} />}
          onClick={() => void handleCheckUpdates()}
        >
          Check for Updates
        </Button>
      }
    >
      {/* Brand + 3-cell metadata bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-light)]">
            <IconCode size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">
              Algo<span className="text-[var(--accent-light)]">Java</span>
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              100% Free &amp; Offline · by Dilshod Fayzullayev (Dylan)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-5 text-xs">
          <div>
            <div className="text-[var(--text-muted)]">Version</div>
            <div className="algo-tabular mt-0.5 font-semibold text-[var(--text-primary)]">
              {buildInfo?.appVersion ?? "0.1.0"}
            </div>
          </div>
          <div>
            <div className="text-[var(--text-muted)]">Build</div>
            <div className="algo-tabular mt-0.5 font-semibold text-[var(--text-primary)]">
              {buildInfo ? buildInfo.buildDate : "2026.11.25"}
            </div>
          </div>
          <div>
            <div className="text-[var(--text-muted)]">Runtime</div>
            <div className="algo-tabular mt-0.5 font-semibold text-[var(--text-primary)]">
              {jdkInfo?.detected ? jdkInfo.version ?? "Detected" : "Not Detected"}
            </div>
          </div>
        </div>
      </div>

      {/* Links bar */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setLicenseOpen(true)}
          className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3.5 py-2.5 text-xs font-medium text-[var(--accent-light)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
        >
          <span>License</span>
          <IconExternalLink size={13} />
        </button>
        <button
          type="button"
          onClick={() => navigate("/about")}
          className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3.5 py-2.5 text-xs font-medium text-[var(--accent-light)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
        >
          <span>About &amp; Story</span>
          <IconExternalLink size={13} />
        </button>
        <button
          type="button"
          onClick={() => navigate("/about")}
          className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3.5 py-2.5 text-xs font-medium text-[var(--accent-light)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
        >
          <span>Privacy &amp; Security</span>
          <IconExternalLink size={13} />
        </button>
      </div>

      <Dialog
        open={licenseOpen}
        onClose={() => setLicenseOpen(false)}
        title="Project License Notice"
      >
        <div className="space-y-2.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
          <p>
            No standalone LICENSE file was shipped in this repository yet. The
            AlgoJava desktop shell and source code are proprietary/private to the
            repository owner unless a license file is explicitly added.
          </p>
          <p>
            Bundled third-party dependencies (React, Tauri, CodeMirror 6, Tabler
            Icons, Zustand, SQLite/sqlx) remain governed by their respective MIT /
            Apache-2.0 licenses.
          </p>
        </div>
      </Dialog>
    </SettingCard>
  );
}
