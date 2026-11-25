# AlgoJava

**AlgoJava** is an offline-first Java coding practice desktop application built for Windows 10/11 using **Tauri 2**, **React 19**, **TypeScript 6**, **CodeMirror 6**, **Tailwind CSS 4**, **SQLite**, and **Rust**.

## Features

- **Offline-First Desktop Experience**: Custom frameless title bar, collapsible navigation sidebar, Dark/Light/System themes, and 5 configurable accent colors.
- **47 Curated Java Problems Across 9 Categories**: Warmup, String, Array, Logic, AP-1 / AP-2, Recursion, Sorting, Searching, and Advanced — backed by 194 sample and hidden test cases in SQLite.
- **CodeMirror 6 Java Workspace**: Java syntax highlighting, configurable fonts (`JetBrains Mono`, `Geist Mono`, `Google Sans Code`), tab size, line numbers, bracket matching, word wrap, auto-indent, clickable code overview strip, auto-saved drafts, hints, reference solutions, and keyboard shortcuts (`Ctrl+Enter` Run, `Ctrl+Shift+Enter` Submit, `Ctrl+S` Save).
- **Local JDK Compilation & Execution**: Detects installed JDKs (`JAVA_HOME`, `PATH`, Windows Registry, standard JDK paths, or user-selected JDK folder), runs `javac` & `java` directly without shell interpolation, parses compiler diagnostics, enforces timeouts and output caps, and cleans up temporary build directories.
- **Real Progress & Analytics**: Tracks solved counts, attempt history, success rate, streaks, category progress bars, 14-day activity chart, and milestone achievements derived directly from SQLite submissions.
- **Data Management**: Inspect SQLite table counts and size, export/import `.json` progress backups, reset progress with confirmation, and clear temporary compilation caches safely without affecting user progress.

---

## Prerequisites

1. **Bun** (`>= 1.x`) — used exclusively for JavaScript/TypeScript package management (`bun.lock`).
2. **Rust Toolchain** (`rustc` + `cargo`, 2024 edition) and **Microsoft Edge WebView2** (pre-installed on Windows 10/11) + **Visual Studio C++ Build Tools** (for Windows native compilation).
3. **Java Development Kit (JDK 17 or 21+)** — required at runtime to compile and execute Java solutions (`javac` + `java`). You can install Eclipse Temurin / Oracle / Microsoft OpenJDK or select a portable JDK folder inside **Settings → Java Runtime**.

---

## Running in Development

Install dependencies with Bun and launch the Tauri desktop app:

```powershell
bun install
bun run tauri dev
```

Frontend-only TypeScript/Vite checks:

```powershell
bun run typecheck
bun run build
```

---

## Running Automated Tests

### Frontend (Vitest + React Testing Library)
```powershell
bun run test
```

### Rust Backend (Cargo)
```powershell
cargo test --manifest-path src-tauri/Cargo.toml
```

---

## Building the Windows Installer

Compile the production frontend and bundle the Windows `.msi` and NSIS `.exe` installers via Tauri CLI:

```powershell
bun run tauri build
```

Generated installers will be placed under:
- `src-tauri/target/release/bundle/msi/`
- `src-tauri/target/release/bundle/nsis/`

---

## Security & Known Limitations

- **No WebView Shell Exposure**: `tauri-plugin-shell` is removed; external URLs and directories open via `tauri-plugin-opener` and Java processes launch from Rust via `std::process::Command` with separate arguments.
- **Least-Privilege Capabilities**: `src-tauri/capabilities/default.json` enables only required commands (`sql:allow-execute`, window controls, dialog open/save, store, opener, os, log, updater, global-shortcut).
- **Not a Full OS Sandbox**: Timeout, process-tree termination, output limits, and JVM `-Xmx` heap bounds protect against accidental infinite loops or excessive heap allocation, but do not isolate local file or network access from user-written Java code running under your Windows account.
- **Updater Endpoints**: Remote update endpoints and signing public keys are intentionally left unconfigured (`endpoints: []`, `pubkey: ""`) in this offline build.

---

## Documentation

- [PROJECT_AUDIT.md](PROJECT_AUDIT.md) — Initial repository audit findings and dependency/security fixes.
- [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) — System architecture, SQLite schema, and execution flow.
- [AGENTS.md](AGENTS.md) — Permanent engineering conventions for AI contributors.
