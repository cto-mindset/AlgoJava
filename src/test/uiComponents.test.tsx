import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { TitleBar } from "@/components/layout/TitleBar";
import {
  Badge,
  Button,
  ConfirmDialog,
  ProgressBar,
  SegmentedControl,
  SettingCard,
  SettingRow,
  Switch,
} from "@/components/ui";
import { DEFAULT_SETTINGS, useSettingsStore } from "@/stores/settingsStore";

describe("Design System UI Components", () => {
  it("renders Button with click and loading state", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button variant="primary" onClick={onClick}>
        Run Code
      </Button>
    );

    const btn = screen.getByRole("button", { name: "Run Code" });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button variant="primary" loading onClick={onClick}>
        Run Code
      </Button>
    );
    expect(screen.getByRole("button", { name: "Run Code" })).toBeDisabled();
  });

  it("toggles Switch state cleanly", () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        ariaLabel="Auto Save"
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    );

    const sw = screen.getByRole("switch", { name: "Auto Save" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    fireEvent.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("switches options in SegmentedControl with aria-pressed", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl<number>
        value={4}
        onChange={onChange}
        options={[
          { value: 2, label: "2" },
          { value: 4, label: "4" },
          { value: 8, label: "8" },
        ]}
      />
    );

    const btn4 = screen.getByRole("button", { name: "4" });
    const btn8 = screen.getByRole("button", { name: "8" });
    expect(btn4).toHaveAttribute("aria-pressed", "true");
    expect(btn8).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(btn8);
    expect(onChange).toHaveBeenCalledWith(8);
  });

  it("renders Badge and clamped ProgressBar", () => {
    render(
      <>
        <Badge tone="success">Easy</Badge>
        <ProgressBar value={12} max={50} />
      </>
    );

    expect(screen.getByText("Easy")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "24");
  });

  it("handles ConfirmDialog confirmation and cancellation", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        open
        onClose={onClose}
        onConfirm={onConfirm}
        title="Reset Progress?"
        message="Are you sure?"
        confirmLabel="Confirm Reset"
        danger
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm Reset" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders SettingCard and SettingRow primitives", () => {
    render(
      <SettingCard
        id="test-card"
        icon={<span data-testid="card-icon" />}
        title="Typography"
        description="Configure font family."
      >
        <SettingRow label="Font Family" description="Used across headings.">
          <span>Outfit</span>
        </SettingRow>
      </SettingCard>
    );

    expect(screen.getByText("Typography")).toBeInTheDocument();
    expect(screen.getByText("Font Family")).toBeInTheDocument();
    expect(screen.getByText("Outfit")).toBeInTheDocument();
  });

  it("syncs ThemeProvider dataset attributes and toggles Sidebar/TitleBar", async () => {
    useSettingsStore.setState({
      settings: {
        ...DEFAULT_SETTINGS,
        theme: "light",
        accentColor: "violet",
        fontFamily: "outfit",
        fontSize: "lg",
        sidebarCollapsed: false,
      },
      hydrated: true,
    });

    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <ThemeProvider>
          <Sidebar />
          <TitleBar />
        </ThemeProvider>
      </MemoryRouter>
    );

    const root = document.documentElement;
    expect(root.dataset.theme).toBe("light");
    expect(root.dataset.accent).toBe("violet");
    expect(root.dataset.fontFamily).toBe("outfit");
    expect(root.dataset.fontScale).toBe("lg");

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(useSettingsStore.getState().settings.sidebarCollapsed).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    await waitFor(() => {
      expect(useSettingsStore.getState().settings.theme).toBe("dark");
    });
  });
});
