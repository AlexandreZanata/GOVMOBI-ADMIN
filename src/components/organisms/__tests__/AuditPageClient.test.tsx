import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import "@/test/i18n-mock";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { AuditPageClient } from "@/components/organisms/AuditPageClient";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { UserRole } from "@/models";
import type { AuditEntry } from "@/models";

vi.mock("@/hooks/useAuditTrail", () => ({
  useAuditTrail: vi.fn(),
}));

const mockUseAuditTrail = vi.mocked(useAuditTrail);

const auditFixture: AuditEntry[] = [
  {
    id: "audit-001",
    eventType: "run.overridden",
    actorId: "user-001",
    actorRole: "SUPERVISOR",
    entityType: "run",
    entityId: "run-001",
    departmentId: "dept-001",
    payload: { reason: "manual override", prevStatus: "IN_PROGRESS" },
    priority: "high",
    timestamp: "2026-04-15T10:30:00.000Z",
  },
];

function renderForRole(role: UserRole) {
  return render(
    <PermissionsProvider role={role}>
      <AuditPageClient />
    </PermissionsProvider>
  );
}

describe("AuditPageClient", () => {
  beforeEach(() => {
    mockUseAuditTrail.mockReturnValue({
      data: auditFixture,
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => undefined),
      hasNextPage: true,
      fetchNextPage: vi.fn(async () => undefined),
      isFetchingNextPage: false,
    });
  });

  it("renders access denied for dispatcher", () => {
    renderForRole(UserRole.DISPATCHER);
    expect(screen.getByTestId("audit-access-denied")).toBeInTheDocument();
  });

  it("renders timeline entries for supervisor", () => {
    renderForRole(UserRole.SUPERVISOR);
    expect(screen.getByTestId("audit-timeline")).toBeInTheDocument();
    expect(screen.getByTestId("audit-entry-audit-001")).toBeInTheDocument();
  });

  it("calls fetchNextPage on load more", () => {
    const fetchNextPage = vi.fn(async () => undefined);
    mockUseAuditTrail.mockReturnValue({
      data: auditFixture,
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => undefined),
      hasNextPage: true,
      fetchNextPage,
      isFetchingNextPage: false,
    });

    renderForRole(UserRole.ADMIN);
    fireEvent.click(screen.getByTestId("audit-load-more"));
    expect(fetchNextPage).toHaveBeenCalledOnce();
  });
});
