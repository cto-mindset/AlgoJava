# AlgoJava Release Runbook

This guide describes the operator workflow for cutting a signed Windows production or preview release of **AlgoJava**.

> **Important Repository Boundary**
> - **Private source repository**: `https://github.com/cto-mindset/AlgoJava` (`algojava`)
> - **Public distribution repository**: `https://github.com/cto-mindset/algojava-releases` (`algojava-releases`)
> - **Current status**: `cto-mindset/algojava-releases` does not yet exist on GitHub and must be created before triggering the first tag release. See [docs/RELEASE_ARCHITECTURE.md](docs/RELEASE_ARCHITECTURE.md).

---

## 1. One-Time Prerequisites

Before creating your first release tag:

1. Create the public repository `cto-mindset/algojava-releases` on GitHub (empty public repository initialized without source code).
2. Create and install a GitHub App with **Contents: Read and write** permission scoped strictly to `cto-mindset/algojava-releases`.
3. Generate the offline Ed25519 Tauri signing keypair (`bun run tauri signer generate`) and back up the private key + passphrase in an encrypted password manager / hardware backup **outside Git**.
4. Paste the **public** key string into `plugins.updater.pubkey` in `src-tauri/tauri.conf.json`.
5. Add all four secrets to **Settings → Secrets and variables → Actions** of the private `cto-mindset/AlgoJava` repository:
   - `GH_APP_ID`
   - `GH_APP_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

See [docs/RELEASE_ARCHITECTURE.md](docs/RELEASE_ARCHITECTURE.md) and [docs/UPDATE_CONFIGURATION.md](docs/UPDATE_CONFIGURATION.md) for full setup instructions.

---

## 2. Versioning Rules

AlgoJava strictly follows **SemVer** across all project manifests while maintaining a separate numeric Windows MSI `ProductVersion`:

| Channel | Tag Format | SemVer (`package.json`, `Cargo.toml`, `tauri.conf.json`) | Windows MSI (`bundle.windows.wix.version`) | Manifest Uploaded | Updates Stable `latest.json`? |
|---|---|---|---|---|---|
| **Alpha** | `v1.0.0-alpha.N` | `1.0.0-alpha.N` | `1.0.0.N` (numeric `<= 65535`) | `latest-preview.json` | **No** (`--prerelease --latest=false`) |
| **Beta** | `v1.0.0-beta.N` | `1.0.0-beta.N` | `1.0.0.N` | `latest-preview.json` | **No** (`--prerelease --latest=false`) |
| **Stable** | `v1.0.0` | `1.0.0` | `1.0.0` (or remove override / match numeric) | `latest.json` | **Yes** (`--latest`) |

> **Why `bundle.windows.wix.version` exists:** Windows Installer (`.msi`) rejects non-numeric prerelease segments such as `-alpha.1`. Keeping `"wix": { "version": "1.0.0.1" }` lets MSI packaging succeed without stripping `-alpha.1` or `-beta.1` from AlgoJava's application version or updater metadata.

**Keep these files aligned before tagging:**
1. `package.json` → `"version"`
2. `src-tauri/Cargo.toml` → `version` (and `src-tauri/Cargo.lock`)
3. `src-tauri/tauri.conf.json` → `"version"` and `"bundle.windows.wix.version"`
4. User-visible fallbacks (`splash.html`, `src/lib/tauri/storageClient.ts`, `src/features/settings/AboutSummaryCard.tsx`, `src/features/about/AboutPage.tsx`, `src/test/pages.test.tsx`)

---

## 3. Release Creation Procedure

1. **Ensure `main` is clean and synchronized**
   ```powershell
   git checkout main
   git pull origin main
   ```

2. **Run local pre-flight and quality gates**
   ```powershell
   bun run scripts/release/preflightCheck.ts --tag v1.0.0-alpha.1 --require-signing-key
   bun run typecheck
   bun run test
   bun run build
   cargo test --manifest-path src-tauri/Cargo.toml
   ```

3. **Commit any version bumps and push `main`**
   ```powershell
   git add <updated-files>
   git commit -m "chore(release): prepare vX.Y.Z"
   git push origin main
   ```

4. **Create an annotated SemVer tag and push the tag to trigger CI**
   ```powershell
   git tag -a vX.Y.Z -m "AlgoJava vX.Y.Z"
   git push origin vX.Y.Z
   ```

5. **Monitor `.github/workflows/release.yml`**
   - Job `verify-and-build` runs on `windows-latest`, verifies all tests + signing key alignment, builds signed `.msi` and `-setup.exe`, validates `latest.json` / `latest-preview.json`, and stages only distributable binaries into a temporary workflow artifact.
   - Job `publish-release` runs without checking out private source, authenticates with a scoped GitHub App installation token for `cto-mindset/algojava-releases`, uploads only the staged installers, `.sig` files, manifest, and `SHA256SUMS.txt`, and verifies every HTTPS asset URL returns HTTP 200.

6. **Post-release verification**
   - Visit `https://github.com/cto-mindset/algojava-releases/releases/tag/vX.Y.Z`.
   - Confirm zero source archives or private config files were uploaded (note GitHub auto-generated Source code archives still reflect the empty public repo, never private source).
   - Confirm `latest.json` (stable) or `latest-preview.json` (alpha/beta) lists both `windows-x86_64-nsis` and `windows-x86_64-msi`.
   - Test upgrading from the previous installed version via **Settings → About AlgoJava → Check for Updates**.

---

## 4. Troubleshooting

| Symptom | Likely Cause | Resolution |
|---|---|---|
| `Missing TAURI_SIGNING_PRIVATE_KEY repository secret` | Signing key secret not added in `cto-mindset/AlgoJava` | Add `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` in GitHub Secrets. |
| `plugins.updater.pubkey must contain a valid generated Tauri minisign public key` | `pubkey` in `tauri.conf.json` is empty or placeholder | Paste the contents of your generated `.pub` file into `plugins.updater.pubkey`. |
| `optional pre-release identifier in app version must be numeric-only` | Prerelease tag used without `bundle.windows.wix.version` | Set a 4-part numeric MSI version such as `"1.0.0.1"` in `tauri.conf.json`. |
| `publish-release` fails creating release on `algojava-releases` | Public repo not created or GitHub App not installed on it | Create `cto-mindset/algojava-releases` and grant the GitHub App `Contents: Read and write` access to it. |
| App updater reports signature verification failed | Artifact signed with a different key than `pubkey` in installed app | Never rotate keys mid-stream without shipping a signed transition build first; re-build with matching keypair. |
