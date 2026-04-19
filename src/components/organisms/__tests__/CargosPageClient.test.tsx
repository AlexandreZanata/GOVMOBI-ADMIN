import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import "@/test/i18n-mock";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { CargosPageClient } from "@/components/organisms/CargosPageClient";
import { useCargos } from "@/hooks/cargos/useCargos";
import { useCreateCargo } from "@/hooks/cargos/useCreateCargo";
import { useUpdateCargo } from "@/hooks/cargos/useUpdateCargo";
import { useDeleteCargo } from "@/hooks/cargos/useDeleteCargo";
import { useReativarCargo } from "@/hooks/cargos/useReativarCargo";
import { UserRole } from "@/models";
import type { Cargo } from "@/models/Cargo";

// ── Mock hooks ───────────────────────────────────────────────────────────────
vi.mock("@/hooks/cargos/useCargos", () => ({ useCargos: vi.fn() }));
vi.mock("@/hooks/cargos/useCreateCargo", () => ({
  useCreateCargo: vi.fn(),
}));
vi.mock("@/hooks/cargos/useUpdateCargo", () => ({
  useUpdateCargo: vi.fn(),
}));
vi.mock("@/hooks/cargos/useDeleteCargo", () => ({
  useDeleteCargo: vi.fn(),
}));
vi.mock("@/hooks/cargos/useReativarCargo", () => ({
  useReativarCargo: vi.fn(),
}));

const mockUseCargos = vi.mocked(useCargos);
const mockUseCreateCargo = vi.mocked(useCreateCargo);
const mockUseUpdateCargo = vi.mocked(useUpdateCargo);
const mockUseDeleteCargo = vi.mocked(useDeleteCargo);
const mockUseReativarCargo = vi.mocked(useReativarCargo);

// ── Fixtures ─────────────────────────────────────────────────────────────────
const activeCargo: Cargo = {
  id: "cargo-001",
  nome: "Auditor Fiscal",
  pesoPrioridade: 80,
  ativo: true,
  createdAt: "2026-04-15T14:00:00.000Z",
  updatedAt: "2026-04-15T14:00:00.000Z",
  deletedAt: null,
};

const inactiveCargo: Cargo = {
  id: "cargo-003",
  nome: "Analista Tributário",
  pesoPrioridade: 50,
  ativo: false,
  createdAt: "2026-04-10T10:00:00.000Z",
  updatedAt: "2026-04-14T08:00:00.000Z",
  deletedAt: "2026-04-14T08:00:00.000Z",
};

const noopMutation = {
  mutateAsync: vi.fn(async () => undefined),
  isPending: false,
};

function renderForRole(role: UserRole) {
  return render(
    <PermissionsProvider role={role}>
      <CargosPageClient />
    </PermissionsProvider>
  );
}

