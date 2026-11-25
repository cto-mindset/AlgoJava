import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  IconCode,
  IconExternalLink,
  IconInfoCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { Button, Dialog } from "@/components/ui";
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
    <section className="algo-surface p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent-light)]">
          <IconInfoCircle size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            About AlgoJava
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Version information, runtime status, and credits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-center text-xs">
        <div className="sm:col-span-3 flex flex-col items-center justify-center gap-1.5 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-light)]">
            <IconCode size={22} />
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)]">
            Algo<span className="text-[var(--accent-light)]">Java</span>
          </span>
        </div>

        <div className="sm:col-span-5 space-y-1.5">
          <div className="flex justify-between gap-2">
            <span className="text-[var(--text-secondary)]">Version:</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {buildInfo?.appVersion ?? "0.1.0"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[var(--text-secondary)]">Build:</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {buildInfo ? `${buildInfo.buildDate} (${buildInfo.buildProfile})` : "2026.11.25"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[var(--text-secondary)]">Java Runtime:</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {jdkInfo?.detected ? jdkInfo.version ?? "Detected" : "Not Detected"}
            </span>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              loading={checkingUpdate}
              leftIcon={<IconRefresh size={14} />}
              onClick={() => void handleCheckUpdates()}
            >
              Check for Updates
            </Button>
          </div>
        </div>

        <div className="sm:col-span-4 space-y-2 sm:pl-4 sm:border-l sm:border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setLicenseOpen(true)}
            className="flex w-full items-center justify-between text-[var(--accent-light)] hover:underline cursor-pointer"
          >
            <span>License</span>
            <IconExternalLink size={13} />
          </button>
          <button
            type="button"
            onClick={() => navigate("/about")}
            className="flex w-full items-center justify-between text-[var(--accent-light)] hover:underline cursor-pointer"
          >
            <span>Open Source Libraries</span>
            <IconExternalLink size={13} />
          </button>
          <button
            type="button"
            onClick={() => navigate("/about")}
            className="flex w-full items-center justify-between text-[var(--accent-light)] hover:underline cursor-pointer"
          >
            <span>Credits</span>
            <IconExternalLink size={13} />
          </button>
        </div>
      </div>

      <Dialog
        open={licenseOpen}
        onClose={() => setLicenseOpen(false)}
        title="Project License Notice"
      >
        <div className="space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
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
    </section>
  );
}
