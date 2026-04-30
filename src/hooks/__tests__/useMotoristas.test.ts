import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { renderHook, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { useMotoristas } from "@/hooks/motoristas/useMotoristas";
import { motoristasHandlers } from "@/msw/motoristasHandlers";
import { mockMotoristas, makeEnvelope } from "@/test/fixtures/motoristas";
import { renderWithProviders } from "@/test/renderWithProviders";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const server = setupServer(...motoristasHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useMotoristas", () => {
  it("exposes isLoading=true before the query resolves", async () => {
    server.use(
      http.get(`${BASE_URL}/frota/motoristas`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json(makeEnvelope(mockMotoristas));
      })
    );

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useMotoristas(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("returns the unwrapped motorista array on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useMotoristas(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.data).toHaveLength(mockMotoristas.length);
    expect(result.current.data?.[0]).toMatchObject({
      id: "motorista-001",
      cnhNumero: "12345678901",
      cnhCategoria: "D",
      statusOperacional: "DISPONIVEL",
      ativo: true,
    });
  });

  it("data items do not contain envelope fields (success, timestamp)", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useMotoristas(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const first = result.current.data?.[0] as unknown as Record<string, unknown>;
    expect(first["success"]).toBeUndefined();
    expect(first["timestamp"]).toBeUndefined();
  });

  it("returns isError=true on 500 response", async () => {
    server.use(
      http.get(`${BASE_URL}/frota/motoristas`, () =>
        HttpResponse.json({ code: "SERVER_ERROR" }, { status: 500 })
      )
    );

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useMotoristas(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("returns isError=true on 403 forbidden", async () => {
    server.use(
      http.get(`${BASE_URL}/frota/motoristas`, () =>
        HttpResponse.json({ code: "FORBIDDEN" }, { status: 403 })
      )
    );

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useMotoristas(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("exposes a refetch function", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useMotoristas(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(typeof result.current.refetch).toBe("function");
  });

  it("respects a custom staleTime parameter", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useMotoristas(120_000), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeDefined();
  });
});
