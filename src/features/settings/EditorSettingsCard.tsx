import { IconCode, IconInfoCircle } from "@tabler/icons-react";
import { SegmentedControl, Select, Switch, Tooltip } from "@/components/ui";
import { resolveEditorFontCss } from "@/lib/utils/format";
import { useSettingsStore } from "@/stores/settingsStore";
import type { EditorFontFamily, TabSizeOption } from "@/types/models";

export function EditorSettingsCard() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <section className="algo-surface p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent-light)]">
          <IconCode size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Editor
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Configure your CodeMirror 6 Java editor preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-start">
        {/* Mini code preview */}
        <div className="sm:col-span-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-editor)] p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
            <span>Solution.java</span>
            <span>{settings.editorFontSize}px</span>
          </div>
          <pre
            className="overflow-hidden text-[11px] leading-relaxed text-[var(--text-secondary)]"
            style={{ fontFamily: resolveEditorFontCss(settings.editorFontFamily) }}
          >
            <span className="text-purple-400">class</span>{" "}
            <span className="text-amber-300">Solution</span> {"{\n"}
            {"  "}
            <span className="text-purple-400">int</span>{" "}
            <span className="text-sky-400">sum</span>(a, b) {"{\n"}
            {"    "}
            <span className="text-purple-400">return</span> a + b;{"\n"}
            {"  }\n}"}
          </pre>
        </div>

        {/* Settings grid */}
        <div className="sm:col-span-8 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[var(--text-primary)]">
              Font Family
            </span>
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
              className="w-44"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[var(--text-primary)]">
              Editor Font &amp; Tab Size
            </span>
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
                className="w-20"
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
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-2.5 sm:grid-cols-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-primary)]">
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

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-primary)]">
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

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-primary)]">Word Wrap</span>
              <Switch
                ariaLabel="Word Wrap"
                checked={settings.wordWrap}
                onCheckedChange={(wordWrap) => void updateSettings({ wordWrap })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[var(--text-primary)]">
                <span>Code Overview</span>
                <Tooltip content="Lightweight clickable CodeMirror 6 line-density strip (CodeMirror has no native VS Code minimap)">
                  <IconInfoCircle
                    size={13}
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

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-primary)]">Auto Indent</span>
              <Switch
                ariaLabel="Auto Indent"
                checked={settings.autoIndent}
                onCheckedChange={(autoIndent) =>
                  void updateSettings({ autoIndent })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-primary)]">Auto Save</span>
              <Switch
                ariaLabel="Auto Save"
                checked={settings.autoSave}
                onCheckedChange={(autoSave) => void updateSettings({ autoSave })}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
