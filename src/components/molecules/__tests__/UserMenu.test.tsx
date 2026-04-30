import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/test/i18n-mock";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { UserMenu } from "@/components/molecules/UserMenu";
import { UserRole } from "@/models";

// Mock next/navigation — UserMenu uses useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
}));

/**
 * Renders user menu with permission context.
 */
function renderMenu(role: UserRole) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PermissionsProvider role={role}>
        <UserMenu name="Jane Doe" role={role} isCollapsed={false} onLogout={vi.fn()} />
      </PermissionsProvider>
    </QueryClientProvider>
  );
}

describe("UserMenu", () => {
  it("renders avatar with user name", () => {
    renderMenu(UserRole.SUPERVISOR);
    expect(screen.getByTestId("user-menu-avatar")).toBeInTheDocument();
  });

  it("renders role badge", () => {
    renderMenu(UserRole.ADMIN);
    expect(screen.getByTestId("user-menu-role-badge")).toBeInTheDocument();
  });

  it("opens dropdown and shows logout button when clicked", async () => {
    const user = userEvent.setup();
    renderMenu(UserRole.DISPATCHER);

    await user.click(screen.getByTestId("user-menu"));
    expect(screen.getByTestId("user-menu-logout")).toBeInTheDocument();
  });
});
