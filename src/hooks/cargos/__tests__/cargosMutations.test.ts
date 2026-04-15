import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { useCreateCargo } from "@/hooks/cargos/useCreateCargo";
import { useUpdateCargo } from "@/hooks/cargos/useUpdateCargo";
import { useDeleteCargo } from "@/hooks/cargos/useDeleteCargo";
import { useReativarCargo } from "@/hooks/cargos/useReativarCargo";
import { cargosHandlers } from "@/msw/cargosHandlers";
import { renderWithProviders } from "@/test/renderWithProviders";

// ── Mock sonner so toast calls are inspectable ──────────────────────────────
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (msg: string) => toastSuccess(msg),
    error: (msg: string) => toastError(msg),
  },
}));

// ── Mock react-i18next — returns "namespace:key" ────────────────────────────
vi.mock("react-i18next", () => ({
  useTranslation: (ns?: string | string[]) => ({
    t: (key: string) => {
      // If the key already contains ":", it's a cross-namespace reference — return as-is
      if (key.includes(":")) return key;
      const namespace = Array.isArray(ns) ? ns[0] : ns;
      return namespace ? `${namespace}:${key}` : key;
    },
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

const server = setupServer(...cargosHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  toastSuccess.mockClear();
  toastError.mockClear();
});
afterAll(() => server.close());

// ── useCreateCargo ───────────────────────────────────────────────────────────
describe("useCreateCargo", () => {
  it("calls toast.success with the created key on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateCargo(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ nome: "Novo Cargo", pesoPrioridade: 55 });
    });

    expect(toastSuccess).toHaveBeenCalledWith("cargos:toast.created");
    expect(toastError).not.toHaveBeenCalled();
  });

  it("calls toast.error with duplicateName key on 409", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateCargo(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ nome: "DUPLICATE_TEST", pesoPrioridade: 50 })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("cargos:toast.duplicateName");
  });

  it("calls toast.error with serverError key on 500", async () => {
    server.use(
      http.post(`${BASE_URL}/cargos`, () =>
        HttpResponse.json({ code: "SERVER_ERROR" }, { status: 500 })
      )
    );

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateCargo(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ nome: "Any", pesoPrioridade: 10 })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("common:toast.serverError");
  });

  it("returns the created cargo on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateCargo(), { wrapper });

    let created;
    await act(async () => {
      created = await result.current.mutateAsync({
        nome: "Cargo Teste",
        pesoPrioridade: 70,
      });
    });

    expect(created).toMatchObject({ nome: "Cargo Teste", ativo: true });
  });
});

// ── useUpdateCargo ───────────────────────────────────────────────────────────
describe("useUpdateCargo", () => {
  it("calls toast.success with updated key on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useUpdateCargo(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: "cargo-001",
        nome: "Auditor Senior",
        pesoPrioridade: 90,
      });
    });

    expect(toastSuccess).toHaveBeenCalledWith("cargos:toast.updated");
  });

  it("calls toast.error with notFound key on 404", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useUpdateCargo(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "not-found", nome: "X", pesoPrioridade: 1 })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("cargos:toast.notFound");
  });

  it("calls toast.error with duplicateName key on 409", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useUpdateCargo(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "cargo-001", nome: "DUPLICATE_TEST", pesoPrioridade: 80 })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("cargos:toast.duplicateName");
  });
});

// ── useDeleteCargo ───────────────────────────────────────────────────────────
describe("useDeleteCargo", () => {
  it("calls toast.success with deleted key on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useDeleteCargo(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "cargo-001" });
    });

    expect(toastSuccess).toHaveBeenCalledWith("cargos:toast.deleted");
  });

  it("calls toast.error with notFound key on 404", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useDeleteCargo(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "not-found" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("cargos:toast.notFound");
  });
});

// ── useReativarCargo ─────────────────────────────────────────────────────────
describe("useReativarCargo", () => {
  it("calls toast.success with reativado key on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useReativarCargo(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "cargo-003" });
    });

    expect(toastSuccess).toHaveBeenCalledWith("cargos:toast.reativado");
  });

  it("calls toast.error with notFound key on 404", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useReativarCargo(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "not-found" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("cargos:toast.notFound");
  });

  it("returns the reactivated cargo with ativo: true", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useReativarCargo(), { wrapper });

    let reativado;
    await act(async () => {
      reativado = await result.current.mutateAsync({ id: "cargo-003" });
    });

    expect(reativado).toMatchObject({ ativo: true, deletedAt: null });
  });

  it("invalidates the list query on success", async () => {
    const { wrapper, queryClient } = renderWithProviders();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useReativarCargo(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "cargo-003" });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["cargos", "list"] })
      );
    });
  });
});
