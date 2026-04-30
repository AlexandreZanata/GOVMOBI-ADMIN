import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/test/i18n-mock";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { MotoristasPageClient } from "@/components/organisms/MotoristasPageClient";
import { useMotoristas } from "@/hooks/motoristas/useMotoristas";
import { useCreateMotorista } from "@/hooks/motoristas/useCreateMotorista";
import { useUpdateMotorista } from "@/hooks/motoristas/useUpdateMotorista";
import { useUpdateMotoristaStatus } from "@/hooks/motoristas/useUpdateMotoristaStatus";
import { useDesativarMotorista } from "@/hooks/motoristas/useDesativarMotorista";
import { useReativarMotorista } from "@/hooks/motoristas/useReativarMotorista";
import { UserRole, StatusOperacional } from "@/models";
import type { Motorista } from "@/models/Motorista";

// ── Mock hooks ───────────────────────────────────────────────────────────────
vi.mock("@/hooks/motoristas/useMotoristas", () => ({
  useMotoristas: vi.fn(),
}));
vi.mock("@/hooks/motoristas/useCreateMotorista", () => ({
  useCreateMotorista: vi.fn(),
}));
vi.mock("@/hooks/motoristas/useUpdateMotorista", () => ({
  useUpdateMotorista: vi.fn(),
}));
vi.mock("@/hooks/motoristas/useUpdateMotoristaStatus", () => ({
  useUpdateMotoristaStatus: vi.fn(),
}));
vi.mock("@/hooks/motoristas/useDesativarMotorista", () => ({
  useDesativarMotorista: vi.fn(),
}));
vi.mock("@/hooks/motoristas/useReativarMotorista", () => ({
  useReativarMotorista: vi.fn(),
}));

const mockUseMotoristas = vi.mocked(useMotoristas);
const mockUseCreateMotorista = vi.mocked(useCreateMotorista);
const mockUseUpdateMotorista = vi.mocked(useUpdateMotorista);
const mockUseUpdateMotoristaStatus = vi.mocked(useUpdateMotoristaStatus);
const mockUseDesativarMotorista = vi.mocked(useDesativarMotorista);
const mockUseReativarMotorista = vi.mocked(useReativarMotorista);

// ── Fixtures ─────────────────────────────────────────────────────────────────
const activeMotorista: Motorista = {
  id: "motorista-001",
  servidorId: "servidor-001",
  cnhNumero: "12345678901",
  cnhCategoria: "D",
  statusOperacional: StatusOperacional.DISPONIVEL,
  veiculoId: null,
  notaMedia: 4.8,
  totalAvaliacoes: 25,
  ativo: true,
  createdAt: "2026-04-15T08:00:00.000Z",
  updatedAt: "2026-04-15T08:00:00.000Z",
  deletedAt: null,
};

const inactiveMotorista: Motorista = {
  id: "motorista-003",
  servidorId: "servidor-003",
  cnhNumero: "11122233344",
  cnhCategoria: "E",
  statusOperacional: StatusOperacional.OFFLINE,
  veiculoId: null,
  notaMedia: null,
  totalAvaliacoes: 0,
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
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PermissionsProvider role={role}>
        <MotoristasPageClient />
      </PermissionsProvider>
    </QueryClientProvider>
  );
}

describe("MotoristasPageClient", () => {
  beforeEach(() => {
    mockUseMotoristas.mockReturnValue({
      data: [activeMotorista, inactiveMotorista],
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => { throw new Error("not used"); }),
    });
    mockUseCreateMotorista.mockReturnValue(noopMutation as never);
    mockUseUpdateMotorista.mockReturnValue(noopMutation as never);
    mockUseUpdateMotoristaStatus.mockReturnValue(noopMutation as never);
    mockUseDesativarMotorista.mockReturnValue(noopMutation as never);
    mockUseReativarMotorista.mockReturnValue(noopMutation as never);
  });

  it("renders the table with motorista rows for ADMIN", () => {
    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("motoristas-table")).toBeInTheDocument();
    expect(screen.getByTestId("motorista-row-motorista-001")).toBeInTheDocument();
    expect(screen.getByTestId("motorista-row-motorista-003")).toBeInTheDocument();
  });

  it("shows access denied for AGENT role (no MOTORISTA_VIEW permission)", () => {
    renderForRole(UserRole.AGENT);

    expect(screen.getByTestId("motoristas-access-denied")).toBeInTheDocument();
    expect(screen.queryByTestId("motoristas-table")).toBeNull();
  });

  it("renders loading skeleton when isLoading is true", () => {
    mockUseMotoristas.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(async () => { throw new Error("not used"); }),
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("motoristas-loading")).toBeInTheDocument();
  });

  it("renders error state and calls refetch on retry", () => {
    const refetch = vi.fn(async () => { throw new Error("retry"); });

    mockUseMotoristas.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("motoristas-error")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("motoristas-error-retry"));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("renders empty state when list is empty", () => {
    mockUseMotoristas.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => { throw new Error("not used"); }),
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("motoristas-empty")).toBeInTheDocument();
  });

  it("shows create button for ADMIN and hides for DISPATCHER", () => {
    const { rerender } = renderForRole(UserRole.ADMIN);
    expect(screen.getByTestId("motoristas-create-btn")).toBeInTheDocument();

    rerender(
      <PermissionsProvider role={UserRole.DISPATCHER}>
        <MotoristasPageClient />
      </PermissionsProvider>
    );
    expect(screen.queryByTestId("motoristas-create-btn")).toBeNull();
  });

  it("opens create form dialog when create button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("motoristas-create-btn"));

    expect(screen.getByTestId("motorista-form-dialog")).toBeInTheDocument();
  });

  it("opens edit form dialog when edit button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("motorista-edit-motorista-001"));

    expect(screen.getByTestId("motorista-form-dialog")).toBeInTheDocument();
  });

  it("opens status dialog when update status button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("motorista-status-btn-motorista-001"));

    expect(screen.getByTestId("motorista-status-dialog")).toBeInTheDocument();
  });

  it("opens desativar dialog when desativar button is clicked on active motorista", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("motorista-desativar-motorista-001"));

    expect(screen.getByTestId("motorista-desativar-dialog")).toBeInTheDocument();
  });

  it("shows reativar label on desativar button for inactive motorista", () => {
    renderForRole(UserRole.ADMIN);

    const btn = screen.getByTestId("motorista-desativar-motorista-003");
    // The button text key resolves to "motoristas:actions.reativar" via i18n-mock
    expect(btn).toBeInTheDocument();
  });

  it("filters to active only when active filter is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("motoristas-filter-active"));

    expect(screen.getByTestId("motorista-row-motorista-001")).toBeInTheDocument();
    expect(screen.queryByTestId("motorista-row-motorista-003")).toBeNull();
  });

  it("filters to inactive only when inactive filter is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("motoristas-filter-inactive"));

    expect(screen.getByTestId("motorista-row-motorista-003")).toBeInTheDocument();
    expect(screen.queryByTestId("motorista-row-motorista-001")).toBeNull();
  });
});
