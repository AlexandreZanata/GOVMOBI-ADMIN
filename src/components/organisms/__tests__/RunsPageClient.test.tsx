import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import "@/test/i18n-mock";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { RunsPageClient } from "@/components/organisms/RunsPageClient";
import { useRuns } from "@/hooks/useRuns";
import { RunPriority, RunStatus, RunType, UserRole, type Run } from "@/models";

vi.mock("@/hooks/useRuns", () => ({
  useRuns: vi.fn(),
}));

const mockUseRuns = vi.mocked(useRuns);

const runFixture: Run = {
  id: "run-1",
  type: RunType.TRANSPORT,
  status: RunStatus.ASSIGNED,
  priority: RunPriority.HIGH,
  title: "Transport mission",
  description: "Move team to command center",
  location: {
    lat: -8.0476,
    lng: -34.877,
    address: "Command Center",
  },
  assignedAgentId: "agent-1",
  dispatcherId: "dispatcher-1",
  createdAt: "2026-04-15T10:00:00.000Z",
  updatedAt: "2026-04-15T10:00:00.000Z",
  completedAt: null,
  notes: null,
  proofs: [],
  departmentId: "dept-1",
};

function renderForRole(role: UserRole) {
  return render(
    <PermissionsProvider role={role}>
      <RunsPageClient />
    </PermissionsProvider>
  );
}

describe("RunsPageClient", () => {
  beforeEach(() => {
    mockUseRuns.mockReturnValue({
      data: [runFixture],
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });
  });

  it.each([
    UserRole.AGENT,
    UserRole.DISPATCHER,
    UserRole.SUPERVISOR,
    UserRole.ADMIN,
  ])("renders list correctly for role %s", (role) => {
    renderForRole(role);

    expect(screen.getByTestId("runs-list")).toBeInTheDocument();
    expect(screen.getByTestId("run-card-run-1")).toBeInTheDocument();
  });

  it("permission gates hide and show actions by role", () => {
    const { rerender } = render(
      <PermissionsProvider role={UserRole.AGENT}>
        <RunsPageClient />
      </PermissionsProvider>
    );

    expect(screen.queryByTestId("assign-run-run-1")).toBeNull();
    expect(screen.getByTestId("update-run-run-1")).toBeInTheDocument();
    expect(screen.queryByTestId("override-run-run-1-trigger")).toBeNull();

    rerender(
      <PermissionsProvider role={UserRole.SUPERVISOR}>
        <RunsPageClient />
      </PermissionsProvider>
    );

    expect(screen.getByTestId("assign-run-run-1")).toBeInTheDocument();
    expect(screen.getByTestId("update-run-run-1")).toBeInTheDocument();
    expect(screen.getByTestId("override-run-run-1-trigger")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    mockUseRuns.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("runs-empty")).toBeInTheDocument();
    expect(screen.getByText("runs:page.empty.title")).toBeInTheDocument();
  });

  it("renders error state on API failure and retries", () => {
    const refetch = vi.fn(async () => {
      throw new Error("retry");
    });

    mockUseRuns.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("runs-error")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("runs-error-retry"));
    expect(refetch).toHaveBeenCalledOnce();
  });
});
