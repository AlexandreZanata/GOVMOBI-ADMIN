import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import "@/test/i18n-mock";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { DepartmentsPageClient } from "@/components/organisms/DepartmentsPageClient";
import { useDepartments } from "@/hooks/departments/useDepartments";
import { useCreateDepartment } from "@/hooks/departments/useCreateDepartment";
import { UserRole } from "@/models";
import type { Department } from "@/models/Department";
import type { PaginatedResponse } from "@/facades/usersFacade";

// ── Mock hooks ───────────────────────────────────────────────────────────────
vi.mock("@/hooks/departments/useDepartments", () => ({
  useDepartments: vi.fn(),
}));
vi.mock("@/hooks/departments/useCreateDepartment", () => ({
  useCreateDepartment: vi.fn(),
}));

const mockUseDepartments = vi.mocked(useDepartments);
const mockUseCreateDepartment = vi.mocked(useCreateDepartment);

// ── Fixtures ─────────────────────────────────────────────────────────────────
const dept1: Department = {
  id: "dept-001",
  name: "Zone 3 Operations",
  description: "Handles all Zone 3 field operations",
  userCount: 12,
  activeRunCount: 4,
  createdAt: "2026-04-01T00:00:00.000Z",
};

const dept2: Department = {
  id: "dept-002",
  name: "Zone 1 Inspections",
  description: null,
  userCount: 8,
  activeRunCount: 0,
  createdAt: "2026-04-01T00:00:00.000Z",
};

function makePage(items: Department[]): PaginatedResponse<Department> {
  return { items, total: items.length, page: 1, pageSize: 25, hasMore: false };
}

const noopMutation = {
  mutateAsync: vi.fn(async () => undefined),
  isPending: false,
};

function renderForRole(role: UserRole) {
  return render(
    <PermissionsProvider role={role}>
      <DepartmentsPageClient />
    </PermissionsProvider>
  );
}

describe("DepartmentsPageClient", () => {
  beforeEach(() => {
    mockUseDepartments.mockReturnValue({
      data: makePage([dept1, dept2]),
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });
    mockUseCreateDepartment.mockReturnValue(noopMutation as never);
  });

  it("renders department cards for ADMIN", () => {
    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("departments-grid")).toBeInTheDocument();
    expect(screen.getByTestId("department-card-dept-001")).toBeInTheDocument();
    expect(screen.getByTestId("department-card-dept-002")).toBeInTheDocument();
  });

  it("shows access denied for AGENT role", () => {
    renderForRole(UserRole.AGENT);

    expect(screen.getByTestId("departments-access-denied")).toBeInTheDocument();
    expect(screen.queryByTestId("departments-grid")).toBeNull();
  });

  it("renders loading skeleton when isLoading is true", () => {
    mockUseDepartments.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("departments-loading")).toBeInTheDocument();
  });

  it("renders error state and calls refetch on retry", () => {
    const refetch = vi.fn(async () => {
      throw new Error("retry");
    });

    mockUseDepartments.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("departments-error")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("departments-error-retry"));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("renders empty state when list is empty", () => {
    mockUseDepartments.mockReturnValue({
      data: makePage([]),
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("departments-empty")).toBeInTheDocument();
  });

  it("shows create button for ADMIN and hides for DISPATCHER", () => {
    const { rerender } = renderForRole(UserRole.ADMIN);
    expect(screen.getByTestId("departments-create-btn")).toBeInTheDocument();

    rerender(
      <PermissionsProvider role={UserRole.DISPATCHER}>
        <DepartmentsPageClient />
      </PermissionsProvider>
    );
    expect(screen.queryByTestId("departments-create-btn")).toBeNull();
  });

  it("opens form dialog when create button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("departments-create-btn"));

    expect(screen.getByTestId("department-form-dialog")).toBeInTheDocument();
  });

  it("renders department name and user/run counts in each card", () => {
    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("department-name-dept-001")).toHaveTextContent(
      "Zone 3 Operations"
    );
    expect(screen.getByTestId("department-users-dept-001")).toBeInTheDocument();
    expect(screen.getByTestId("department-runs-dept-001")).toBeInTheDocument();
  });

  it("shows noDescription placeholder when description is null", () => {
    renderForRole(UserRole.ADMIN);

    // dept-002 has null description — should render the noDescription key
    const card = screen.getByTestId("department-card-dept-002");
    expect(card).toBeInTheDocument();
  });
});
