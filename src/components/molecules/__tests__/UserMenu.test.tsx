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
 * Renders user menu with permission context for language selector tests.
 *
 * @param role - Role applied to permission provider
 * @returns Testing Library render result
 */
function renderMenu(role: UserRole) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PermissionsProvider role={role}>
        <UserMenu name="Jane Doe" role={role} isCollapsed={false} />
      </PermissionsProvider>
    </QueryClientProvider>
  );
}

describe("UserMenu", () => {
  it("renders language selector for role with VIEW_RUNS permission", () => {
    renderMenu(UserRole.SUPERVISOR);

    expect(screen.getByTestId("user-menu-language-selector")).toBeInTheDocument();
  });

  it("hides language selector for role without VIEW_RUNS permission", () => {
    renderMenu(UserRole.ADMIN);

    expect(screen.queryByTestId("user-menu-language-selector")).not.toBeInTheDocument();
  });

  it("changes language and persists preference", async () => {
    const user = userEvent.setup();
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    renderMenu(UserRole.DISPATCHER);

    await user.click(screen.getByTestId("user-menu-language-en"));

    expect(setItemSpy).toHaveBeenCalledWith("govmobile.language", "en");

    setItemSpy.mockRestore();
  });
});