describe("CargosPageClient", () => {
  beforeEach(() => {
    mockUseCargos.mockReturnValue({
      data: [activeCargo, inactiveCargo],
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });
    mockUseCreateCargo.mockReturnValue(noopMutation as never);
    mockUseUpdateCargo.mockReturnValue(noopMutation as never);
    mockUseDeleteCargo.mockReturnValue(noopMutation as never);
    mockUseReativarCargo.mockReturnValue(noopMutation as never);
  });

  it("renders the table with cargo rows for ADMIN", () => {
    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("cargos-table")).toBeInTheDocument();
    expect(screen.getByTestId("cargo-row-cargo-001")).toBeInTheDocument();
    expect(screen.getByTestId("cargo-row-cargo-003")).toBeInTheDocument();
  });

  it("shows access denied for AGENT role (no CARGO_VIEW permission)", () => {
    renderForRole(UserRole.AGENT);

    expect(screen.getByTestId("cargos-access-denied")).toBeInTheDocument();
    expect(screen.queryByTestId("cargos-table")).toBeNull();
  });

  it("renders loading skeleton when isLoading is true", () => {
    mockUseCargos.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("cargos-loading")).toBeInTheDocument();
  });

  it("renders error state and calls refetch on retry", () => {
    const refetch = vi.fn(async () => {
      throw new Error("retry");
    });

    mockUseCargos.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("cargos-error")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("cargos-error-retry"));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("renders empty state when filtered list is empty", () => {
    mockUseCargos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("cargos-empty")).toBeInTheDocument();
  });

  it("shows create button for ADMIN and hides for DISPATCHER", () => {
    const { rerender } = renderForRole(UserRole.ADMIN);
    expect(screen.getByTestId("cargos-create-btn")).toBeInTheDocument();

    rerender(
      <PermissionsProvider role={UserRole.DISPATCHER}>
        <CargosPageClient />
      </PermissionsProvider>
    );
    expect(screen.queryByTestId("cargos-create-btn")).toBeNull();
  });

  it("opens form dialog when create button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("cargos-create-btn"));

    expect(screen.getByTestId("cargo-form-dialog")).toBeInTheDocument();
  });

  it("opens edit dialog when edit button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("cargo-edit-cargo-001"));

    expect(screen.getByTestId("cargo-form-dialog")).toBeInTheDocument();
  });

  it("opens delete dialog when delete button is clicked on active cargo", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("cargo-delete-cargo-001"));

    expect(screen.getByTestId("cargo-delete-dialog")).toBeInTheDocument();
  });

  it("shows reativar button for inactive cargo, not desativar", () => {
    renderForRole(UserRole.ADMIN);

    expect(
      screen.getByTestId("cargo-reativar-cargo-003")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("cargo-delete-cargo-003")
    ).toBeNull();
  });

  it("filters to active only when active filter is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("cargos-filter-active"));

    expect(screen.getByTestId("cargo-row-cargo-001")).toBeInTheDocument();
    expect(screen.queryByTestId("cargo-row-cargo-003")).toBeNull();
  });

  it("filters to inactive only when inactive filter is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("cargos-filter-inactive"));

    expect(screen.getByTestId("cargo-row-cargo-003")).toBeInTheDocument();
    expect(screen.queryByTestId("cargo-row-cargo-001")).toBeNull();
  });

  it("renders search input with correct data-testid, aria-label, placeholder", () => {
    renderForRole(UserRole.ADMIN);

    const searchInput = screen.getByTestId("cargos-search");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("type", "search");
    expect(searchInput).toHaveAttribute("placeholder", "Buscar por nome...");
    expect(searchInput).toHaveAttribute("aria-label", "Buscar cargos");
  });

  it("filters cargos by nome (case-insensitive) — search 'auditor' shows cargo-001, hides cargo-003", () => {
    renderForRole(UserRole.ADMIN);

    const searchInput = screen.getByTestId("cargos-search");
    fireEvent.change(searchInput, { target: { value: "auditor" } });

    expect(screen.getByTestId("cargo-row-cargo-001")).toBeInTheDocument();
    expect(screen.queryByTestId("cargo-row-cargo-003")).toBeNull();
  });

  it("filters cargos by nome with uppercase search term — search 'TRIBUTÁRIO' shows cargo-003", () => {
    renderForRole(UserRole.ADMIN);

    const searchInput = screen.getByTestId("cargos-search");
    fireEvent.change(searchInput, { target: { value: "TRIBUTÁRIO" } });

    expect(screen.getByTestId("cargo-row-cargo-003")).toBeInTheDocument();
    expect(screen.queryByTestId("cargo-row-cargo-001")).toBeNull();
  });

  it("shows all cargos when search is cleared", () => {
    renderForRole(UserRole.ADMIN);

    const searchInput = screen.getByTestId("cargos-search");
    fireEvent.change(searchInput, { target: { value: "auditor" } });
    fireEvent.change(searchInput, { target: { value: "" } });

    expect(screen.getByTestId("cargo-row-cargo-001")).toBeInTheDocument();
    expect(screen.getByTestId("cargo-row-cargo-003")).toBeInTheDocument();
  });

  it("shows empty state when search returns no results", () => {
    renderForRole(UserRole.ADMIN);

    const searchInput = screen.getByTestId("cargos-search");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(screen.getByTestId("cargos-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("cargo-row-cargo-001")).toBeNull();
    expect(screen.queryByTestId("cargo-row-cargo-003")).toBeNull();
  });

  it("combines search with status filter", () => {
    renderForRole(UserRole.ADMIN);

    // First filter by active
    fireEvent.click(screen.getByTestId("cargos-filter-active"));
    expect(screen.getByTestId("cargo-row-cargo-001")).toBeInTheDocument();
    expect(screen.queryByTestId("cargo-row-cargo-003")).toBeNull();

    // Then search for "auditor" (should still show only active)
    const searchInput = screen.getByTestId("cargos-search");
    fireEvent.change(searchInput, { target: { value: "auditor" } });
    expect(screen.getByTestId("cargo-row-cargo-001")).toBeInTheDocument();
    expect(screen.queryByTestId("cargo-row-cargo-003")).toBeNull();

    // Search for "tributário" (inactive, should show nothing since filter is active)
    fireEvent.change(searchInput, { target: { value: "tributário" } });
    expect(screen.queryByTestId("cargo-row-cargo-001")).toBeNull();
    expect(screen.queryByTestId("cargo-row-cargo-003")).toBeNull();
  });

  it("opens view modal when view button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("cargo-view-cargo-001"));

    expect(screen.getByTestId("cargo-view-modal")).toBeInTheDocument();
  });
});
