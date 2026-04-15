import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import "@/test/i18n-mock";

import { StatusChip, type StatusChipVariant } from "../StatusChip";

describe("StatusChip", () => {
  const variants: StatusChipVariant[] = [
    "success",
    "warning",
    "danger",
    "info",
    "neutral",
  ];

  it.each(variants)("renders variant class for %s", (variant) => {
    render(<StatusChip data-testid={`chip-${variant}`} variant={variant} />);

    const chip = screen.getByTestId(`chip-${variant}`);
    expect(chip.className).toContain(
      variant === "neutral" ? "bg-neutral-200" : `bg-${variant}`
    );
    expect(chip.className).toContain(
      variant === "neutral" ? "text-neutral-700" : `text-${variant}`
    );
  });

  it("renders translated default label key", () => {
    render(<StatusChip data-testid="chip-default" variant="success" />);

    const chip = screen.getByTestId("chip-default");
    expect(chip.textContent).toBe("common:statusChip.success");
    expect(chip.getAttribute("aria-label")).toBe("common:statusChip.success");
  });

  it("renders translated custom label key and namespace", () => {
    render(
      <StatusChip
        data-testid="chip-custom-i18n"
        namespace="runs"
        labelKey="status.custom"
      />
    );

    const chip = screen.getByTestId("chip-custom-i18n");
    expect(chip.textContent).toBe("runs:status.custom");
    expect(chip.getAttribute("aria-label")).toBe("runs:status.custom");
  });

  it("supports interactive state and click handling", () => {
    const handleClick = vi.fn();

    render(
      <StatusChip
        data-testid="chip-interactive"
        interactive
        onClick={handleClick}
      />
    );

    const chip = screen.getByTestId("chip-interactive");
    expect(chip.tagName).toBe("BUTTON");
    fireEvent.click(chip);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("exposes accessibility attributes for interactive chip", () => {
    render(
      <StatusChip
        data-testid="chip-a11y"
        interactive
        pressed
        labelKey="status.expanded"
      />
    );

    const chip = screen.getByTestId("chip-a11y");
    expect(chip.getAttribute("aria-pressed")).toBe("true");
    expect(chip.getAttribute("aria-label")).toBe("common:status.expanded");
  });

  it("disables interactive chip correctly", () => {
    render(<StatusChip data-testid="chip-disabled" interactive disabled />);

    const chip = screen.getByTestId("chip-disabled") as HTMLButtonElement;
    expect(chip.disabled).toBe(true);
  });
});
