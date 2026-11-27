import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  IconAlertTriangle,
  IconCheck,
  IconCode,
  IconDownload,
  IconExternalLink,
  IconInfoCircle,
  IconRefresh,
  IconShieldCheck,
  IconWifiOff,
} from "@tabler/icons-react";
import { Badge, Button, Dialog, ProgressBar, SettingCard } from "@/components/ui";
import { getAppBuildInfo } from "@/lib/tauri/storageClient";
import { useJavaRuntimeStore } from "@/stores/javaRuntimeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUpdaterStore } from "@/stores/updaterStore";
import type { AppBuildInfo } from "@/types/models";

function formatCheckTimestamp(iso: string | null): string {
  if (!iso) return "Never checked";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString();
}

export function AboutSummaryCard() {
  const navigate = useNavigate();
  const jdkInfo = useJavaRuntimeStore((s) => s.jdkInfo);
  const lastUpdateCheckAt = useSettingsStore(
    (s) => s.settings.lastUpdateCheckAt
  );

  const updaterStatus = useUpdaterStore((s) => s.status);
  const availableUpdate = useUpdaterStore((s) => s.availableUpdate);
  const progress = useUpdaterStore((s) => s.progress);
  const errorMessage = useUpdaterStore((s) => s.errorMessage);
  const checkManually = useUpdaterStore((s) => s.checkManually);
  const openInstallConfirmation = useUpdaterStore(
    (s) => s.openInstallConfirmation
  );
  const restartNow = useUpdaterStore((s) => s.restartNow);

  const [buildInfo, setBuildInfo] = useState<AppBuildInfo | null>(null);
  const [licenseOpen, setLicenseOpen] = useState(false);

  useEffect(() => {
    void getAppBuildInfo().then(setBuildInfo).catch(() => {});
  }, []);

  const isBusy =
    updaterStatus === "checking" ||
    updaterStatus === "downloading" ||
    updaterStatus === "installing";

  const statusBadge =
    updaterStatus === "checking" ? (
      <Badge tone="info">Checking...</Badge>
    ) : updaterStatus === "up_to_date" ? (
      <Badge tone="success">
        <IconCheck size={12} />
        <span>Up to Date</span>
      </Badge>
    ) : updaterStatus === "available" ? (
      <Badge tone="accent">
        <IconDownload size={12} />
        <span>Update Available</span>
      </Badge>
    ) : updaterStatus === "downloading" ? (
      <Badge tone="info">Downloading...</Badge>
    ) : updaterStatus === "installing" ? (
      <Badge tone="info">Installing...</Badge>
    ) : updaterStatus === "installed" ? (
      <Badge tone="success">
        <IconCheck size={12} />
        <span>Restart Required</span>
      </Badge>
    ) : updaterStatus === "offline" ? (
      <Badge tone="warning">
        <IconWifiOff size={12} />
        <span>Offline</span>
      </Badge>
    ) : updaterStatus === "not_configured" ? (
      <Badge tone="neutral">Offline / Local Build</Badge>
    ) : updaterStatus === "error" ? (
      <Badge tone="danger">
        <IconAlertTriangle size={12} />
        <span>Check Failed</span>
      </Badge>
    ) : (
      <Badge tone="neutral">Signed Auto-Update Ready</Badge>
    );

  return (
    <SettingCard
      id="settings-about"
      icon={<IconInfoCircle size={18} />}
      title="About AlgoJava"
      description="Version details, signed updates, detected Java runtime, and open-source notices."
      action={
        <Button
          variant="primary"
          size="sm"
          loading={updaterStatus === "checking"}
          disabled={isBusy}
          leftIcon={<IconRefresh size={14} />}
          onClick={() => void checkManually()}
        >
          {updaterStatus === "checking" ? "Checking..." : "Check for Updates"}
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
              {buildInfo?.appVersion ?? "1.0.0-alpha.1"}
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

      {/* Software Updates status & action panel */}
      <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconShieldCheck
              size={16}
              className="text-[var(--accent-light)] shrink-0"
            />
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Software Updates
            </span>
            {statusBadge}
          </div>
          <span className="algo-tabular text-[11px] text-[var(--text-muted)]">
            Last checked: {formatCheckTimestamp(lastUpdateCheckAt)}
          </span>
        </div>

        {updaterStatus === "up_to_date" && (
          <p className="text-xs text-[var(--text-secondary)]">
            You are running the latest available version of AlgoJava (v
            {buildInfo?.appVersion ?? "1.0.0-alpha.1"}).
          </p>
        )}

        {(updaterStatus === "offline" ||
          updaterStatus === "not_configured" ||
          updaterStatus === "error") &&
          errorMessage && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-xs text-[var(--text-secondary)]">
              <span>{errorMessage}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={() => void checkManually()}
              >
                Try Again
              </Button>
            </div>
          )}

        {availableUpdate && (
          <div className="space-y-2.5 rounded-[var(--radius-sm)] border border-[var(--accent-border)] bg-[var(--accent-soft)]/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">
                  AlgoJava v{availableUpdate.version} is available
                </div>
                {availableUpdate.date && (
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Released {new Date(availableUpdate.date).toLocaleDateString()}
                  </div>
                )}
              </div>
              {updaterStatus === "installed" ? (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<IconRefresh size={14} />}
                  onClick={() => void restartNow()}
                >
                  Restart Now
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isBusy}
                  leftIcon={<IconDownload size={14} />}
                  onClick={openInstallConfirmation}
                >
                  Download &amp; Install
                </Button>
              )}
            </div>

            <div className="max-h-28 overflow-y-auto whitespace-pre-wrap rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-2 text-xs text-[var(--text-secondary)]">
              {availableUpdate.notes}
            </div>

            {(updaterStatus === "downloading" ||
              updaterStatus === "installing") && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>
                    {updaterStatus === "installing"
                      ? "Verifying signature & installing..."
                      : "Downloading verified update..."}
                  </span>
                  <span className="algo-tabular font-semibold">
                    {progress.percent !== null ? `${progress.percent}%` : "..."}
                  </span>
                </div>
                <ProgressBar value={progress.percent ?? 40} heightClassName="h-1.5" />
              </div>
            )}
          </div>
        )}
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
