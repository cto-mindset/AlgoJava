# AlgoJava — Engineering Rules for AI Agents

Follow these permanent project rules when modifying this repository:

1. **Package Management (Bun Only)**:
   - Use `bun` (`bun install`, `bun add`, `bun remove`, `bun run ...`). Never run `npm` or generate `package-lock.json` / `yarn.lock`.
2. **Code Editor (CodeMirror 6 Only)**:
   - Keep CodeMirror 6 (`@uiw/react-codemirror`, `@codemirror/lang-java`, `@codemirror/lang-json`, `@codemirror/lang-xml`) as the code editor. Never replace it with Monaco Editor.
3. **Architecture Boundaries**:
   - Keep raw SQL queries strictly inside `src/lib/db/*Repository.ts` using parameterized `$1, $2...` placeholders. Never embed SQL in React components.
   - Keep Java compilation, process management, and filesystem operations inside `src-tauri/src/services/*` invoked by thin async handlers in `src-tauri/src/commands/*`.
   - Use Zustand (`src/stores/*`) for client/UI state and `@tauri-apps/plugin-store` (`settings.json`) for preferences; derive progress and statistics from SQLite submission data rather than duplicating counters.
4. **Security & Native Process Rules**:
   - Never re-introduce `tauri-plugin-shell` or construct shell command strings from user input. Always pass executable paths and arguments separately via `std::process::Command`.
   - Under `#[cfg(windows)]`, set `.creation_flags(0x0800_0000)` (`CREATE_NO_WINDOW`) on background `Command` invocations (`javac`, `java`, `taskkill`) to prevent console windows from flashing.
   - Never fabricate Java execution outputs, update availability, or dashboard statistics. Never describe JVM `-Xmx` or process timeouts as a full OS sandbox.
5. **UI & Design System Consistency**:
   - Use centralized CSS custom properties (`src/styles/tokens.css`, `src/styles/themes.css`) and reusable components in `src/components/ui/`.
   - Use `@tabler/icons-react` exclusively for icons.
   - Preserve Tailwind CSS v4 `@layer base` boundaries in `src/styles/globals.css`.
   - Destructive operations (`Reset Progress`, `Clear Cache`, code reset when configured) must require explicit user confirmation; `Clear Cache` must never touch SQLite user progress.
6. **Strict Tooling & Quality Gates**:
   - Maintain strict TypeScript (avoid `any`, avoid deprecated TS 6 `baseUrl`).
   - Run `bun run typecheck`, `bun run test`, `bun run build`, and `cargo test --manifest-path src-tauri/Cargo.toml` before completing changes.
