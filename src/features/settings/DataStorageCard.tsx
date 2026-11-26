import React, { Suspense, useCallback, useEffect, useState } from "react";
import {
  IconDatabase,
  IconDownload,
  IconEye,
  IconFolderOpen,
  IconRefresh,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import {
  Button,
  ConfirmDialog,
  Dialog,
  Input,
  LoadingState,
  SettingCard,
} from "@/components/ui";
import {
  exportProgressBundle,
  getDatabaseDetails,
  importProgressBundle,
  resetAllProgress,
} from "@/lib/db/progressRepository";
import {
  pickExportJsonPath,
  pickImportJsonPath,
} from "@/lib/tauri/dialogClient";
import { formatNativeError } from "@/lib/tauri/env";
import { openLocalDirectory } from "@/lib/tauri/openerClient";
import {
  clearAppCache,
  exportProgressFile,
  getStorageInfo,
  importProgressFile,
} from "@/lib/tauri/storageClient";
import { formatBytes } from "@/lib/utils/format";
import { validateProgressExportBundle } from "@/lib/validation/importExportValidation";
import { useToastStore } from "@/stores/toastStore";
import type { DatabaseDetails, StorageInfo } from "@/types/models";

const LazyCodeEditor = React.lazy(
  () => import("@/features/editor/JavaCodeEditor")
);

export function DataStorageCard() {
  const pushToast = useToastStore((s) => s.pushToast);

  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [dbDetails, setDbDetails] = useState<DatabaseDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [previewJson, setPreviewJson] = useState<string | null>(null);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearCacheOpen, setConfirmClearCacheOpen] = useState(false);
  const [pendingImportRaw, setPendingImportRaw] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshStorage = useCallback(async () => {
    try {
      const info = await getStorageInfo();
      setStorageInfo(info);
    } catch {
      // Non-fatal in non-desktop mode
    }
  }, []);

  useEffect(() => {
    void refreshStorage();
  }, [refreshStorage]);

  const handleOpenDetails = async () => {
    try {
      const details = await getDatabaseDetails();
      setDbDetails(details);
      setDetailsOpen(true);
    } catch (err) {
      pushToast({
        title: "Failed to inspect database",
        description: formatNativeError(err),
        tone: "error",
      });
    }
  };

  const handleExport = async () => {
    setBusy(true);
    try {
      const bundle = await exportProgressBundle();
      const json = JSON.stringify(bundle, null, 2);
      const defaultName = `algojava-progress-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      const dest = await pickExportJsonPath(defaultName);
      if (!dest) {
        setPreviewJson(json);
        return;
      }
      const bytes = await exportProgressFile(dest, json);
      pushToast({
        title: "Progress exported",
        description: `Saved ${formatBytes(bytes)} to ${dest}`,
        tone: "success",
      });
    } catch (err) {
      pushToast({
        title: "Export failed",
        description: formatNativeError(err),
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const handlePickImport = async () => {
    try {
      const path = await pickImportJsonPath();
      if (!path) return;
      const raw = await importProgressFile(path);
      validateProgressExportBundle(raw);
      setPendingImportRaw(raw);
    } catch (err) {
      pushToast({
        title: "Invalid progress backup",
        description: formatNativeError(err),
        tone: "error",
      });
    }
  };

  const confirmImport = async () => {
    if (!pendingImportRaw) return;
    setBusy(true);
    try {
      const bundle = validateProgressExportBundle(pendingImportRaw);
      const res = await importProgressBundle(bundle);
      setPendingImportRaw(null);
      await refreshStorage();
      pushToast({
        title: "Progress imported",
        description: `Restored ${res.importedProgressCount} problem states and ${res.importedSubmissionsCount} submissions.`,
        tone: "success",
      });
    } catch (err) {
      pushToast({
        title: "Import failed",
        description: formatNativeError(err),
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const confirmResetProgress = async () => {
    setBusy(true);
    try {
      await resetAllProgress();
      setConfirmResetOpen(false);
      await refreshStorage();
      pushToast({
        title: "All user progress reset",
        description: "Submissions, drafts, and solve records were cleared.",
        tone: "info",
      });
    } catch (err) {
      pushToast({
        title: "Reset failed",
        description: formatNativeError(err),
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const confirmClearCache = async () => {
    setBusy(true);
    try {
      const res = await clearAppCache();
      setConfirmClearCacheOpen(false);
      await refreshStorage();
      pushToast({
        title: "Temporary cache cleared",
        description: `Removed ${res.removedEntries} cached execution artifact(s) (${formatBytes(
          res.clearedBytes
        )}). User progress was preserved.`,
        tone: "success",
      });
    } catch (err) {
      pushToast({
        title: "Cache cleanup failed",
        description: formatNativeError(err),
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingCard
      id="settings-storage"
      icon={<IconDatabase size={18} />}
      title="Data & Storage"
      description="Manage your local SQLite database, backups, and temporary execution cache."
    >
      <div className="space-y-1.5">
        <label
          htmlFor="settings-storage-location"
          className="block text-[13.5px] font-medium text-[var(--text-primary)]"
        >
          Storage Location
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="settings-storage-location"
            readOnly
            aria-label="Storage Location"
            value={storageInfo?.storageDir ?? "Loading..."}
            containerClassName="flex-1"
          />
          <Button
            variant="secondary"
            size="md"
            title="Open storage folder"
            onClick={() =>
              storageInfo && void openLocalDirectory(storageInfo.storageDir)
            }
            leftIcon={<IconFolderOpen size={15} />}
          >
            Open
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-3.5 py-2.5">
        <div>
          <span className="text-xs text-[var(--text-muted)]">Database Size</span>
          <div className="algo-tabular text-sm font-semibold text-[var(--text-primary)]">
            {storageInfo ? formatBytes(storageInfo.dbSizeBytes) : "—"}
            {storageInfo && storageInfo.cacheSizeBytes > 0 && (
              <span className="ml-2 text-xs font-normal text-[var(--text-secondary)]">
                (Cache: {formatBytes(storageInfo.cacheSizeBytes)})
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<IconEye size={14} />}
          onClick={() => void handleOpenDetails()}
        >
          View Details
        </Button>
      </div>

      {/* Backup & Restore */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
        <div>
          <h3 className="text-[13.5px] font-medium text-[var(--text-primary)]">
            Backup &amp; Restore
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Export or merge your problem progress and submissions as JSON.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            leftIcon={<IconDownload size={14} />}
            onClick={() => void handleExport()}
          >
            Export Progress
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            leftIcon={<IconUpload size={14} />}
            onClick={() => void handlePickImport()}
          >
            Import Progress
          </Button>
        </div>
      </div>

      {/* Maintenance & Danger Zone */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--status-danger-border)]/70 bg-[var(--status-danger-soft)]/50 px-4 py-3">
        <div>
          <h3 className="text-[13.5px] font-medium text-[var(--text-primary)]">
            Cache &amp; Progress Reset
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Clear temporary compile files safely, or reset all saved SQLite progress.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            leftIcon={<IconTrash size={14} />}
            onClick={() => setConfirmClearCacheOpen(true)}
          >
            Clear Cache
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={busy}
            leftIcon={<IconRefresh size={14} />}
            onClick={() => setConfirmResetOpen(true)}
          >
            Reset Progress
          </Button>
        </div>
      </div>

      {/* Database Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title="SQLite Database Details"
        description={storageInfo?.dbFilePath ?? "algojava.db"}
      >
        {dbDetails && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--bg-input)] px-3 py-2 border border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">
                Applied Schema Migration Version
              </span>
              <span className="algo-tabular font-semibold text-[var(--accent-light)]">
                v{dbDetails.schemaVersion}
              </span>
            </div>

            <div className="divide-y divide-[var(--border-subtle)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
              {dbDetails.tables.map((t) => (
                <div
                  key={t.tableName}
                  className="flex items-center justify-between px-3.5 py-2"
                >
                  <span className="font-mono text-[var(--text-primary)]">
                    {t.tableName}
                  </span>
                  <span className="algo-tabular font-semibold text-[var(--text-secondary)]">
                    {t.rowCount} rows
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Dialog>

      {/* JSON Export Preview (CodeMirror JSON mode) */}
      <Dialog
        open={previewJson !== null}
        onClose={() => setPreviewJson(null)}
        title="Exported Progress JSON Preview"
        description="Read-only JSON backup preview rendered via CodeMirror 6."
        maxWidthClass="max-w-2xl"
      >
        <div className="h-72 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
          {previewJson && (
            <Suspense fallback={<LoadingState label="Loading JSON viewer..." />}>
              <LazyCodeEditor value={previewJson} language="json" readOnly />
            </Suspense>
          )}
        </div>
      </Dialog>

      <ConfirmDialog
        open={pendingImportRaw !== null}
        onClose={() => setPendingImportRaw(null)}
        onConfirm={confirmImport}
        loading={busy}
        title="Import Progress Backup?"
        message="This will merge the selected backup's problem progress, notes, and submission history into your local SQLite database."
        confirmLabel="Import Backup"
      />

      <ConfirmDialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={confirmResetProgress}
        loading={busy}
        danger
        title="Reset All Progress?"
        message="This permanently deletes all your submissions, solved statuses, drafts, and notes from the local SQLite database. Built-in problems and settings will remain intact."
        confirmLabel="Reset All Progress"
      />

      <ConfirmDialog
        open={confirmClearCacheOpen}
        onClose={() => setConfirmClearCacheOpen(false)}
        onConfirm={confirmClearCache}
        loading={busy}
        title="Clear Temporary Execution Cache?"
        message="This removes only leftover temporary Java compile/run folders in the application cache directory. Your database, submissions, and progress are never touched."
        confirmLabel="Clear Cache"
      />
    </SettingCard>
  );
}
