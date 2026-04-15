import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { lotacoesFacade } from "@/facades/lotacoesFacade";
import { useLotacoes } from "@/hooks/useLotacoes";
import type { Lotacao } from "@/models/Lotacao";
import { renderWithProviders } from "@/test/renderWithProviders";

vi.mock("@/facades/lotacoesFacade", () => ({
  lotacoesFacade: {
    listLotacoes: vi.fn(),
  },
}));

const mockListLotacoes = vi.mocked(lotacoesFacade.listLotacoes);

const lotacoesFixture: Lotacao[] = [
  {
    id: "lotacao-001",
    nome: "Secretaria de Mobilidade",
    ativo: true,
    createdAt: "2026-04-15T14:00:00.000Z",
    updatedAt: "2026-04-15T14:00:00.000Z",
    deletedAt: null,
  },
  {
    id: "lotacao-002",
    nome: "Centro de Operacoes",
    ativo: false,
    createdAt: "2026-04-10T10:00:00.000Z",
    updatedAt: "2026-04-14T08:00:00.000Z",
    deletedAt: "2026-04-14T08:00:00.000Z",
  },
];

describe("useLotacoes", () => {
  beforeEach(() => {
    mockListLotacoes.mockReset();
  });

  it("returns lotacoes from the facade", async () => {
    mockListLotacoes.mockResolvedValue(lotacoesFixture);

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useLotacoes(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual(lotacoesFixture);
    expect(mockListLotacoes).toHaveBeenCalledOnce();
  });

  it("returns error state when facade throws", async () => {
    mockListLotacoes.mockRejectedValue(new Error("request failed"));

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useLotacoes(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
