import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/test/i18n-mock";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { RunsPageClient } from "@/components/organisms/RunsPageClient";
import { useRuns } from "@/hooks/runs/useRuns";
import { useActiveRuns } from "@/hooks/runs/useActiveRuns";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { useServidores } from "@/hooks/servidores/useServidores";
import { useMotoristas } from "@/hooks/motoristas/useMotoristas";
import { RunStatus, UserRole, type Run } from "@/models";
import type { CorridasPage } from "@/models/Run";

vi.mock("@/hooks/runs/useRuns", () => ({
  useRuns: vi.fn(),
}));

vi.mock("@/hooks/runs/useActiveRuns", () => ({
  useActiveRuns: vi.fn(),
}));

vi.mock("@/hooks/auth/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock("@/hooks/servidores/useServidores", () => ({
  useServidores: vi.fn(),
}));

vi.mock("@/hooks/motoristas/useMotoristas", () => ({
  useMotoristas: vi.fn(),
}));

const mockUseRuns = vi.mocked(useRuns);
const mockUseActiveRuns = vi.mocked(useActiveRuns);
const mockUseCurrentUser = vi.mocked(useCurrentUser);
const mockUseServidores = vi.mocked(useServidores);
const mockUseMotoristas = vi.mocked(useMotoristas);

const runFixture: Run = {
  id: "run-1",
  status: RunStatus.ACEITA,
  passageiroId: "passageiro-1",
  motoristaId: "motorista-1",
  veiculoId: null,
  origem: { lat: -12.5448, lng: -55.7273, endereco: "Origem Test" },
  destino: { lat: -12.5459, lng: -55.7202, endereco: "Destino Test" },
  distanciaMetros: 850,
  duracaoSegundos: null,
  createdAt: "2026-04-15T10:00:00.000Z",
  updatedAt: "2026-04-15T10:00:00.000Z",
};

const pageFixture: CorridasPage = {
  data: [runFixture],
  total: 1,
  page: 1,
  limit: 25,
  totalPages: 1,
};

function renderForRole(role: UserRole) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <PermissionsProvider role={role}>
        <RunsPageClient />
      </PermissionsProvider>
    </QueryClientProvider>
  );
}

describe("RunsPageClient", () => {
  beforeEach(() => {
    mockUseRuns.mockReturnValue({
      data: pageFixture,
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => { throw new Error("not used"); }),
    });
    
    mockUseActiveRuns.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => { throw new Error("not used"); }),
    });
    
    mockUseCurrentUser.mockReturnValue({
      data: { id: "user-1", email: "admin@test.com", role: UserRole.ADMIN },
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => { throw new Error("not used"); }),
    });
    
    mockUseServidores.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => { throw new Error("not used"); }),
    });
    
    mockUseMotoristas.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => { throw new Error("not used"); }),
    });
  });

  it("renders table with run row", () => {
    renderForRole(UserRole.ADMIN);
    expect(screen.getByTestId("run-row-run-1")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    mockUseRuns.mockReturnValue({
      data: { data: [], total: 0, page: 1, limit: 25, totalPages: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(async () => { throw new Error("not used"); }),
    });
    renderForRole(UserRole.ADMIN);
    expect(screen.getByTestId("runs-empty")).toBeInTheDocument();
  });

  it("renders error state on API failure", () => {
    const refetch = vi.fn(async () => { throw new Error("retry"); });
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
