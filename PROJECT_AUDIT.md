# AlgoJava — Repository Audit Report

**Audit Date:** 2026-11-25  
**Target Platform:** Windows 10/11 (Tauri 2 + React 19 + TypeScript 6 + Rust 2024)

## 1. Executive Summary

The initial repository was a freshly scaffolded Tauri 2 + Vite + React + TypeScript template containing starter boilerplate (`greet` command in `src-tauri/src/lib.rs`, default logo form in `src/App.tsx`), partially installed frontend packages, unconfigured Tauri plugins, a startup configuration defect in `tauri-plugin-updater`, overly permissive or mismatched capabilities, and a TypeScript composite project reference error.

No JDK (`javac` / `java`) was present on `PATH` or standard Windows JDK directories on the audit workstation.

---

## 2. Detailed Findings & Resolutions

### 2.1 Configuration & Build Issues

| Area | Finding | Risk / Impact | Resolution Applied |
| --- | --- | --- | --- |
| `tsconfig.json` / `tsconfig.node.json` | `bun x tsc -b --noEmit` failed with `TS6310: Referenced project ... may not disable emit` because `tsconfig.node.json` lacked `"noEmit": false` or `emitDeclarationOnly` compatible settings under `composite: true`, and `src` lacked `@/*` path aliases. | Project-reference builds fail; non-portable relative imports across feature folders. | Configured `tsconfig.node.json` with `"emitDeclarationOnly": true` (keeping `"composite": true`), added `@/*` -> `./src/*` path mapping in `tsconfig.json` without deprecated TS 6 `baseUrl`, and enabled strict compiler checks. |
| `vite.config.ts` | Used `// @ts-expect-error` for `node:process` because `@types/node` was missing; Tailwind CSS 4 Vite plugin was not configured; no Vitest test environment existed. | Missing Tailwind CSS 4 utility compilation and no frontend unit test runner. | Added `@types/node`, `@tailwindcss/vite`, Vitest (`jsdom`), and `@` alias resolution. |
| `index.html` | Title was `"Tauri + React + Typescript"` and body had no dark initial background. | Brand mismatch and white flash on Windows WebView2 startup. | Updated `<title>` to `AlgoJava` and styled dark initial canvas `#0b0b14`. |
| `src-tauri/tauri.conf.json` | `plugins.updater` specified `{ "requireSignedVersion": true }` without required `pubkey: String` field (`tauri-plugin-updater@2.14.1`). | **Startup panic** when `tauri_plugin_updater` deserializes plugin config at launch. | Added `"pubkey": ""` and `"endpoints": []`, and preloaded `"sqlite:algojava.db"` under `plugins.sql`. |
| Window Configuration | Main window was 800x600 with native OS title bar (`decorations` omitted). | Does not match the frameless dark AlgoJava desktop shell in `loyiha-rasmlari/`. | Set 1320x840 (min 1024x680), centered, `"decorations": false`, and implemented a custom frameless `TitleBar`. |

### 2.2 Tauri Security, Plugins & Permissions

