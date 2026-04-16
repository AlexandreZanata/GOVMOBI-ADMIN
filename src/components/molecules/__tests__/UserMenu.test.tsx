import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import "@/test/i18n-mock";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { UserMenu } from "@/components/molecules/UserMenu";
import { UserRole } from "@/models";

function renderMenu(role: UserRole, isCollapsed = false) {
  return render(
    <PermissionsProvider role={role}>
      <UserMenu name="Jane Doe" role={role} isCollapsed={isCollapsed} />
    </PermissionsProvider>
  );
}

describe("UserMenu", () => {
  it("renders avatar and name when not collapsed", () => {
    renderMenu(UserRole.SUPERVISOR, false);
    expect(screen.getByTestId("user-menu-avatar")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders only avatar when collapsed", () => {
    renderMenu(UserRole.SUPERVISOR, true);
    expect(screen.getByTestId("user-menu-avatar")).toBeInTheDocument();
    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
  });

  it("renders correct role badge", () => {
    renderMenu(UserRole.ADMIN, false);
    expect(screen.getByTestId("user-menu-role-badge")).toHaveTextContent(UserRole.ADMIN);
  });
});
