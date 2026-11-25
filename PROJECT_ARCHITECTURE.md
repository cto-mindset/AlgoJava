# AlgoJava — Software Architecture

## 1. Architectural Overview

AlgoJava is an offline-first, single-user Java coding practice desktop application built with **Tauri 2**, **React 19**, **TypeScript 6**, **Tailwind CSS 4**, **CodeMirror 6**, and **Rust (2024 edition)**.

The application follows a strict separation between presentation, client preferences, SQLite persistence, and native Java compilation/execution:

```
+-------------------------------------------------------------------+
| React 19 UI (src/features/*, src/components/ui/*)                 |
|  - Pages never execute raw SQL or spawn child processes directly. |
+------------------------+-------------------------+----------------+
                         |                         |
                         v                         v
+------------------------+--------+   +------------+----------------+
| Repositories & Stores           |   | Typed Tauri IPC Bridge      |
|  - src/lib/db/*Repository.ts    |   |  - src/lib/tauri/*Client.ts |
|  - src/stores/*Store.ts         |   +------------+----------------+
+------------------------+--------+                |
                         |                         v
          +--------------+--------------+  +-------+------------------------+
          | Tauri Store + Tauri SQL     |  | Rust Services & Commands       |
          |  - settings.json            |  |  - jdk_detector.rs             |
          |  - sqlite:algojava.db       |  |  - harness_generator.rs        |
          +-----------------------------+  |  - java_executor.rs            |
                                           |  - storage_service.rs          |
                                           +--------------------------------+
```

---

## 2. Directory Structure

### Frontend (`src/`)
- `src/app/`: Application root (`App.tsx`), `AppProviders.tsx`, `ThemeProvider.tsx`, and declarative React Router 8 routing (`AppRouter.tsx` with `HashRouter`).
- `src/components/ui/`: Reusable design-system primitives (`Button`, `IconButton`, `Input`, `Select`, `Switch`, `Checkbox`, `Badge`, `ProgressBar`, `CircularProgress`, `SegmentedControl`, `Dialog`, `ConfirmDialog`, `Dropdown`, `Tooltip`, `SectionHeader`, `PageHeader`, `EmptyState`, `LoadingState`, `ErrorState`, `ToastViewport`).
- `src/components/layout/`: Frameless custom `TitleBar`, collapsible `Sidebar`, and `AppShell`.
- `src/components/shared/`: `CategoryIcon`, `DifficultyBadge`, and bespoke SVG vector illustrations (`JavaCupEmblem`, `DashboardHeroArtwork`, `ProgressHeroArtwork`).
- `src/features/`: Feature-sliced pages and feature-specific components:
  - `dashboard/` (`DashboardPage`)
  - `problems/` (`ProblemsPage`)
  - `editor/` (`ProblemSolverPage`, lazy-loaded `JavaCodeEditor`, `editorConfig`, `TestResultsPanel`)
  - `progress/` (`ProgressPage`)
  - `settings/` (`SettingsPage`, `AppearanceCard`, `EditorSettingsCard`, `JavaRuntimeCard`, `PracticePreferencesCard`, `DataStorageCard`, `AboutSummaryCard`)
  - `about/` (`AboutPage`)
- `src/lib/db/`: Parameterized SQLite repositories (`client.ts`, `categoryRepository.ts`, `problemRepository.ts`, `progressRepository.ts`, `submissionRepository.ts`).
- `src/lib/tauri/`: Typed wrappers around Tauri commands and official plugins (`env.ts`, `javaClient.ts`, `storageClient.ts`, `dialogClient.ts`, `openerClient.ts`, `windowClient.ts`, `updaterClient.ts`).
- `src/lib/utils/`: Formatting, streak calculation, and achievement evaluation utilities.
- `src/lib/validation/`: Strict JSON schema validation for progress export/import bundles.
- `src/stores/`: Zustand 5 stores (`settingsStore.ts` persisted via `@tauri-apps/plugin-store`, `javaRuntimeStore.ts`, `toastStore.ts`).
- `src/styles/`: Design tokens (`tokens.css`), Dark/Light + 5 Accent palettes (`themes.css`), and Tailwind CSS 4 entry (`globals.css`).
- `src/types/`: Strict TypeScript models (`models.ts`).

