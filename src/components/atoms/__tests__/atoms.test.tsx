import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock i18next before importing components that use it
import "@/test/i18n-mock";

import { Button } from "../Button";
import { Badge } from "../Badge";
import { Input } from "../Input";
import { Avatar } from "../Avatar";
import { StatusPill } from "../StatusPill";
import { RunStatus } from "@/models/run";
import type { BadgeVariant } from "../Badge";

// ─── Button ───────────────────────────────────────────────────────────────────

describe("Button", () => {
  it("renders with correct label and calls onClick", () => {
    const handleClick = vi.fn();
    render(
      <Button data-testid="btn" onClick={handleClick}>
        Submit
      </Button>
    );

    const btn = screen.getByTestId("btn");
    expect(btn).toBeDefined();
    expect(btn.textContent).toContain("Submit");

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("shows loading spinner and is disabled when isLoading=true", () => {
    render(
      <Button data-testid="btn-loading" isLoading>
        Save
      </Button>
    );

    const btn = screen.getByTestId("btn-loading");
    // Must be disabled
    expect((btn as HTMLButtonElement).disabled).toBe(true);
    // aria-busy must be set
    expect(btn.getAttribute("aria-busy")).toBe("true");
    // Spinner SVG must be present
    expect(btn.querySelector("svg")).toBeTruthy();
  });
});

// ─── Badge ────────────────────────────────────────────────────────────────────

describe("Badge", () => {
  const variants: BadgeVariant[] = [
    "success",
    "warning",
    "danger",
    "info",
    "neutral",
  ];

  it.each(variants)(
    'renders correct semantic color class for variant "%s"',
    (variant) => {
      render(
        <Badge data-testid={`badge-${variant}`} variant={variant}>
          {variant}
        </Badge>
      );

      const badge = screen.getByTestId(`badge-${variant}`);
      expect(badge).toBeDefined();
      // Each variant maps to a bg-<token> class
      expect(badge.className).toContain(variant === "neutral" ? "bg-neutral" : `bg-${variant}`);
    }
  );
});

// ─── Input ────────────────────────────────────────────────────────────────────

describe("Input", () => {
  it("displays error message when error prop is set", () => {
    render(
      <Input
        data-testid="input-email"
        label="Email"
        error="Email is required"
      />
    );

    const input = screen.getByTestId("input-email");
    // aria-invalid must be true
    expect(input.getAttribute("aria-invalid")).toBe("true");

    // Error message rendered with role="alert"
    const errorMsg = screen.getByRole("alert");
    expect(errorMsg.textContent).toBe("Email is required");
  });

  it("does not render error when error prop is absent", () => {
    render(<Input data-testid="input-name" label="Name" />);
    expect(screen.queryByRole("alert")).toBeNull();
    const input = screen.getByTestId("input-name");
    expect(input.getAttribute("aria-invalid")).toBe("false");
  });
});

// ─── Avatar ───────────────────────────────────────────────────────────────────

describe("Avatar", () => {
  it("renders initials when no src is provided", () => {
    render(<Avatar data-testid="avatar" name="Jane Doe" />);

    const avatar = screen.getByTestId("avatar");
    expect(avatar.textContent).toBe("JD");
  });

  it("renders initials for single-word name", () => {
    render(<Avatar data-testid="avatar-single" name="Admin" />);
    expect(screen.getByTestId("avatar-single").textContent).toBe("A");
  });

  it("renders an img element when src is provided", () => {
    render(
      <Avatar
        data-testid="avatar-img"
        name="Jane Doe"
        src="https://example.com/avatar.png"
      />
    );
    const wrapper = screen.getByTestId("avatar-img");
    expect(wrapper.querySelector("img")).toBeTruthy();
  });
});

// ─── StatusPill ───────────────────────────────────────────────────────────────

describe("StatusPill", () => {
  const statuses = Object.values(RunStatus);

  it.each(statuses)(
    'renders correct i18n label for RunStatus "%s"',
    (status) => {
      render(<StatusPill data-testid={`pill-${status}`} status={status} />);

      const pill = screen.getByTestId(`pill-${status}`);
      // The mock returns "runs:status.<STATUS>"
      expect(pill.textContent).toBe(`runs:status.${status}`);
      expect(pill.getAttribute("aria-label")).toBe(`runs:status.${status}`);
    }
  );

  it("applies the correct status CSS class for each status", () => {
    const classMap: Record<RunStatus, string> = {
      [RunStatus.PENDING]: "status-pending",
      [RunStatus.ASSIGNED]: "status-assigned",
      [RunStatus.IN_PROGRESS]: "status-in-progress",
      [RunStatus.COMPLETED]: "status-completed",
      [RunStatus.CANCELLED]: "status-cancelled",
    };

    for (const [status, cls] of Object.entries(classMap)) {
      const { unmount } = render(
        <StatusPill data-testid={`cls-${status}`} status={status as RunStatus} />
      );
      expect(screen.getByTestId(`cls-${status}`).className).toContain(cls);
      unmount();
    }
  });
});
