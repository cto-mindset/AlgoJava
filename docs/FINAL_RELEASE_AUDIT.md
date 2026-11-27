# AlgoJava — Final Release Architecture Audit

**Audit scope:** Independent code inspection of `cto-mindset/AlgoJava` (private source repository) covering Tauri 2 packaging, Ed25519 update signing, GitHub Actions cross-repository publishing to `cto-mindset/algojava-releases`, runtime updater UX, upgrade compatibility, and release automation tests.

> **Production Readiness Status: NOT READY YET**
> Local source code, security controls, and unit/build validations are verified below, **but production readiness must not be claimed until**:
> 1. `cto-mindset/algojava-releases` is created, the GitHub App is installed, production Ed25519 keys are generated & backed up, and all 4 GitHub Secrets + `plugins.updater.pubkey` are configured.
> 2. Real signed Windows installers are built in CI, published to `cto-mindset/algojava-releases`, and tested end-to-end upgrading an older installed build on Windows.

---

## 1. Verified (Inspected in Source Code)

1. **Stable endpoint exclusivity (Item 1)**
   - [src-tauri/tauri.conf.json](file:///C:/Users/Pigeon/Documents/AlgoJava/src-tauri/tauri.conf.json) configures a single updater endpoint: `https://github.com/cto-mindset/algojava-releases/releases/latest/download/latest.json`.
   - `scripts/release/preflightCheck.ts` now enforces `endpoints.length === 1 && endpoints[0] === expectedStableEndpoint`.
   - `Verify` in [src-tauri/src/commands/system.rs](file:///C:/Users/Pigeon/Documents/AlgoJava/src-tauri/src/commands/system.rs) enforces that every endpoint uses `https://`.
2. **Preview update strategy separation (Items 2–3)**
   - Alpha/beta tags (`v*-alpha.*`, `v*-beta.*`) emit `latest-preview.json` and publish with `--prerelease --latest=false` in [.github/workflows/release.yml](file:///C:/Users/Pigeon/Documents/AlgoJava/.github/workflows/release.yml), so `/releases/latest/download/latest.json` is never overwritten by preview builds.
   - Documentation ([RELEASE.md](file:///C:/Users/Pigeon/Documents/AlgoJava/RELEASE.md), [docs/RELEASE_ARCHITECTURE.md](file:///C:/Users/Pigeon/Documents/AlgoJava/docs/RELEASE_ARCHITECTURE.md)) explicitly clarifies that preview builds currently query only stable `latest.json` (upgradeable to future stable releases) while `latest-preview.json` is a per-tag manifest foundation for a future rolling preview channel.
3. **Tauri Windows platform identifiers (Item 4)**
   - Verified directly against installed `tauri-plugin-updater-2.14.1` (`src/updater.rs`): `{os}-{arch}-{bundle_type}` resolves to `windows-x86_64-msi` (WiX MSI) and `windows-x86_64-nsis` (NSIS EXE), with `windows-x86_64` fallback.
   - `buildUpdaterManifest` in [scripts/release/releaseMetadata.ts](file:///C:/Users/Pigeon/Documents/AlgoJava/scripts/release/releaseMetadata.ts) emits all three keys, and `validateUpdaterManifest` verifies `.msi` vs `-setup.exe` URL extensions match their targets.
4. **Signatures & checksums integrity (Items 5–6)**
   - `generateManifest.ts` stages `.msi`, `.msi.sig`, `-setup.exe`, `-setup.exe.sig`, validates trusted comments (`file:` and `version:`), runs cryptographic Ed25519 + BLAKE2b-512 verification when `--verify-pubkey` / `--pubkey` is supplied, and writes `SHA256SUMS.txt` directly from the staged files.
   - `publish-release` executes `sha256sum -c SHA256SUMS.txt` on the downloaded artifact directory before uploading.
5. **Minimal GitHub App & job permissions (Item 7)**
   - Top-level `.github/workflows/release.yml` sets `permissions: {}`.
   - `verify-and-build` uses `permissions: { contents: read }`.
   - `publish-release` uses `permissions: {}` and requests an installation token via `actions/create-github-app-token@v1` scoped solely to `owner: cto-mindset`, `repositories: algojava-releases`.
6. **Zero private source/config exposure (Items 8 & 15)**
   - `publish-release` does **not** run `actions/checkout` on private `AlgoJava`. It downloads only the staged artifact and enforces a strict 6-file regular-file allowlist (`*.msi`, `*.msi.sig`, `*-setup.exe`, `*-setup.exe.sig`, `latest.json` or `latest-preview.json`, `SHA256SUMS.txt`).
   - Release notes in CI are derived solely from the annotated tag message (never internal `git log` commit subjects) and passed via `--notes-file` into both GitHub Release body and updater manifest `notes`.
7. **Failure isolation & idempotent re-run protection (Items 9–10)**
   - `publish-release` has `needs: verify-and-build`; any failed lint/test/build/preflight/signing check blocks publishing.
   - `publish-release` refuses to overwrite an already-published release (`isDraft != "true"`), creates new releases as `--draft`, verifies 6 assets are attached, and only then flips `--draft=false`.
8. **Signature verification cannot be bypassed (Item 11)**
   - `requireSignedVersion: true` is set in `tauri.conf.json` and enforced by `preflightCheck.ts` and Rust `is_valid_updater_config_value`.
   - No `dangerousInsecureTransportProtocol`, `dangerousAcceptInvalidCerts`, or `dangerousAcceptInvalidHostnames` flags exist anywhere in `tauri.conf.json` or Rust updater builder (`lib.rs`).
   - Least-privilege capability `src-tauri/capabilities/default.json` grants `"updater:default"` only to `"main"`.
9. **User data & upgrade compatibility (Items 12–13)**
   - `storage_service.rs` stores `algojava.db` in OS `app_config_dir` (AppData) and temporary run files in `app_cache_dir/java_runs`; WiX installer installs binaries cleanly into `ProgramFiles64Folder\AlgoJava` (`UpgradeCode: c79f0c4d-8be8-5720-a5c7-227190fa7f9c`) without deleting AppData.
   - `settingsStore.ts` merges stored settings onto `DEFAULT_SETTINGS`, so older `settings.json` lacking `lastUpdateCheckAt` / `dismissedUpdateVersion` seamlessly upgrade with `null` defaults.
   - `src-tauri/src/database/migrations.rs` uses strictly versioned monotonic `CREATE TABLE IF NOT EXISTS` and `INSERT OR IGNORE` idempotent migrations (`001`, `002`).
10. **Restart behavior & 6-way version alignment (Item 14 + Version Matrix)**
   - `downloadAndInstallPendingUpdate` passes `{ restartAfterInstall: true }` with `windows.installMode: "passive"`, which launches MSI `AUTOLAUNCHAPP=True` / NSIS `/P /R`, plus UI fallback calling `restart_app` (`app.restart()`).

### Version Alignment Matrix (Current Snapshot — Unmodified)
| Artifact | Value | Checked By |
|---|---|---|
| `package.json` `"version"` | `1.0.0-alpha.1` | `preflightCheck.ts` + `releaseManifest.test.ts` |
| `src-tauri/Cargo.toml` `version` | `1.0.0-alpha.1` | `preflightCheck.ts` |
| `src-tauri/tauri.conf.json` `"version"` | `1.0.0-alpha.1` | `preflightCheck.ts` |
| Git tag (expected for alpha.1) | `v1.0.0-alpha.1` | `parseReleaseTag` |
| `bundle.windows.wix.version` (MSI numeric) | `1.0.0.1` | `validateVersionAlignment` + `validateMsiVersion` (`major.minor.patch` must match tag!) |
| Updater manifest `version` (`latest*.json`) | `1.0.0-alpha.1` (from tag) | `generateManifest.ts` + `validateUpdaterManifest` + workflow `jq` verification |

---

## 2. Issues Found During Audit

1. **Private commit log exposure in release notes**: `release.yml` previously ran `git log "${PREV_TAG}..${TAG}" --pretty=format:"- %s"`, which could expose internal private commit messages on the public `algojava-releases` GitHub Release and inside `latest*.json`.
2. **Published release overwrite hazard on workflow re-run**: `release.yml` previously ran `gh release upload --clobber` and `gh release edit` directly against existing published releases, allowing a workflow re-run with newly built binaries/signatures to silently mutate an already-published tag.
3. **Lack of atomic draft staging & checksum check in publish job**: Releases were created/edited live without `--draft`, and `publish-release` did not verify `SHA256SUMS.txt` or exact file count (`6`) before uploading.
4. **Missing cryptographic `.sig` verification inside `generateManifest.ts`**: Before CI upload, `generateManifest.ts` only checked non-empty `.sig` files rather than verifying minisign `file:`/`version:` trusted comments and Ed25519 cryptographic signatures against `plugins.updater.pubkey`.
5. **MSI `major.minor.patch` drift risk**: `validateVersionAlignment` checked MSI numeric bounds (`<= 255 / 65535`) but did not verify that `wix.version`'s base `major.minor.patch` actually matched the SemVer tag (risking stale `1.0.0.1` on `v1.1.0`).
6. **Weak Rust config check (`is_valid_updater_config_value`)**: Previously only checked non-empty `pubkey` and `.any(...)` HTTPS endpoints rather than validating base64 minisign public key structure, `.all(...)` HTTPS endpoints, `requireSignedVersion == true`, and absence of `dangerous*` TLS bypass flags.
7. **TLS error misclassification in frontend client**: `updaterClient.ts` mapped `"tls"` / `"certificate"` errors under `"offline"` instead of security verification (`"signature"`).
8. **MSI / NSIS extension ambiguity & multiple-endpoint tolerance**: `validateUpdaterManifest` did not reject swapped `.msi` / `-setup.exe` URLs, `findArtifactPair` did not reject duplicate matching installers, and `preflightCheck.ts` allowed extra endpoints besides stable `latest.json`.
9. **Preview channel wording ambiguity**: Docs risked implying preview builds automatically self-update from `latest-preview.json` even though desktop builds only point to stable `latest.json`.

---

## 3. Fixed in This Audit

- **[.github/workflows/release.yml](file:///C:/Users/Pigeon/Documents/AlgoJava/.github/workflows/release.yml)**:
  - Replaced commit-history `git log` notes with explicit annotated tag message notes (`git tag -l --format='%(contents)'`).
  - Passed `--verify-pubkey` to `generateManifest.ts` in `verify-and-build`.
  - Enforced `sha256sum -c SHA256SUMS.txt` + exact 6-file regular-file allowlist in `publish-release`.
  - Switched publishing to atomic **draft-first (`--draft`), asset-count verified, immutable-release guarded** flow (refuses to overwrite non-draft published releases).
  - Asserted exact `manifest.version == version` in post-publish check for both stable and preview releases.
- **[scripts/release/verifySignature.ts](file:///C:/Users/Pigeon/Documents/AlgoJava/scripts/release/verifySignature.ts)** & **[scripts/release/generateManifest.ts](file:///C:/Users/Pigeon/Documents/AlgoJava/scripts/release/generateManifest.ts)**:
  - Added full minisign trusted-comment (`file:` + `version:`) and BLAKE2b-512 + Ed25519 signature verification before manifest output.
  - Rejected ambiguous multiple installer matches for the same version.
- **[scripts/release/releaseMetadata.ts](file:///C:/Users/Pigeon/Documents/AlgoJava/scripts/release/releaseMetadata.ts)** & **[scripts/release/preflightCheck.ts](file:///C:/Users/Pigeon/Documents/AlgoJava/scripts/release/preflightCheck.ts)**:
  - Enforced `wix.version` base `major.minor.patch` alignment and `0`/empty build digit on stable tags.
  - Enforced `-setup.exe` / `.msi` extension integrity and matching `windows-x86_64` fallback in `validateUpdaterManifest`.
  - Restricted `preflightCheck.ts` to strictly the single stable `latest.json` endpoint.
- **[src-tauri/src/commands/system.rs](file:///C:/Users/Pigeon/Documents/AlgoJava/src-tauri/src/commands/system.rs)** & **[src/lib/tauri/updaterClient.ts](file:///C:/Users/Pigeon/Documents/AlgoJava/src/lib/tauri/updaterClient.ts)**:
  - Hardened Rust `is_valid_updater_config_value` (valid base64 minisign public key, all endpoints HTTPS, `requireSignedVersion: true`, no dangerous TLS flags).
  - Reclassified TLS/certificate errors in `sanitizeUpdaterError` as `"signature"` security blocks.
- **Docs & Tests**:
  - Updated [RELEASE.md](file:///C:/Users/Pigeon/Documents/AlgoJava/RELEASE.md) and [docs/RELEASE_ARCHITECTURE.md](file:///C:/Users/Pigeon/Documents/AlgoJava/docs/RELEASE_ARCHITECTURE.md) with explicit preview channel behavior and Windows MSI upgrade note.
  - Expanded [scripts/release/releaseMetadata.test.ts](file:///C:/Users/Pigeon/Documents/AlgoJava/scripts/release/releaseMetadata.test.ts), [scripts/release/verifySignature.test.ts](file:///C:/Users/Pigeon/Documents/AlgoJava/scripts/release/verifySignature.test.ts), and [src/test/updater.test.ts](file:///C:/Users/Pigeon/Documents/AlgoJava/src/test/updater.test.ts).

---

## 4. Requires Manual Configuration

Verified via `git ls-remote https://github.com/cto-mindset/algojava-releases.git` (`repository not found`) and `%USERPROFILE%\.tauri` inspection (no keys present):

1. Create **Public** repository `cto-mindset/algojava-releases` on GitHub (empty of private source code).
2. Create GitHub App (`algojava-release-publisher`) with minimum permissions (**Contents: Read and write** only; all others **No access**) and install it **only** on `cto-mindset/algojava-releases`.
3. Generate production Ed25519 keypair offline (`bun run tauri signer generate -w "$env:USERPROFILE\.tauri\algojava-updater.key"`), back up the private key + passphrase securely offline, and set the `.pub` string in `plugins.updater.pubkey` inside [src-tauri/tauri.conf.json](file:///C:/Users/Pigeon/Documents/AlgoJava/src-tauri/tauri.conf.json).
4. Configure all 4 Actions secrets in private `cto-mindset/AlgoJava`:
   - `GH_APP_ID`
   - `GH_APP_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

---

## 5. Requires Real Windows Testing

Before declaring the pipeline production-ready, perform these live tests after Section 4 is complete:

1. **Initial CI tag release test**: Push a real annotated tag (e.g., `v1.0.0-alpha.1` or `v1.0.0`) on `cto-mindset/AlgoJava` and verify `verify-and-build` + `publish-release` publish only the 6 allowlisted files to `cto-mindset/algojava-releases` with valid HTTP 200 URLs and `--prerelease` / `--latest` flags.
2. **Real Windows install & upgrade test (`vOld -> vNew`)**:
   - Install the signed MSI build (`vN`) on clean Windows, create user progress/settings in AppData, then publish signed `vN+1` (`latest.json` stable release).
   - Verify automatic startup notification + manual `Settings → About AlgoJava → Check for Updates`.
   - Verify download progress, UAC/passive installer flow, automatic app relaunch into `vN+1`, and full preservation of SQLite progress (`algojava.db`) and `settings.json`.
   - Repeat with the signed NSIS `-setup.exe` build (`vN -> vN+1`).
3. **Live negative security checks**:
   - Confirm offline machine does not crash on startup check and shows clean Offline status in Settings.
   - Confirm a manifest entry with a tampered signature or mismatched `version:` trusted comment is rejected before installation.