| Area | Finding | Risk / Impact | Resolution Applied |
| --- | --- | --- | --- |
| `tauri-plugin-shell` | Installed in both `package.json` and `Cargo.toml`, plus `"shell:default"` in capabilities. | Unnecessary shell IPC surface exposed to webview if expanded; external link opening is already provided by `tauri-plugin-opener`, and Java compilation/execution must run via dedicated Rust `std::process::Command` without shell interpolation. | Removed `@tauri-apps/plugin-shell` and `tauri-plugin-shell`; retained `tauri-plugin-opener` for URLs and revealing storage folders. |
| `tauri-plugin-deep-link` | Installed without any URL scheme configuration or handler. | Unused native plugin surface. | Removed `@tauri-apps/plugin-deep-link` and `tauri-plugin-deep-link`. |
| Duplicate Capabilities | Both `capabilities/default.json` and `capabilities/desktop.json` targeted `"main"` with overlapping plugin permissions. | Confusing capability surface; `desktop.json` lacked `store:default` while `default.json` lacked `updater:default` and `global-shortcut`. | Consolidated into `capabilities/default.json` using least-privilege granular permissions and removed `capabilities/desktop.json`. |
| `sql:allow-execute` | `capabilities/default.json` only had `"sql:default"`, which in `tauri-plugin-sql@2.6.0` grants only `load`, `select`, and `close` (not `execute`). | **All SQLite writes (`INSERT` / `UPDATE` / `DELETE`) would fail at runtime.** | Explicitly added `"sql:allow-execute"` to `capabilities/default.json`. |
| `core:window` permissions | Custom frameless titlebar requires `minimize`, `toggle_maximize`, `close`, and `start_dragging`, none of which are in `core:default`. | Window controls and drag region would fail at runtime. | Granted only `allow-minimize`, `allow-maximize`, `allow-unmaximize`, `allow-toggle-maximize`, `allow-close`, and `allow-start-dragging`. |
| Content Security Policy | `"csp": null` in `tauri.conf.json`. | Disables CSP protection inside the WebView. | Configured strict offline-first CSP allowing `'self'`, Tauri IPC/asset origins, and inline styles required by CodeMirror/Tailwind. |
| `tauri-plugin-sql` Migrations | `tauri_plugin_sql::Builder::new()` had no migrations attached. | No database schema or seed catalog existed. | Added versioned SQL migrations (`001_initial_schema.sql`, `002_seed_catalog.sql`) via `Builder::add_migrations`. |

### 2.3 Dependency Audit

#### Preserved Core Stack
- React 19 (`19.3.1` resolved), TypeScript `~6.0.3`, Vite `8.3.8`, React Router `8.5.2`, Zustand `5.1.0`, `@tabler/icons-react`, `date-fns`.
- CodeMirror 6 stack: `@uiw/react-codemirror`, `@codemirror/lang-java`, `@codemirror/lang-json`, `@codemirror/lang-xml`, `@codemirror/state`, `@codemirror/view`, `@codemirror/commands`, `@codemirror/autocomplete`, `@codemirror/search`, `@codemirror/lint`, `@uiw/codemirror-extensions-basic-setup`.
- Variable fonts: `@fontsource-variable/geist-mono`, `@fontsource-variable/google-sans-code`, `@fontsource-variable/jetbrains-mono`.
- Tauri 2 plugins: `store`, `sql` (`sqlite`), `dialog`, `opener`, `os`, `log`, `global-shortcut` (desktop), `updater` (desktop).

#### Added Frontend Dependencies (via Bun)
- `@fontsource-variable/inter`: Clean UI sans-serif font matching desktop visual references.
- `@codemirror/language` & `@lezer/highlight`: Direct dependencies (previously only transitive) needed for custom CodeMirror 6 themes, `indentUnit`, and `HighlightStyle`.
- DevDependencies: `tailwindcss`, `@tailwindcss/vite`, `@types/node`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.

#### Added Rust Direct Dependencies (Already Present in `Cargo.lock`)
- `thiserror = "2"`, `tempfile = "3"`, `chrono = { version = "0.4", features = ["serde"] }`, `uuid = { version = "1", features = ["v4"] }`, and Windows-only `winreg = "0.56"` for registry JDK discovery.
- Note: `sqlx` is used exclusively through `tauri-plugin-sql` (and `dev-dependencies` in Rust unit tests if needed? No — we keep runtime dependencies clean and test SQLite schema validity cleanly).

### 2.4 Architecture & Implementation Gaps Found Initially
- `src/` contained only `App.tsx`, `App.css`, `main.tsx`, and `vite-env.d.ts` (no design tokens, router, repositories, stores, or pages).
- `src-tauri/src/lib.rs` contained only `greet` with no Java runtime detection, Java compiler/runner service, storage diagnostics, or import/export helpers.
- `loyiha-rasmlari/` contains 5 authoritative design screenshots defining the dark navy + purple aesthetic, sidebar/titlebar shell, 6-card settings grid, progress dashboard, problem catalog, and split Java IDE workspace.
