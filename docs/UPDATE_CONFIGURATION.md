# AlgoJava Update & Signing Configuration

This document details Tauri 2 Ed25519 update signing, offline key lifecycle management, updater configuration, and desktop UX behavior in AlgoJava.

---

## 1. Ed25519 Key Generation & Secure Backup

Tauri 2 uses **minisign / Ed25519** asymmetric signatures (`tauri-plugin-updater`) to guarantee that update binaries come from your release key and have not been tampered with or rolled back.

### Generate Production Keypair (Offline on Trusted Maintainer Machine)
Run via Bun (never commit the private key to Git or store it in `src/`):

```powershell
mkdir "$env:USERPROFILE\.tauri" -Force
bun run tauri signer generate -w "$env:USERPROFILE\.tauri\algojava-updater.key"
```

This outputs:
1. **Private key**: saved at `%USERPROFILE%\.tauri\algojava-updater.key` (encrypted with your passphrase).
2. **Public key** (`.pub` / printed to terminal): safe to embed publicly in `src-tauri/tauri.conf.json` under `plugins.updater.pubkey`.

### Mandatory Key Backup & Recovery
- Store the private `.key` file contents and passphrase in **two independent encrypted backups** (e.g., primary enterprise/personal password manager + encrypted offline USB drive).
- Set GitHub Actions secrets in private `cto-mindset/AlgoJava`:
  - `TAURI_SIGNING_PRIVATE_KEY`: raw contents of `algojava-updater.key`.
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: exact passphrase used when generating the key.
- Never reuse throwaway test keys for production releases, and never disable signature verification.
- **If the private key is lost**: existing installed builds trusting the old `pubkey` cannot auto-update to binaries signed by a new key and must be reinstalled manually. Always back up before publishing any build that trusts a key.
- **If the private key is compromised**: revoke GitHub release publishing credentials immediately, replace `TAURI_SIGNING_PRIVATE_KEY`, update `plugins.updater.pubkey` in `tauri.conf.json`, publish a clear advisory + manually verified clean installer, and delete tampered releases.

---

## 2. Tauri Configuration (`src-tauri/tauri.conf.json`)

Relevant updater & bundler configuration:

```json
{
  "bundle": {
    "createUpdaterArtifacts": true,
    "windows": {
      "nsis": {
        "installerIcon": "icons/icon.ico"
      },
      "wix": {
        "version": "1.0.0.1"
      }
    }
  },
  "plugins": {
    "updater": {
      "pubkey": "",
      "endpoints": [
        "https://github.com/cto-mindset/algojava-releases/releases/latest/download/latest.json"
      ],
      "requireSignedVersion": true,
      "windows": {
        "installMode": "passive"
      }
    }
  }
}
```

### Security Properties
- **`pubkey`**: Set to your generated public key string before tagging the first signed release. Left blank (`""`) intentionally until keys are generated.
- **`endpoints`**: Strictly HTTPS (`https://github.com/cto-mindset/algojava-releases/releases/latest/download/latest.json`).
- **`requireSignedVersion: true`**: Prevents rollback/downgrade attacks where an attacker replays a genuine older signed installer under a forged higher manifest `version`.
- **`windows.installMode: "passive"`**: Displays clean Windows progress UI during update installation and preserves automatic relaunch (`restartAfterInstall: true`).
- **No TLS bypasses**: `dangerousInsecureTransportProtocol`, `dangerousAcceptInvalidCerts`, and `dangerousAcceptInvalidHostnames` are strictly forbidden and enforced as errors by `scripts/release/preflightCheck.ts`.
- **Least-privilege capabilities**: `src-tauri/capabilities/default.json` grants `"updater:default"` only to the `"main"` window; `src-tauri/capabilities/splash.json` has zero updater permissions.

---

## 3. Desktop Update UX Behavior

### Automatic Startup Check (`AppProviders.tsx` + `updaterStore.ts`)
- Scheduled `6000 ms` after application hydration via non-blocking timer (`START_UPDATE_DELAY_MS`).
- Never delays splash screen dismissal or workspace readiness.
- Skips silently when offline, when running in non-Tauri browser dev/test mode, or when `is_updater_configured` returns `false`.
- Checks once per application session; records `lastUpdateCheckAt` in local `settings.json`.
- Shows `UpdateNotificationDialog` only when an update is available and its version has not been dismissed via **Skip Version**.
- Never downloads or installs automatically without explicit user confirmation.

### Manual Update Check (`Settings → About AlgoJava`)
- Displays current installed version, update status badge, and `Last checked` timestamp.
- **Check for Updates** button checks immediately and prevents overlapping checks or downloads.
- States covered: idle, checking, up-to-date, update available (with release notes), confirmation dialog, live download progress bar (`%` and bytes), installing, restart prompt, offline, unconfigured local build, and sanitized error messages with retry.

---

## 4. Local Cryptographic & Behavior Verification vs. Live Release Verification

Before publishing to `cto-mindset/algojava-releases`, local builds verify:
- `bun run tauri build` emits `.msi`, `.msi.sig`, `-setup.exe`, and `-setup.exe.sig` when `createUpdaterArtifacts: true` and `TAURI_SIGNING_PRIVATE_KEY` are supplied.
- `scripts/release/generateManifest.ts` emits valid `latest.json` / `latest-preview.json` referencing both `windows-x86_64-nsis` and `windows-x86_64-msi`.
- Unit tests verify confirmation gates, offline handling, concurrent lockouts, sanitized error mapping, and signature rejection.

True end-to-end upgrade verification (`vOld -> vNew` over HTTPS) requires creating `cto-mindset/algojava-releases`, setting the production `pubkey` and GitHub secrets, publishing a real signed baseline release + newer signed release, and testing an installed older build against it.
