import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import "@/test/i18n-mock";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { UsersPageClient } from "@/components/organisms/UsersPageClient";
import { useUsers } from "@/hooks/users/useUsers";
import { useCreateUser } from "@/hooks/users/useCreateUser";
import { useUpdateUser } from "@/hooks/users/useUpdateUser";
import { useDeactivateUser } from "@/hooks/users/useDeactivateUser";
import { UserRole, UserStatus } from "@/models";
import type { User } from "@/models/User";
import type { PaginatedResponse } from "@/facades/usersFacade";

// ── Mock hooks ───────────────────────────────────────────────────────────────
vi.mock("@/hooks/users/useUsers", () => ({ useUsers: vi.fn() }));
vi.mock("@/hooks/users/useCreateUser", () => ({ useCreateUser: vi.fn() }));
vi.mock("@/hooks/users/useUpdateUser", () => ({ useUpdateUser: vi.fn() }));
vi.mock("@/hooks/users/useDeactivateUser", () => ({
  useDeactivateUser: vi.fn(),
}));

const mockUseUsers = vi.mocked(useUsers);
const mockUseCreateUser = vi.mocked(useCreateUser);
const mockUseUpdateUser = vi.mocked(useUpdateUser);
const mockUseDeactivateUser = vi.mocked(useDeactivateUser);

// ── Fixtures ─────────────────────────────────────────────────────────────────
const activeUser: User = {
  id: "user-001",
  name: "Ana Lima",
  email: "ana.lima@gov.internal",
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
  departmentId: "dept-001",
  avatarUrl: null,
  createdAt: "2026-04-01T00:00:00.000Z",
  lastActiveAt: "2026-04-15T10:00:00.000Z",
};

const inactiveUser: User = {
  id: "user-003",
  name: "Beatriz Nunes",
  email: "b.nunes@gov.internal",
  role: UserRole.SUPERVISOR,
  status: UserStatus.INACTIVE,
  departmentId: "dept-002",
  avatarUrl: null,
  createdAt: "2026-04-01T00:00:00.000Z",
  lastActiveAt: "2026-04-10T08:00:00.000Z",
};

function makePage(items: User[]): PaginatedResponse<User> {
  return { items, total: items.length, page: 1, pageSize: 25, hasMore: false };
}

const noopMutation = {
  mutateAsync: vi.fn(async () => undefined),
  isPending: false,
};

function renderForRole(role: UserRole) {
  return render(
    <PermissionsProvider role={role}>
      <UsersPageClient />
    </PermissionsProvider>
  );
}

describe("UsersPageClient", () => {
  beforeEach(() => {
    mockUseUsers.mockReturnValue({
      data: makePage([activeUser, inactiveUser]),
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });
    mockUseCreateUser.mockReturnValue(noopMutation as never);
    mockUseUpdateUser.mockReturnValue(noopMutation as never);
    mockUseDeactivateUser.mockReturnValue(noopMutation as never);
  });

  it("renders the table with user rows for ADMIN", () => {
    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("users-table")).toBeInTheDocument();
    expect(screen.getByTestId("user-row-user-001")).toBeInTheDocument();
    expect(screen.getByTestId("user-row-user-003")).toBeInTheDocument();
  });

  it("shows access denied for AGENT role", () => {
    renderForRole(UserRole.AGENT);

    expect(screen.getByTestId("users-access-denied")).toBeInTheDocument();
    expect(screen.queryByTestId("users-table")).toBeNull();
  });

  it("renders loading skeleton when isLoading is true", () => {
    mockUseUsers.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("users-loading")).toBeInTheDocument();
  });

  it("renders error state and calls refetch on retry", () => {
    const refetch = vi.fn(async () => {
      throw new Error("retry");
    });

    mockUseUsers.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("users-error")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("users-error-retry"));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("renders empty state when list is empty", () => {
    mockUseUsers.mockReturnValue({
      data: makePage([]),
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("users-empty")).toBeInTheDocument();
  });

  it("shows create button for ADMIN and hides for DISPATCHER", () => {
    const { rerender } = renderForRole(UserRole.ADMIN);
    expect(screen.getByTestId("users-create-btn")).toBeInTheDocument();

    rerender(
      <PermissionsProvider role={UserRole.DISPATCHER}>
        <UsersPageClient />
      </PermissionsProvider>
    );
    expect(screen.queryByTestId("users-create-btn")).toBeNull();
  });

  it("opens form dialog when create button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("users-create-btn"));

    expect(screen.getByTestId("user-form-dialog")).toBeInTheDocument();
  });

  it("opens edit dialog when edit button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("user-edit-user-001"));

    expect(screen.getByTestId("user-form-dialog")).toBeInTheDocument();
  });

  it("opens deactivate dialog when deactivate button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("user-deactivate-user-001"));

    expect(screen.getByTestId("user-deactivate-dialog")).toBeInTheDocument();
  });

  it("does not show deactivate button for inactive users", () => {
    renderForRole(UserRole.ADMIN);

    expect(
      screen.queryByTestId("user-deactivate-user-003")
    ).toBeNull();
  });

  it("renders role badge for each user", () => {
    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("user-role-user-001")).toBeInTheDocument();
    expect(screen.getByTestId("user-role-user-003")).toBeInTheDocument();
  });

  it("renders avatar for each user", () => {
    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("user-avatar-user-001")).toBeInTheDocument();
  });
});
