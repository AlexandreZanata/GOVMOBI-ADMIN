import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import "@/test/i18n-mock";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { LotacoesPageClient } from "@/components/organisms/LotacoesPageClient";
import { useLotacoes } from "@/hooks/useLotacoes";
import { useCreateLotacao } from "@/hooks/lotacoes/useCreateLotacao";
import { useUpdateLotacao } from "@/hooks/lotacoes/useUpdateLotacao";
import { useDeleteLotacao } from "@/hooks/lotacoes/useDeleteLotacao";
import { useReativarLotacao } from "@/hooks/lotacoes/useReativarLotacao";
import { UserRole } from "@/models";
import type { Lotacao } from "@/models/Lotacao";

// ── Mock hooks ───────────────────────────────────────────────────────────────
vi.mock("@/hooks/useLotacoes", () => ({ useLotacoes: vi.fn() }));
vi.mock("@/hooks/lotacoes/useCreateLotacao", () => ({
  useCreateLotacao: vi.fn(),
}));
vi.mock("@/hooks/lotacoes/useUpdateLotacao", () => ({
  useUpdateLotacao: vi.fn(),
}));
vi.mock("@/hooks/lotacoes/useDeleteLotacao", () => ({
  useDeleteLotacao: vi.fn(),
}));
vi.mock("@/hooks/lotacoes/useReativarLotacao", () => ({
  useReativarLotacao: vi.fn(),
}));

const mockUseLotacoes = vi.mocked(useLotacoes);
const mockUseCreateLotacao = vi.mocked(useCreateLotacao);
const mockUseUpdateLotacao = vi.mocked(useUpdateLotacao);
const mockUseDeleteLotacao = vi.mocked(useDeleteLotacao);
const mockUseReativarLotacao = vi.mocked(useReativarLotacao);

// ── Fixtures ─────────────────────────────────────────────────────────────────
const activeLotacao: Lotacao = {
  id: "lotacao-001",
  nome: "Secretaria de Fazenda",
  ativo: true,
  createdAt: "2026-04-15T14:00:00.000Z",
  updatedAt: "2026-04-15T14:00:00.000Z",
  deletedAt: null,
};

const inactiveLotacao: Lotacao = {
  id: "lotacao-003",
  nome: "Secretaria de Saúde",
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
      <LotacoesPageClient />
    </PermissionsProvider>
  );
}

