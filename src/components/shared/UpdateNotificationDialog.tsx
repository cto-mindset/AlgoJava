import {
  IconAlertTriangle,
  IconCheck,
  IconDownload,
  IconRefresh,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { Badge, Button, Dialog, ProgressBar } from "@/components/ui";
import { MarkdownContent } from "@/components/shared/MarkdownContent";
import { useUpdaterStore } from "@/stores/updaterStore";

function formatTransferSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function UpdateNotificationDialog() {
  const status = useUpdaterStore((s) => s.status);
  const availableUpdate = useUpdaterStore((s) => s.availableUpdate);
  const progress = useUpdaterStore((s) => s.progress);
  const errorMessage = useUpdaterStore((s) => s.errorMessage);
  const notificationOpen = useUpdaterStore((s) => s.notificationOpen);
  const confirmOpen = useUpdaterStore((s) => s.confirmOpen);
  const dismissNotification = useUpdaterStore((s) => s.dismissNotification);
  const openInstallConfirmation = useUpdaterStore(
    (s) => s.openInstallConfirmation
  );
  const closeInstallConfirmation = useUpdaterStore(
    (s) => s.closeInstallConfirmation
  );
  const confirmDownloadAndInstall = useUpdaterStore(
    (s) => s.confirmDownloadAndInstall
  );
  const checkManually = useUpdaterStore((s) => s.checkManually);
  const restartNow = useUpdaterStore((s) => s.restartNow);

  const isBusy = status === "downloading" || status === "installing";
  const open = (notificationOpen || confirmOpen) && (Boolean(availableUpdate) || status === "error" || status === "installed");

  if (!open) return null;

  const isConfirmStage = confirmOpen;

  const handleClose = () => {
    if (isBusy) return;
    if (isConfirmStage) {
      closeInstallConfirmation();
    } else {
      dismissNotification(false);
    }
  };

  const title =
    status === "installed"
      ? "Update Ready to Finish"
      : status === "downloading"
      ? "Downloading AlgoJava Update"
      : status === "installing"
      ? "Installing Verified Update"
      : status === "error" && isConfirmStage
      ? "Update Installation Interrupted"
      : isConfirmStage
      ? "Confirm Software Update"
      : "Update Available";

  const footer =
    status === "downloading" || status === "installing" ? (
      <span className="text-xs text-[var(--text-muted)]">
        Please wait while the signed installer is verified and prepared.
      </span>
    ) : status === "installed" ? (
      <>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<IconRefresh size={14} />}
          onClick={() => void restartNow()}
        >
          Restart AlgoJava
        </Button>
      </>
    ) : status === "error" && isConfirmStage ? (
      <>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<IconRefresh size={14} />}
          onClick={() => void checkManually()}
        >
          Check Again
        </Button>
      </>
    ) : isConfirmStage ? (
      <>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<IconDownload size={14} />}
          onClick={() => void confirmDownloadAndInstall()}
        >
          Download &amp; Install
        </Button>
      </>
    ) : (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dismissNotification(true)}
        >
          Skip Version
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => dismissNotification(false)}
        >
          Later
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<IconDownload size={14} />}
          onClick={openInstallConfirmation}
        >
          Review &amp; Install
        </Button>
      </>
    );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={title}
      description={
        availableUpdate
          ? `AlgoJava v${availableUpdate.version} (installed: v${availableUpdate.currentVersion})`
          : undefined
      }
      footer={footer}
    >
      <div className="space-y-4">
        {availableUpdate && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">
              <IconSparkles size={12} />
              <span>v{availableUpdate.version}</span>
            </Badge>
            <Badge tone="success">
              <IconShieldCheck size={12} />
              <span>Ed25519 Signed</span>
            </Badge>
            {availableUpdate.date && (
              <span className="text-xs text-[var(--text-muted)]">
                Published {new Date(availableUpdate.date).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {status === "error" && errorMessage && (
          <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--status-danger-border)] bg-[var(--status-danger-soft)] p-3 text-xs text-[var(--text-primary)]">
            <IconAlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-[var(--status-danger)]"
            />
            <span>{errorMessage}</span>
          </div>
        )}

        {status === "downloading" && (
          <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-primary)]">
                Downloading signed installer...
              </span>
              <span className="algo-tabular font-semibold text-[var(--accent-light)]">
                {progress.percent !== null ? `${progress.percent}%` : formatTransferSize(progress.downloadedBytes)}
              </span>
            </div>
            <ProgressBar value={progress.percent ?? 35} />
            <div className="algo-tabular text-[11px] text-[var(--text-muted)]">
              {progress.totalBytes
                ? `${formatTransferSize(progress.downloadedBytes)} / ${formatTransferSize(progress.totalBytes)}`
                : `${formatTransferSize(progress.downloadedBytes)} downloaded`}
            </div>
          </div>
        )}

        {status === "installing" && (
          <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3 text-xs text-[var(--text-primary)]">
            <IconShieldCheck
              size={16}
              className="shrink-0 text-[var(--accent-light)]"
            />
            <span>
              Signature verified. Launching the Windows installer — AlgoJava may restart automatically.
            </span>
          </div>
        )}

        {status === "installed" && (
          <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--status-success-border)] bg-[var(--status-success-soft)] p-3 text-xs text-[var(--text-primary)]">
            <IconCheck
              size={16}
              className="shrink-0 text-[var(--status-success)]"
            />
            <span>
              Update installation completed. Restart AlgoJava if it did not relaunch automatically.
            </span>
          </div>
        )}

        {availableUpdate && (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Release Notes
            </div>
            <div className="max-h-56 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-3.5">
              <MarkdownContent content={availableUpdate.notes} />
            </div>
          </div>
        )}

        {isConfirmStage &&
          status !== "downloading" &&
          status !== "installing" &&
          status !== "installed" &&
          status !== "error" && (
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              AlgoJava verifies the Ed25519 signature and signed release version before installing. The application will close briefly during installation and relaunch afterward.
            </p>
          )}
      </div>
    </Dialog>
  );
}
