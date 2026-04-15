import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import "@/test/i18n-mock";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { RunOverrideDialog } from "@/components/molecules/RunOverrideDialog";
import { useOverrideRunMutation } from "@/hooks/runs/useOverrideRunMutation";
import { RunPriority, RunStatus, RunType, UserRole, type Run } from "@/models";

vi.mock("@/hooks/runs/useOverrideRunMutation", () => ({
  useOverrideRunMutation: vi.fn(),
}));

const mockUseOverrideRunMutation = vi.mocked(useOverrideRunMutation);

function renderDialog() {
  return render(
    <PermissionsProvider role={UserRole.SUPERVISOR}>
      <RunOverrideDialog data-testid="override" runId="run-1" />
    </PermissionsProvider>
  );
}

describe("RunOverrideDialog", () => {
  const runResult: Run = {
    id: "run-1",
    type: RunType.EMERGENCY,
    status: RunStatus.IN_PROGRESS,
    priority: RunPriority.HIGH,
    title: "Override test run",
    description: "Run used for override dialog tests",
    location: {
      lat: -8.0476,
      lng: -34.877,
      address: "HQ",
    },
    assignedAgentId: "agent-1",
    dispatcherId: "dispatcher-1",
    createdAt: "2026-04-15T10:00:00.000Z",
    updatedAt: "2026-04-15T10:05:00.000Z",
    completedAt: null,
    notes: null,
    proofs: [],
    departmentId: "dept-1",
  };

  const mutateAsync = vi.fn(async () => runResult);

  beforeEach(() => {
    mutateAsync.mockClear();
    mockUseOverrideRunMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
    });
  });

  it("opens dialog on trigger click", () => {
    renderDialog();

    fireEvent.click(screen.getByTestId("override-trigger"));

    expect(screen.getByTestId("override-dialog")).toBeInTheDocument();
  });

  it("disables confirm button when reason is empty", () => {
    renderDialog();

    fireEvent.click(screen.getByTestId("override-trigger"));

    const confirmButton = screen.getByTestId("override-dialog-confirm");
    expect((confirmButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("calls mutation on confirm click when reason is provided", async () => {
    renderDialog();

    fireEvent.click(screen.getByTestId("override-trigger"));
    fireEvent.change(screen.getByTestId("override-reason"), {
      target: { value: "runs:dialogs.override.reasonLabel" },
    });
    fireEvent.click(screen.getByTestId("override-dialog-confirm"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        runId: "run-1",
        reason: "runs:dialogs.override.reasonLabel",
        auditEvent: "RUN_OVERRIDE_CONFIRMED",
      });
    });
  });

  it("closes dialog on Escape key", async () => {
    renderDialog();

    fireEvent.click(screen.getByTestId("override-trigger"));
    expect(screen.getByTestId("override-dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByTestId("override-dialog")).toBeNull();
    });
  });

  it("returns focus to trigger on close", async () => {
    renderDialog();

    const trigger = screen.getByTestId("override-trigger");
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });
});