describe("LotacoesPageClient", () => {
  beforeEach(() => {
    mockUseLotacoes.mockReturnValue({
      data: [activeLotacao, inactiveLotacao],
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });
    mockUseCreateLotacao.mockReturnValue(noopMutation as never);
    mockUseUpdateLotacao.mockReturnValue(noopMutation as never);
    mockUseDeleteLotacao.mockReturnValue(noopMutation as never);
    mockUseReativarLotacao.mockReturnValue(noopMutation as never);
  });

  it("renders the table with lotacao rows for ADMIN", () => {
    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("lotacoes-table")).toBeInTheDocument();
    expect(screen.getByTestId("lotacao-row-lotacao-001")).toBeInTheDocument();
    expect(screen.getByTestId("lotacao-row-lotacao-003")).toBeInTheDocument();
  });

  it("shows access denied for AGENT role (no LOTACAO_VIEW permission)", () => {
    renderForRole(UserRole.AGENT);

    expect(screen.getByTestId("lotacoes-access-denied")).toBeInTheDocument();
    expect(screen.queryByTestId("lotacoes-table")).toBeNull();
  });

  it("renders loading skeleton when isLoading is true", () => {
    mockUseLotacoes.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("lotacoes-loading")).toBeInTheDocument();
  });

  it("renders error state and calls refetch on retry", () => {
    const refetch = vi.fn(async () => {
      throw new Error("retry");
    });

    mockUseLotacoes.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("lotacoes-error")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("lotacoes-error-retry"));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("renders empty state when filtered list is empty", () => {
    mockUseLotacoes.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => {
        throw new Error("not used");
      }),
    });

    renderForRole(UserRole.ADMIN);

    expect(screen.getByTestId("lotacoes-empty")).toBeInTheDocument();
  });

  it("shows create button for ADMIN and hides for DISPATCHER", () => {
    const { rerender } = renderForRole(UserRole.ADMIN);
    expect(screen.getByTestId("lotacoes-create-btn")).toBeInTheDocument();

    rerender(
      <PermissionsProvider role={UserRole.DISPATCHER}>
        <LotacoesPageClient />
      </PermissionsProvider>
    );
    expect(screen.queryByTestId("lotacoes-create-btn")).toBeNull();
  });

  it("opens form dialog when create button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("lotacoes-create-btn"));

    expect(screen.getByTestId("lotacao-form-dialog")).toBeInTheDocument();
  });

  it("opens edit dialog when edit button is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("lotacao-edit-lotacao-001"));

    expect(screen.getByTestId("lotacao-form-dialog")).toBeInTheDocument();
  });

  it("opens delete dialog when delete button is clicked on active lotacao", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("lotacao-delete-lotacao-001"));

    expect(screen.getByTestId("lotacao-delete-dialog")).toBeInTheDocument();
  });

  it("shows reativar button for inactive lotacao", () => {
    renderForRole(UserRole.ADMIN);

    expect(
      screen.getByTestId("lotacao-reativar-lotacao-003")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("lotacao-delete-lotacao-003")
    ).toBeNull();
  });

  it("filters to active only when active filter is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("lotacoes-filter-active"));

    expect(screen.getByTestId("lotacao-row-lotacao-001")).toBeInTheDocument();
    expect(
      screen.queryByTestId("lotacao-row-lotacao-003")
    ).toBeNull();
  });

  it("filters to inactive only when inactive filter is clicked", () => {
    renderForRole(UserRole.ADMIN);

    fireEvent.click(screen.getByTestId("lotacoes-filter-inactive"));

    expect(screen.getByTestId("lotacao-row-lotacao-003")).toBeInTheDocument();
    expect(
      screen.queryByTestId("lotacao-row-lotacao-001")
    ).toBeNull();
  });

  it("renders search input with correct attributes", () => {
    renderForRole(UserRole.ADMIN);

    const searchInput = screen.getByTestId("lotacoes-search");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("type", "search");
    expect(searchInput).toHaveAttribute("placeholder", "Buscar por nome...");
    expect(searchInput).toHaveAttribute("aria-label", "Buscar lotações");
  });

  it("filters lotações by nome (case-insensitive)", () => {
    renderForRole(UserRole.ADMIN);

    const searchInput = screen.getByTestId("lotacoes-search");
    fireEvent.change(searchInput, { target: { value: "fazenda" } });

    expect(screen.getByTestId("lotacao-row-lotacao-001")).toBeInTheDocument();
    expect(screen.queryByTestId("lotacao-row-lotacao-003")).toBeNull();
  });

  it("filters lotações by nome with uppercase search term", () => {
    renderForRole(UserRole.ADMIN);

    const searchInput = screen.getByTestId("lotacoes-search");
    fireEvent.change(searchInput, { target: { value: "SAÚDE" } });

    expect(screen.getByTestId("lotacao-row-lotacao-003")).toBeInTheDocument();
    expect(screen.queryByTestId("lotacao-row-lotacao-001")).toBeNull();
  });

  it("shows all lotações when search is empty", () => {
    renderForRole(UserRole.ADMIN);

    const searchInput = screen.getByTestId("lotacoes-search");
    fireEvent.change(searchInput, { target: { value: "fazenda" } });
    fireEvent.change(searchInput, { target: { value: "" } });

    expect(screen.getByTestId("lotacao-row-lotacao-001")).toBeInTheDocument();
    expect(screen.getByTestId("lotacao-row-lotacao-003")).toBeInTheDocument();
  });

  it("combines search with status filter", () => {
    renderForRole(UserRole.ADMIN);

    // First filter by active
    fireEvent.click(screen.getByTestId("lotacoes-filter-active"));
    expect(screen.getByTestId("lotacao-row-lotacao-001")).toBeInTheDocument();
    expect(screen.queryByTestId("lotacao-row-lotacao-003")).toBeNull();

    // Then search for "fazenda" (should still show only active)
    const searchInput = screen.getByTestId("lotacoes-search");
    fireEvent.change(searchInput, { target: { value: "fazenda" } });
    expect(screen.getByTestId("lotacao-row-lotacao-001")).toBeInTheDocument();
    expect(screen.queryByTestId("lotacao-row-lotacao-003")).toBeNull();

    // Search for "saúde" (inactive, should show nothing)
    fireEvent.change(searchInput, { target: { value: "saúde" } });
    expect(screen.queryByTestId("lotacao-row-lotacao-001")).toBeNull();
    expect(screen.queryByTestId("lotacao-row-lotacao-003")).toBeNull();
  });

  it("shows empty state when search returns no results", () => {
    renderForRole(UserRole.ADMIN);

    const searchInput = screen.getByTestId("lotacoes-search");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(screen.getByTestId("lotacoes-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("lotacao-row-lotacao-001")).toBeNull();
    expect(screen.queryByTestId("lotacao-row-lotacao-003")).toBeNull();
  });
});
