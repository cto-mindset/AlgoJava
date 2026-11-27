# AlgoJava Release Architecture

This document defines the production two-repository distribution and cross-repository publishing architecture for **AlgoJava**.

---

## 1. Repository Split & Threat Model

| Logical Role | GitHub Repository | Visibility | Purpose |
|---|---|---|---|
| **Private Source** (`algojava`) | `https://github.com/cto-mindset/AlgoJava` | **Private** | Application source code, Rust backend, Vitest/Cargo tests, release scripts, CI build workflow. |
| **Public Distribution** (`algojava-releases`) | `https://github.com/cto-mindset/algojava-releases` | **Public** *(pending creation)* | Public GitHub Releases hosting signed Windows `.msi` and `-setup.exe` installers, `.sig` signatures, updater manifests, and `SHA256SUMS.txt`. |

### Strict Separation Guarantees
1. Private source code stays private inside `cto-mindset/AlgoJava`.
2. GitHub Actions splits CI into two isolated jobs:
   - `verify-and-build` checks out the private repo, runs all quality gates, signs installers, validates the updater manifest, and stages an **allowlisted artifact folder** (`release-assets/`).
   - `publish-release` does **not** check out the private repository. It downloads only the staged artifacts, enforces an extension allowlist (`*.msi`, `*.msi.sig`, `*-setup.exe`, `*-setup.exe.sig`, `latest.json`, `latest-preview.json`, `SHA256SUMS.txt`), and publishes solely to `cto-mindset/algojava-releases`.
3. Neither `GITHUB_TOKEN` (private repo read-only) nor the GitHub App private key nor `TAURI_SIGNING_PRIVATE_KEY` is ever bundled into the compiled application or exposed to frontend code.

---

## 2. Required GitHub Setup (Manual Steps)

Because `git ls-remote https://github.com/cto-mindset/algojava-releases.git` confirmed the public distribution repository does not yet exist, complete these steps once before running a live release:

### A. Create the Public Release Repository
1. On GitHub under owner `cto-mindset`, create a new **Public** repository named `algojava-releases`.
2. Initialize it with a short `README.md` explaining that it hosts official signed binaries for AlgoJava (no application source code should ever be pushed to it).

### B. Create a Least-Privilege GitHub App
Avoid Personal Access Tokens (PATs), which are user-scoped and hard to restrict cleanly. Use a dedicated GitHub App owned by `cto-mindset`:

1. Navigate to **GitHub Settings → Developer settings → GitHub Apps → New GitHub App**.
2. Suggested name: `algojava-release-publisher`.
3. Homepage URL: `https://github.com/cto-mindset/algojava-releases`.
4. Webhook: **Uncheck Active** (not needed).
5. **Repository permissions** (minimum required):
   - **Contents**: `Read and write`
   - Leave all other permissions set to `No access`.
6. **Where can this GitHub App be installed?**: `Only on this account`.
7. Create the App, note its **App ID**, and click **Generate a private key** (`.pem` file).
8. Under **Install App**, install it on `cto-mindset` and choose **Only select repositories → `cto-mindset/algojava-releases`** (do **not** grant access to `AlgoJava` or other repos).

### C. Configure GitHub Actions Secrets on `cto-mindset/AlgoJava`
In `cto-mindset/AlgoJava` → **Settings → Secrets and variables → Actions**:

| Secret Name | Value | Used By Job |
|---|---|---|
| `GH_APP_ID` | Numeric GitHub App ID | `publish-release` |
| `GH_APP_PRIVATE_KEY` | Contents of the downloaded GitHub App `.pem` file | `publish-release` |
| `TAURI_SIGNING_PRIVATE_KEY` | Base64 / minisign private key generated via `bun run tauri signer generate` | `verify-and-build` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Passphrase chosen during `tauri signer generate` | `verify-and-build` |

> `GITHUB_TOKEN` is automatically provided by GitHub Actions with `contents: read` in `verify-and-build` and `permissions: {}` in `publish-release`.

---

## 3. Workflow Pipeline (`.github/workflows/release.yml`)

Triggered only when pushing SemVer tags matching `v*`:

1. **Preflight & Metadata (`verify-and-build`)**:
   - Fails immediately if `TAURI_SIGNING_PRIVATE_KEY` is missing or if `scripts/release/preflightCheck.ts --tag <tag> --require-signing-key` detects mismatched versions (`package.json`, `Cargo.toml`, `tauri.conf.json`), invalid MSI numeric version, HTTP endpoints, or an empty `plugins.updater.pubkey`.
2. **Quality Gates**:
   - `bun install --frozen-lockfile`
   - `bun run typecheck`
   - `bun run test`
   - `cargo test --manifest-path src-tauri/Cargo.toml`
   - `bun run build`
3. **Signed Packaging**:
   - `bun run tauri build` compiles `algojava.exe`, packages `AlgoJava_<version>_x64_en-US.msi` and `AlgoJava_<version>_x64-setup.exe`, and signs both installers into `.msi.sig` and `-setup.exe.sig`.
4. **Manifest & Checksum Staging**:
   - `scripts/release/generateManifest.ts` emits `latest.json` (for stable `vX.Y.Z`) or `latest-preview.json` (for `-alpha.*` / `-beta.*`), validates HTTPS URLs and signature fields, and writes `SHA256SUMS.txt`.
5. **Cross-Repo Publishing (`publish-release`)**:
   - Generates a short-lived installation token via `actions/create-github-app-token@v1` scoped strictly to `cto-mindset/algojava-releases`.
   - Uploads only allowlisted distributable files using `gh release`.
   - Stable tags use `--latest`; prerelease tags use `--prerelease --latest=false` so preview builds never overwrite `/releases/latest/download/latest.json`.
   - Verifies HTTP 200 availability and JSON schema on the published release URLs.

---

## 4. Channel Separation Strategy

- **Stable update endpoint** (configured in `src-tauri/tauri.conf.json`):
  `https://github.com/cto-mindset/algojava-releases/releases/latest/download/latest.json`
- **Preview channel separation (current vs future behavior)**:
  Alpha (`v1.0.0-alpha.N`) and Beta (`v1.0.0-beta.N`) tags generate a per-tag `latest-preview.json` artifact and publish with `--prerelease --latest=false`. Therefore:
  1. Stable installations querying `/releases/latest/download/latest.json` **never** receive alpha or beta updates.
  2. Alpha/beta builds also currently point only to `/releases/latest/download/latest.json` (so they can upgrade to the next **stable** release once `>= 1.0.0`, without auto-updating to another prerelease automatically).
  3. **Future preview auto-update delivery**: when rolling preview auto-updates are desired, preview builds can either target a dedicated floating `preview` release asset (`https://github.com/cto-mindset/algojava-releases/releases/download/preview/latest-preview.json`) or a GitHub Pages static channel manifest updated during `--prerelease` publishes — without changing the stable `latest.json` contract.
