import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  Badge,
  Button,
  ConfirmDialog,
  ProgressBar,
  SegmentedControl,
  Switch,
} from "@/components/ui";

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

  it("switches options in SegmentedControl", () => {
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

    fireEvent.click(screen.getByRole("button", { name: "8" }));
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
});
