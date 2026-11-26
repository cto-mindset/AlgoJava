import { IconCode, IconInfoCircle } from "@tabler/icons-react";
import {
  SegmentedControl,
  Select,
  SettingCard,
  SettingRow,
  Switch,
  Tooltip,
} from "@/components/ui";
import { resolveEditorFontCss } from "@/lib/utils/format";
import { useSettingsStore } from "@/stores/settingsStore";
import type { EditorFontFamily, TabSizeOption } from "@/types/models";

export function EditorSettingsCard() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <SettingCard
      id="settings-editor"
      icon={<IconCode size={18} />}
      title="Editor"
      description="Configure CodeMirror 6 Java font, indentation, and editing helpers."
    >
      {/* Full-width compact Java code preview */}
      <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-editor)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-3.5 py-1.5 text-[11px] text-[var(--text-muted)]">
          <span className="font-mono font-medium text-[var(--text-secondary)]">
            Solution.java
          </span>
          <span className="algo-tabular">
            {settings.editorFontSize}px · {settings.tabSize} spaces
          </span>
        </div>
        <pre
          className="overflow-x-auto px-3.5 py-2.5 text-xs leading-relaxed"
          style={{ fontFamily: resolveEditorFontCss(settings.editorFontFamily) }}
        >
          {settings.lineNumbers && (
            <span className="select-none pr-3 text-[var(--text-muted)]">1</span>
          )}
          <span style={{ color: "var(--code-keyword)" }}>class</span>{" "}
          <span style={{ color: "var(--code-type)" }}>Solution</span>{" "}
          <span style={{ color: "var(--code-text)" }}>{"{\n"}</span>
          {settings.lineNumbers && (
            <span className="select-none pr-3 text-[var(--text-muted)]">2</span>
          )}
          <span style={{ color: "var(--code-text)" }}>{"  "}</span>
          <span style={{ color: "var(--code-keyword)" }}>int</span>{" "}
          <span style={{ color: "var(--code-fn)" }}>sum</span>
          <span style={{ color: "var(--code-text)" }}>(</span>
          <span style={{ color: "var(--code-keyword)" }}>int</span>{" "}
          <span style={{ color: "var(--code-text)" }}>a, </span>
          <span style={{ color: "var(--code-keyword)" }}>int</span>{" "}
          <span style={{ color: "var(--code-text)" }}>b) {"{\n"}</span>
          {settings.lineNumbers && (
            <span className="select-none pr-3 text-[var(--text-muted)]">3</span>
          )}
          <span style={{ color: "var(--code-text)" }}>{"    "}</span>
          <span style={{ color: "var(--code-keyword)" }}>return</span>{" "}
          <span style={{ color: "var(--code-text)" }}>a + b;{"\n"}</span>
          {settings.lineNumbers && (
            <span className="select-none pr-3 text-[var(--text-muted)]">4</span>
          )}
          <span style={{ color: "var(--code-text)" }}>{"  }\n}"}</span>
        </pre>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        <SettingRow label="Font Family" className="pb-3.5">
          <Select<EditorFontFamily>
            ariaLabel="Editor Font Family"
            value={settings.editorFontFamily}
            onChange={(editorFontFamily) =>
              void updateSettings({ editorFontFamily })
            }
            options={[
              { value: "jetbrains-mono", label: "JetBrains Mono" },
              { value: "geist-mono", label: "Geist Mono" },
              { value: "google-sans-code", label: "Google Sans Code" },
            ]}
            className="w-48"
          />
        </SettingRow>

        <SettingRow label="Font Size & Tab Width" className="py-3.5">
          <div className="flex items-center gap-2">
            <Select<number>
              ariaLabel="Editor Font Size"
              value={settings.editorFontSize}
              onChange={(editorFontSize) =>
                void updateSettings({ editorFontSize })
              }
              options={[12, 13, 14, 15, 16, 18].map((px) => ({
                value: px,
                label: `${px}px`,
              }))}
              className="w-22"
            />
            <SegmentedControl<TabSizeOption>
              value={settings.tabSize}
              onChange={(tabSize) => void updateSettings({ tabSize })}
              options={[
                { value: 2, label: "2" },
                { value: 4, label: "4" },
                { value: 8, label: "8" },
              ]}
            />
          </div>
        </SettingRow>
      </div>

      {/* Editor Boolean Toggles */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 border-t border-[var(--border-subtle)] pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] text-[var(--text-primary)]">
            Show Line Numbers
          </span>
          <Switch
            ariaLabel="Show Line Numbers"
            checked={settings.lineNumbers}
            onCheckedChange={(lineNumbers) =>
              void updateSettings({ lineNumbers })
            }
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] text-[var(--text-primary)]">
            Bracket Pair Colorization
          </span>
          <Switch
            ariaLabel="Bracket Pair Colorization"
            checked={settings.bracketPairColorization}
            onCheckedChange={(bracketPairColorization) =>
              void updateSettings({ bracketPairColorization })
            }
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] text-[var(--text-primary)]">
            Word Wrap
          </span>
          <Switch
            ariaLabel="Word Wrap"
            checked={settings.wordWrap}
            onCheckedChange={(wordWrap) => void updateSettings({ wordWrap })}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[13.5px] text-[var(--text-primary)]">
            <span>Code Overview</span>
            <Tooltip content="Lightweight clickable CodeMirror 6 line-density strip">
              <IconInfoCircle
                size={14}
                className="text-[var(--text-muted)]"
              />
            </Tooltip>
          </span>
          <Switch
            ariaLabel="Code Overview"
            checked={settings.minimap}
            onCheckedChange={(minimap) => void updateSettings({ minimap })}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] text-[var(--text-primary)]">
            Auto Indent
          </span>
          <Switch
            ariaLabel="Auto Indent"
            checked={settings.autoIndent}
            onCheckedChange={(autoIndent) =>
              void updateSettings({ autoIndent })
            }
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] text-[var(--text-primary)]">
            Auto Save
          </span>
          <Switch
            ariaLabel="Auto Save"
            checked={settings.autoSave}
            onCheckedChange={(autoSave) => void updateSettings({ autoSave })}
          />
        </div>
      </div>
    </SettingCard>
  );
}
