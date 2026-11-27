# Changelog

All notable changes to **AlgoJava** are documented in this file.

## [1.0.1] - 2026-11-27

### Improvements
- **Markdown Release Notes Viewer**: Added a pure React `MarkdownContent` viewer that formats headings, bullet/ordered lists, inline code, fenced code blocks, blockquotes, horizontal rules, and safe HTTPS links inside both the update notification dialog and **Settings → About AlgoJava**.
- **Security**: Neutralizes unsafe link schemes and raw HTML tags when rendering update release notes.

## [1.0.0] - 2026-11-27

First stable release of **AlgoJava** — a 100% free, offline-first Java algorithm practice desktop studio built with Tauri 2, React, TypeScript, CodeMirror 6, SQLite, and a native Rust backend.

### Highlights
- **Native Rust Core & Local JDK Execution**: Compiles and executes solutions directly with your locally installed `javac` and `java` binaries in isolated temporary directories with configurable timeouts, process-tree termination, bounded stdout/stderr output, and `-Xmx` JVM heap limits.
- **Structured Problem Catalog**: Built-in practice tracks covering Warmup, String, Array, Logic, AP-1/AP-2, Recursion, Sorting, Searching, and Advanced problems with sample & hidden test cases, hints, personal notes, and step-by-step solution explanations.
- **CodeMirror 6 Java Workspace**: Syntax highlighting, bracket pair colorization, auto-indent, line numbers, interactive code overview strip, local draft auto-save, and keyboard shortcuts (`Ctrl+Enter`, `Ctrl+Shift+Enter`, `Ctrl+S`, `Ctrl+F`).
- **Progress Analytics & Local Portability**: Local SQLite persistence (`algojava.db`) tracking solve counts, streaks, achievements, pass rates, and submission history, plus full JSON export/import backup in Settings.
- **Desktop Branding, Fonts & Splash Screen**: Official AlgoJava application and Windows installer icons, native startup splash screen with real boot-stage telemetry, collapsible Sidebar, Light/Dark/System themes, customizable accent palettes, and bundled Outfit / Jost / Inter / JetBrains Mono / Geist Mono / Google Sans Code fonts.
- **Ed25519 Signed Auto-Updates**: Non-blocking startup update checks and manual checks in **Settings → About AlgoJava** backed by `cto-mindset/algojava-releases` (`latest.json`), explicit user confirmation before download, live transfer progress, passive Windows installation + relaunch, and strict Ed25519 + signed-version verification.
- **Production Desktop Hardening & Cross-OS Consistency**: Disabled browser context menu, DevTools, reload, print, and accidental drag-navigation shortcuts in production builds while preserving editor shortcuts; enforced deterministic LF SQLite migration checksums via `.gitattributes`.

### Windows Installers
- **NSIS (`AlgoJava_1.0.0_x64-setup.exe`)** — Recommended per-user Windows installer for seamless updates without elevation prompts.
- **MSI (`AlgoJava_1.0.0_x64_en-US.msi`)** — Per-machine Windows Installer package (`ProductVersion: 1.0.0`).

---

## [1.0.0-alpha.1] - 2026-11-27

Initial signed preview release establishing the GitHub cross-repository release pipeline (`cto-mindset/AlgoJava` → `cto-mindset/algojava-releases`), Tauri Ed25519 signing, and Windows MSI/NSIS packaging.