### Backend (`src-tauri/`)
- `src-tauri/migrations/`: Versioned SQLite migrations (`001_initial_schema.sql`, `002_seed_catalog.sql`).
- `src-tauri/capabilities/default.json`: Least-privilege Tauri v2 capability file.
- `src-tauri/src/errors/`: Typed `AppError` enum serialized safely across IPC.
- `src-tauri/src/models/`: Serde DTOs (`java.rs`, `storage.rs`) matching frontend TypeScript types.
- `src-tauri/src/database/`: `tauri-plugin-sql` migration loader (`migrations.rs`).
- `src-tauri/src/services/`:
  - `jdk_detector.rs`: Cross-platform & Windows-Registry JDK detection and validation (`javac` + `java`).
  - `harness_generator.rs`: `Solution.java` package sanitization (preserving line numbers) and nonce-isolated `AlgoJavaRunner.java` test harness generation + Base64 output parser.
  - `java_executor.rs`: Subprocess `javac`/`java` compilation & execution, bounded stream capture (64 KB per stream), timeout process-tree termination (`taskkill /F /T /PID` on Windows), and automatic temp directory cleanup.
  - `storage_service.rs`: Database/cache sizing, cache-only purge (`app_cache_dir/java_runs`), and `.json` progress import/export file I/O.
- `src-tauri/src/commands/`: Thin async Tauri command wrappers offloading blocking work onto `tauri::async_runtime::spawn_blocking`.

---

## 3. SQLite Database Schema & Persistence Design

SQLite is accessed through `tauri-plugin-sql` (`sqlite:algojava.db` stored under Tauri's `app_config_dir`) with `PRAGMA foreign_keys = ON`.

### Entities
1. **`categories`**: 9 coding categories (`6` featured on Dashboard: Warmup, String, Array, Logic, AP-1/AP-2, Recursion; `3` catalog categories: Sorting, Searching, Advanced).
2. **`problems`**: 47 seeded Java challenges with method signatures, typed parameter metadata, starter code, reference solutions, examples, constraints, and hints.
3. **`test_cases`**: 194 sample (`is_hidden = 0`) and hidden (`is_hidden = 1`) evaluation cases linked via `ON DELETE CASCADE`.
4. **`submissions`**: Full attempt audit log (`status`, `passed_count`, `total_count`, `execution_time_ms`, `compiler_output`, `stdout`, `stderr`, `submitted_at`).
5. **`execution_results`**: Per-test-case pass/fail outcomes linked to `submissions` and `test_cases`.
6. **`user_progress`**: One row per practiced problem storing `status` (`not_started` / `attempted` / `solved`), `bookmarked`, `draft_code`, `notes`, `attempts_count`, `solved_count`, `best_runtime_ms`, and timestamps.

### Persistence Boundaries
- **Tauri SQL (`sqlite:algojava.db`)**: Problem catalog, test cases, drafts, notes, bookmarks, submissions, execution results, and derived progress/streak/achievement metrics.
- **Tauri Store (`settings.json`)**: UI theme, accent color, font scale, CodeMirror 6 editor settings, custom JDK path, execution timeout/heap limits, and practice preferences.

---

## 4. Java Execution Pipeline & Security Model

### Execution Flow
1. Validate user code (`<= 128 KB`, contains `class Solution`, valid method identifier) and strip any `package ...;` header while keeping exact line numbers for `javac` diagnostics.
2. Create an isolated temporary directory under `app_cache_dir()/java_runs/exec_*` via `tempfile::Builder`.
3. Write `Solution.java` and a generated `AlgoJavaRunner.java` containing a fresh per-run UUID v4 nonce and `System.out` redirection around user method invocation.
4. Compile `Solution.java` via `Command::new(javac_path)` with separate arguments (`CREATE_NO_WINDOW` on Windows). If compilation fails, return line-mapped `CompilerDiagnostic` errors.
5. Compile `AlgoJavaRunner.java` against `Solution.class`. If compilation fails, report signature mismatch clearly.
6. Run `Command::new(java_path)` with `["-Xmx{N}m", "-XX:TieredStopAtLevel=1", "-Dfile.encoding=UTF-8", "-cp", ".", "AlgoJavaRunner"]`.
7. Capture `stdout`/`stderr` in bounded background threads (64 KB cap) while polling `try_wait()` up to the configured timeout (clamped `1..=120` seconds). On timeout, terminate the process tree (`taskkill /F /T /PID` on Windows) and drop the temp directory.

### Key Architectural Trade-Offs & Limitations
- **Why direct `std::process::Command` instead of `tauri-plugin-shell`?** Removing `tauri-plugin-shell` eliminates arbitrary command execution capability from the WebView IPC surface and prevents command-string injection.
- **Why JVM `-Xmx` is NOT a full OS memory sandbox:** `-Xmx` bounds only Java object heap allocation. Native JVM overhead (metaspace, thread stacks, code cache) sits outside `-Xmx`.
- **OS Isolation Limitation (Explicitly Documented):** Running user-written Java locally under the logged-in user's OS account is **not** a complete OS security sandbox (e.g., Windows Job Objects / AppContainer / seccomp are not enforced). Users should only execute Java code they authored or trust.
- **CodeMirror 6 Overview vs VS Code Minimap:** CodeMirror 6 does not ship a VS Code-style canvas minimap. AlgoJava provides an optional clickable line-density overview strip inside `JavaCodeEditor.tsx` instead of pulling unmaintained third-party minimap wrappers.
