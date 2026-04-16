/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "../../atoms/__tests__/../../../test/i18n-mock";
import { AdminShell } from "../AdminShell";
import { UserRole } from "@/models";
import React from "react";

// Mock next/navigation — usePathname used inside NavItem
vi.mock("next/navigation", () => ({
  usePathname: () => "/runs",
}));

// Mock next/link — renders a plain <a> in tests
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AdminShell", () => {
  beforeEach(() => {
    // Reset cookie between tests
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
  });

  it("renders children in the main content area", () => {
    render(
      <AdminShell userRole={UserRole.ADMIN}>
        <p>Page content</p>
      </AdminShell>
    );
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("renders the main element with id=main-content", () => {
    render(<AdminShell userRole={UserRole.ADMIN} />);
    expect(document.getElementById("main-content")).toBeInTheDocument();
  });

  it("renders the sidebar in expanded state by default", () => {
    render(<AdminShell userRole={UserRole.ADMIN} />);
    const sidebar = screen.getByTestId("sidebar-nav");
    expect(sidebar).toHaveClass("w-60");
  });

  it("renders the sidebar in collapsed state when defaultCollapsed=true", () => {
    render(<AdminShell userRole={UserRole.ADMIN} defaultCollapsed />);
    const sidebar = screen.getByTestId("sidebar-nav");
    expect(sidebar).toHaveClass("w-16");
  });

  it("toggles sidebar collapse on button click and persists cookie", async () => {
    const user = userEvent.setup();
    render(<AdminShell userRole={UserRole.ADMIN} />);

    const toggle = screen.getByTestId("sidebar-collapse-toggle");
    await user.click(toggle);

    const sidebar = screen.getByTestId("sidebar-nav");
    expect(sidebar).toHaveClass("w-16");
    expect(document.cookie).toContain("sidebar_collapsed=true");
  });

  it("renders nav with translated aria-label", () => {
    render(<AdminShell userRole={UserRole.ADMIN} />);
    expect(
      screen.getByRole("navigation", { name: "nav:mainNavigation" })
    ).toBeInTheDocument();
  });

  it("marks the active route link with aria-current=page", () => {
    // usePathname is mocked to return "/runs"
    render(<AdminShell userRole={UserRole.ADMIN} />);
    const activeLink = screen.getByTestId("nav-item--runs");
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("hides permission-gated nav items for roles without access", () => {
    // AGENT role has no CARGO_VIEW permission
    render(<AdminShell userRole={UserRole.AGENT} />);
    expect(screen.queryByTestId("nav-item--cargos")).not.toBeInTheDocument();
  });

  it("shows permission-gated nav items for ADMIN role", () => {
    render(<AdminShell userRole={UserRole.ADMIN} />);
    // ADMIN has all permissions — all nav items should render
    expect(screen.getByTestId("nav-item--runs")).toBeInTheDocument();
  });

  it("renders user menu with avatar", () => {
    render(
      <AdminShell userRole={UserRole.SUPERVISOR} userName="Jane Doe" />
    );
    expect(screen.getByTestId("user-menu-avatar")).toBeInTheDocument();
  });

  it("collapse toggle has correct aria-expanded attribute", () => {
    render(<AdminShell userRole={UserRole.ADMIN} />);
    const toggle = screen.getByTestId("sidebar-collapse-toggle");
    // Expanded by default → aria-expanded=true
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
