import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeAll, afterAll, afterEach } from "vitest";

import { useRuns } from "@/hooks/runs/useRuns";
import { renderWithProviders } from "@/test/renderWithProviders";
import { RunStatus, type Run } from "@/models";
import type { CorridasPage } from "@/models/Run";

const RUNS_API_URL = "http://localhost:3000/api/proxy/corridas";

const runFixture: Run = {
  id: "run-1",
  status: RunStatus.SOLICITADA,
  passageiroId: "passageiro-1",
  motoristaId: null,
  veiculoId: null,
  origem: { lat: -12.5, lng: -55.7 },
  destino: { lat: -12.6, lng: -55.8 },
  distanciaMetros: null,
  duracaoSegundos: null,
  createdAt: "2026-04-15T08:00:00.000Z",
  updatedAt: "2026-04-15T08:00:00.000Z",
};

const pageFixture: CorridasPage = {
  data: [runFixture],
  total: 1,
  page: 1,
  limit: 25,
  totalPages: 1,
};

const server = setupServer();

beforeAll(() => { server.listen(); });
afterEach(() => { server.resetHandlers(); });
afterAll(() => { server.close(); });

describe("useRuns", () => {
  it("returns data on successful request", async () => {
    server.use(
      http.get(RUNS_API_URL, () => HttpResponse.json(pageFixture, { status: 200 }))
    );
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useRuns(), { wrapper });
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.isError).toBe(false);
    expect(result.current.data?.data).toEqual([runFixture]);
  });

  it("returns error state on 500 response", async () => {
    server.use(
      http.get(RUNS_API_URL, () => HttpResponse.json({ message: "SERVER_ERROR" }, { status: 500 }))
    );
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useRuns(), { wrapper });
    await waitFor(() => { expect(result.current.isError).toBe(true); });
    expect(result.current.data).toBeUndefined();
  });
});
