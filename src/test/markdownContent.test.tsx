import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MarkdownContent } from "@/components/shared/MarkdownContent";
import { UpdateNotificationDialog } from "@/components/shared/UpdateNotificationDialog";
import { useUpdaterStore } from "@/stores/updaterStore";

const mockOpenExternalUrl = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/tauri/openerClient", () => ({
  openExternalUrl: (...args: unknown[]) => mockOpenExternalUrl(...args),
  openLocalDirectory: vi.fn(),
}));

describe("MarkdownContent release notes viewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders headings, lists, inline formatting, code blocks, quotes, and horizontal rules", () => {
    const md = [
      "## AlgoJava v1.0.0",
      "",
      "### Highlights",
      "- **Signed updates** with `Ed25519` verification",
      "- *Fast* local execution",
      "",
      "1. First step",
      "2. Second step",
      "",
      "> Important release note",
      "",
      "---",
      "",
      "```bash",
      "bun run tauri build",
      "```",
    ].join("\n");

    const { container } = render(<MarkdownContent content={md} />);

    expect(screen.getByRole("heading", { level: 2, name: "AlgoJava v1.0.0" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Highlights" })).toBeInTheDocument();
    expect(screen.getByText("Signed updates").tagName).toBe("STRONG");
    expect(screen.getByText("Fast").tagName).toBe("EM");
    expect(screen.getByText("Ed25519").tagName).toBe("CODE");
    expect(container.querySelector("ul")).not.toBeNull();
    expect(container.querySelector("ol")).not.toBeNull();
    expect(container.querySelector("blockquote")).not.toBeNull();
    expect(container.querySelector("hr")).not.toBeNull();
    expect(container.querySelector("pre code")?.textContent).toBe("bun run tauri build");
  });

  it("opens safe https links safely and neutralizes unsafe links or raw HTML", () => {
    const md = [
      "See [release page](https://github.com/cto-mindset/algojava-releases) and [bad](javascript:alert(1)).",
      "",
      "<script>window.__xss = true</script>",
    ].join("\n");

    const { container } = render(<MarkdownContent content={md} />);

    const safeLink = screen.getByRole("link", { name: "release page" });
    fireEvent.click(safeLink);
    expect(mockOpenExternalUrl).toHaveBeenCalledWith(
      "https://github.com/cto-mindset/algojava-releases"
    );

    expect(screen.queryByRole("link", { name: "bad" })).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText(/window\.__xss = true/)).toBeInTheDocument();
  });

  it("renders markdown release notes inside UpdateNotificationDialog", () => {
    useUpdaterStore.setState({
      status: "available",
      notificationOpen: true,
      confirmOpen: false,
      availableUpdate: {
        version: "1.0.1",
        currentVersion: "1.0.0",
        notes: "## AlgoJava v1.0.1\n\n- Improved `MarkdownContent` release notes",
      },
      progress: { downloadedBytes: 0, totalBytes: null, percent: null },
      errorKind: null,
      errorMessage: null,
      autoCheckedSession: true,
    });

    render(<UpdateNotificationDialog />);

    expect(screen.getByRole("heading", { level: 2, name: "AlgoJava v1.0.1" })).toBeInTheDocument();
    expect(screen.getByText("MarkdownContent").tagName).toBe("CODE");
  });
});
