import { useMemo, useRef } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  createAlgoJavaExtensions,
  type EditorLanguageMode,
} from "./editorConfig";

export interface JavaCodeEditorProps {
  value: string;
  onChange?: (next: string) => void;
  language?: EditorLanguageMode;
  readOnly?: boolean;
  height?: string;
  onRunShortcut?: () => void;
  onSubmitShortcut?: () => void;
  onSaveShortcut?: () => void;
}

export function JavaCodeEditor({
  value,
  onChange,
  language = "java",
  readOnly = false,
  height = "100%",
  onRunShortcut,
  onSubmitShortcut,
  onSaveShortcut,
}: JavaCodeEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);
  const settings = useSettingsStore((s) => s.settings);

  const isDark =
    settings.theme === "light"
      ? false
      : settings.theme === "dark"
      ? true
      : typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-color-scheme: light)").matches
      ? false
      : true;

  const extensions = useMemo(
    () =>
      createAlgoJavaExtensions({
        language,
        isDark,
        fontFamily: settings.editorFontFamily,
        fontSizePx: settings.editorFontSize,
        tabSize: settings.tabSize,
        bracketPairColorization: settings.bracketPairColorization,
        wordWrap: settings.wordWrap,
        autoIndent: settings.autoIndent,
        onRun: readOnly ? undefined : onRunShortcut,
        onSubmit: readOnly ? undefined : onSubmitShortcut,
        onSave: readOnly ? undefined : onSaveShortcut,
      }),
    [
      language,
      isDark,
      settings.editorFontFamily,
      settings.editorFontSize,
      settings.tabSize,
      settings.bracketPairColorization,
      settings.wordWrap,
      settings.autoIndent,
      readOnly,
      onRunShortcut,
      onSubmitShortcut,
      onSaveShortcut,
    ]
  );

  const lines = useMemo(() => value.split("\n"), [value]);

  const handleJumpToLine = (lineIndex: number) => {
    const view = editorRef.current?.view;
    if (!view) return;
    const lineNum = Math.min(Math.max(1, lineIndex + 1), view.state.doc.lines);
    const line = view.state.doc.line(lineNum);
    view.dispatch({
      selection: { anchor: line.from },
      scrollIntoView: true,
    });
    view.focus();
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[var(--bg-editor)]">
      <div className="min-w-0 flex-1 h-full overflow-hidden">
        <CodeMirror
          ref={editorRef}
          value={value}
          height={height}
          theme="none"
          readOnly={readOnly}
          editable={!readOnly}
          extensions={extensions}
          basicSetup={{
            lineNumbers: settings.lineNumbers,
            highlightActiveLineGutter: true,
            foldGutter: true,
            bracketMatching: settings.bracketPairColorization,
            closeBrackets: true,
            autocompletion: !readOnly,
            indentOnInput: settings.autoIndent,
            highlightActiveLine: !readOnly,
            highlightSelectionMatches: true,
            tabSize: settings.tabSize,
          }}
          onChange={(val) => onChange?.(val)}
          className="h-full"
        />
      </div>

      {/* Lightweight Code Overview Strip (CodeMirror 6 alternative to VS Code Minimap) */}
      {settings.minimap && language === "java" && (
        <aside
          aria-label="Code Overview"
          title="Code Overview (clickable line density strip)"
          className="hidden sm:flex w-12 shrink-0 flex-col gap-[2px] border-l border-[var(--border-subtle)] bg-[var(--bg-editor-gutter)] px-1.5 py-2 overflow-y-auto"
        >
          {lines.slice(0, 120).map((lineText, idx) => {
            const widthPct = Math.min(
              100,
              Math.max(10, Math.round((lineText.trim().length / 50) * 100))
            );
            const hasContent = lineText.trim().length > 0;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleJumpToLine(idx)}
                title={`Jump to line ${idx + 1}`}
                className="flex h-1 w-full items-center cursor-pointer hover:opacity-100 opacity-75"
              >
                {hasContent && (
                  <span
                    className="block h-[2px] rounded-full bg-[var(--accent-light)]/55"
                    style={{ width: `${widthPct}%` }}
                  />
                )}
              </button>
            );
          })}
        </aside>
      )}
    </div>
  );
}

export default JavaCodeEditor;
