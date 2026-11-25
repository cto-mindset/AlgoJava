import { java } from "@codemirror/lang-java";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import {
  HighlightStyle,
  bracketMatching,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { resolveEditorFontCss } from "@/lib/utils/format";
import type { EditorFontFamily, TabSizeOption } from "@/types/models";

export type EditorLanguageMode = "java" | "json" | "xml";

const darkHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#c084fc", fontWeight: "500" },
  { tag: tags.controlKeyword, color: "#c084fc", fontWeight: "600" },
  { tag: tags.modifier, color: "#c084fc" },
  { tag: [tags.typeName, tags.className], color: "#fbbf24" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#60a5fa" },
  { tag: [tags.definition(tags.variableName), tags.variableName], color: "#e2e8f0" },
  { tag: tags.propertyName, color: "#93c5fd" },
  { tag: tags.string, color: "#4ade80" },
  { tag: [tags.number, tags.bool, tags.null], color: "#f97316" },
  { tag: tags.comment, color: "#64748b", fontStyle: "italic" },
  { tag: tags.operator, color: "#94a3b8" },
  { tag: tags.punctuation, color: "#cbd5e1" },
]);

const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#7c3aed", fontWeight: "600" },
  { tag: tags.controlKeyword, color: "#7c3aed", fontWeight: "600" },
  { tag: tags.modifier, color: "#6d28d9" },
  { tag: [tags.typeName, tags.className], color: "#b45309" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#1d4ed8" },
  { tag: [tags.definition(tags.variableName), tags.variableName], color: "#0f172a" },
  { tag: tags.propertyName, color: "#0369a1" },
  { tag: tags.string, color: "#15803d" },
  { tag: [tags.number, tags.bool, tags.null], color: "#c2410c" },
  { tag: tags.comment, color: "#64748b", fontStyle: "italic" },
  { tag: tags.operator, color: "#475569" },
  { tag: tags.punctuation, color: "#334155" },
]);

export function createEditorThemeExtension(
  isDark: boolean,
  fontFamily: EditorFontFamily,
  fontSizePx: number,
  bracketPairColorization: boolean
): Extension {
  const fontCss = resolveEditorFontCss(fontFamily);

  const baseTheme = EditorView.theme(
    {
      "&": {
        backgroundColor: "var(--bg-editor)",
        color: isDark ? "#f1f5f9" : "#0f172a",
        fontSize: `${fontSizePx}px`,
        fontFamily: fontCss,
        height: "100%",
      },
      ".cm-scroller": {
        fontFamily: fontCss,
        lineHeight: "1.65",
        overflow: "auto",
      },
      ".cm-content": {
        caretColor: "var(--accent-light)",
        padding: "12px 0",
      },
      ".cm-gutters": {
        backgroundColor: "var(--bg-editor-gutter)",
        color: "var(--text-muted)",
        borderRight: "1px solid var(--border-subtle)",
        minWidth: "46px",
        paddingRight: "6px",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
        color: "var(--text-primary)",
        fontWeight: "600",
      },
      ".cm-activeLine": {
        backgroundColor: isDark
          ? "rgba(139, 92, 246, 0.08)"
          : "rgba(124, 58, 237, 0.06)",
      },
      ".cm-selectionBackground, ::selection": {
        backgroundColor: isDark
          ? "rgba(124, 58, 237, 0.30) !important"
          : "rgba(124, 58, 237, 0.18) !important",
      },
      ".cm-cursor": {
        borderLeftColor: "var(--accent-light)",
        borderLeftWidth: "2px",
      },
      ".cm-matchingBracket, .cm-nonmatchingBracket": bracketPairColorization
        ? {
            backgroundColor: isDark
              ? "rgba(167, 139, 250, 0.25)"
              : "rgba(124, 58, 237, 0.18)",
            outline: "1px solid var(--accent-border)",
            borderRadius: "3px",
          }
        : {},
    },
    { dark: isDark }
  );

  return [
    baseTheme,
    syntaxHighlighting(isDark ? darkHighlightStyle : lightHighlightStyle),
  ];
}

export function getLanguageExtension(mode: EditorLanguageMode): Extension {
  switch (mode) {
    case "json":
      return json();
    case "xml":
      return xml();
    case "java":
    default:
      return java();
  }
}

export interface EditorExtensionOptions {
  language: EditorLanguageMode;
  isDark: boolean;
  fontFamily: EditorFontFamily;
  fontSizePx: number;
  tabSize: TabSizeOption;
  bracketPairColorization: boolean;
  wordWrap: boolean;
  autoIndent: boolean;
  onRun?: () => void;
  onSubmit?: () => void;
  onSave?: () => void;
}

export function createAlgoJavaExtensions(
  opts: EditorExtensionOptions
): Extension[] {
  const extensions: Extension[] = [
    getLanguageExtension(opts.language),
    createEditorThemeExtension(
      opts.isDark,
      opts.fontFamily,
      opts.fontSizePx,
      opts.bracketPairColorization
    ),
    EditorState.tabSize.of(opts.tabSize),
    indentUnit.of(" ".repeat(opts.tabSize)),
  ];

  if (opts.bracketPairColorization) {
    extensions.push(bracketMatching());
  }

  if (opts.autoIndent) {
    extensions.push(indentOnInput());
  }

  if (opts.wordWrap) {
    extensions.push(EditorView.lineWrapping);
  }

  if (opts.onRun || opts.onSubmit || opts.onSave) {
    extensions.push(
      keymap.of([
        {
          key: "Mod-Enter",
          run: () => {
            opts.onRun?.();
            return Boolean(opts.onRun);
          },
        },
        {
          key: "Mod-Shift-Enter",
          run: () => {
            opts.onSubmit?.();
            return Boolean(opts.onSubmit);
          },
        },
        {
          key: "Mod-s",
          run: () => {
            opts.onSave?.();
            return Boolean(opts.onSave);
          },
        },
      ])
    );
  }

  return extensions;
}
