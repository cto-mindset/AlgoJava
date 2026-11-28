import React from "react";
import { openExternalUrl } from "@/lib/tauri/openerClient";
import { cn } from "@/lib/utils/cn";

export interface MarkdownContentProps {
  content: string;
  compact?: boolean;
  className?: string;
}

function isSafeHttpUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

const INLINE_TOKEN_RE =
  /`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function renderInlineMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let tokenIdx = 0;

  INLINE_TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = INLINE_TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const key = `${keyPrefix}-${tokenIdx++}`;
    if (match[1] !== undefined) {
      nodes.push(
        <code
          key={key}
          className="rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-1 py-0.5 font-mono text-[0.9em] text-[var(--text-primary)]"
        >
          {match[1]}
        </code>
      );
    } else if (match[2] !== undefined || match[3] !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold text-[var(--text-primary)]">
          {match[2] ?? match[3]}
        </strong>
      );
    } else if (match[4] !== undefined) {
      nodes.push(
        <em key={key} className="italic text-[var(--text-primary)]">
          {match[4]}
        </em>
      );
    } else if (match[5] !== undefined && match[6] !== undefined) {
      const label = match[5];
      const href = match[6].trim();
      if (isSafeHttpUrl(href)) {
        nodes.push(
          <a
            key={key}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              void openExternalUrl(href);
            }}
            className="font-medium text-[var(--accent-light)] underline underline-offset-2 hover:opacity-85 cursor-pointer"
          >
            {label}
          </a>
        );
      } else {
        nodes.push(`${label} (${href})`);
      }
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

type BlockNode =
  | { type: "heading"; level: number; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "quote"; lines: string[] }
  | { type: "hr" }
  | { type: "paragraph"; lines: string[] };

const HEADING_RE = /^(#{1,4})\s+(.+)$/;
const UL_ITEM_RE = /^\s*[-*+]\s+(.+)$/;
const OL_ITEM_RE = /^\s*\d+\.\s+(.+)$/;
const HR_RE = /^\s*(?:---+|___+|\*\*\*+)\s*$/;
const CODE_FENCE_RE = /^```([\w-]*)\s*$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;

function parseBlocks(markdown: string): BlockNode[] {
  const lines = markdown.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    const fenceMatch = CODE_FENCE_RE.exec(line.trim());
    if (fenceMatch) {
      const lang = fenceMatch[1] ?? "";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
      continue;
    }

    if (HR_RE.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    const headingMatch = HEADING_RE.exec(line.trim());
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    if (QUOTE_RE.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length) {
        const q = QUOTE_RE.exec(lines[i]);
        if (!q) break;
        quoteLines.push(q[1]);
        i++;
      }
      blocks.push({ type: "quote", lines: quoteLines });
      continue;
    }

    if (UL_ITEM_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const u = UL_ITEM_RE.exec(lines[i]);
        if (!u) break;
        items.push(u[1].trim());
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (OL_ITEM_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const o = OL_ITEM_RE.exec(lines[i]);
        if (!o) break;
        items.push(o[1].trim());
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !CODE_FENCE_RE.test(lines[i].trim()) &&
      !HR_RE.test(lines[i]) &&
      !HEADING_RE.test(lines[i].trim()) &&
      !QUOTE_RE.test(lines[i]) &&
      !UL_ITEM_RE.test(lines[i]) &&
      !OL_ITEM_RE.test(lines[i])
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", lines: paraLines });
    }
  }

  return blocks;
}

/**
 * Pure React Markdown viewer for release notes and rich help text.
 * Escapes all text via React nodes without `dangerouslySetInnerHTML`.
 */
export function MarkdownContent({
  content,
  compact = false,
  className,
}: MarkdownContentProps) {
  const blocks = parseBlocks(content);

  return (
    <div
      className={cn(
        "text-[var(--text-secondary)]",
        compact ? "space-y-1.5 text-xs leading-relaxed" : "space-y-2.5 text-[12.5px] leading-relaxed",
        className
      )}
    >
      {blocks.map((block, idx) => {
        const key = `md-${idx}`;
        switch (block.type) {
          case "heading": {
            const headingClasses = cn(
              "font-semibold text-[var(--text-primary)] tracking-tight",
              block.level === 1 && (compact ? "text-[13px]" : "text-sm"),
              block.level === 2 && (compact ? "text-xs" : "text-[13px]"),
              block.level >= 3 && "text-xs uppercase tracking-wide text-[var(--accent-light)]"
            );
            if (block.level === 1) {
              return (
                <h1 key={key} className={headingClasses}>
                  {renderInlineMarkdown(block.text, key)}
                </h1>
              );
            }
            if (block.level === 2) {
              return (
                <h2 key={key} className={headingClasses}>
                  {renderInlineMarkdown(block.text, key)}
                </h2>
              );
            }
            if (block.level === 3) {
              return (
                <h3 key={key} className={headingClasses}>
                  {renderInlineMarkdown(block.text, key)}
                </h3>
              );
            }
            return (
              <h4 key={key} className={headingClasses}>
                {renderInlineMarkdown(block.text, key)}
              </h4>
            );
          }
          case "ul":
            return (
              <ul key={key} className="list-disc space-y-1 pl-4 marker:text-[var(--accent-light)]">
                {block.items.map((item, itemIdx) => (
                  <li key={`${key}-li-${itemIdx}`}>
                    {renderInlineMarkdown(item, `${key}-li-${itemIdx}`)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="list-decimal space-y-1 pl-4 marker:text-[var(--accent-light)]">
                {block.items.map((item, itemIdx) => (
                  <li key={`${key}-li-${itemIdx}`}>
                    {renderInlineMarkdown(item, `${key}-li-${itemIdx}`)}
                  </li>
                ))}
              </ol>
            );
          case "code":
            return (
              <pre
                key={key}
                className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 font-mono text-[11px] text-[var(--text-primary)]"
              >
                <code>{block.code}</code>
              </pre>
            );
          case "quote":
            return (
              <blockquote
                key={key}
                className="border-l-2 border-[var(--accent-border)] pl-3 text-[var(--text-muted)] italic"
              >
                {block.lines.map((qLine, qIdx) => (
                  <p key={`${key}-q-${qIdx}`}>
                    {renderInlineMarkdown(qLine, `${key}-q-${qIdx}`)}
                  </p>
                ))}
              </blockquote>
            );
          case "hr":
            return (
              <hr key={key} className="border-0 border-t border-[var(--border-subtle)]" />
            );
          case "paragraph":
            return (
              <p key={key}>
                {renderInlineMarkdown(block.lines.join(" "), key)}
              </p>
            );
        }
      })}
    </div>
  );
}
