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

import { useCreateLotacao } from "@/hooks/lotacoes/useCreateLotacao";
import { useUpdateLotacao } from "@/hooks/lotacoes/useUpdateLotacao";
import { useDeleteLotacao } from "@/hooks/lotacoes/useDeleteLotacao";
import { useReativarLotacao } from "@/hooks/lotacoes/useReativarLotacao";
import { lotacoesHandlers } from "@/msw/lotacoesHandlers";
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
      if (key.includes(":")) return key;
      const namespace = Array.isArray(ns) ? ns[0] : ns;
      return namespace ? `${namespace}:${key}` : key;
    },
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const server = setupServer(...lotacoesHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  toastSuccess.mockClear();
  toastError.mockClear();
});
afterAll(() => server.close());

// ── useCreateLotacao ─────────────────────────────────────────────────────────
describe("useCreateLotacao", () => {
  it("calls toast.success with the created key on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateLotacao(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ nome: "Nova Lotação" });
    });

    expect(toastSuccess).toHaveBeenCalledWith("lotacoes:toast.created");
    expect(toastError).not.toHaveBeenCalled();
  });

  it("calls toast.error with duplicateName key on 409", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateLotacao(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ nome: "DUPLICATE_TEST" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("lotacoes:toast.duplicateName");
  });

  it("calls toast.error with serverError key on 500", async () => {
    server.use(
      http.post(`${BASE_URL}/lotacoes`, () =>
        HttpResponse.json({ code: "SERVER_ERROR" }, { status: 500 })
      )
    );

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateLotacao(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ nome: "Any" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("common:toast.serverError");
  });

  it("returns the created lotacao on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateLotacao(), { wrapper });

    let created;
    await act(async () => {
      created = await result.current.mutateAsync({ nome: "Lotação Teste" });
    });

    expect(created).toMatchObject({ nome: "Lotação Teste", ativo: true });
  });
});

// ── useUpdateLotacao ─────────────────────────────────────────────────────────
describe("useUpdateLotacao", () => {
  it("calls toast.success with updated key on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useUpdateLotacao(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: "lotacao-001",
        nome: "Secretaria Atualizada",
      });
    });

    expect(toastSuccess).toHaveBeenCalledWith("lotacoes:toast.updated");
  });

  it("calls toast.error with notFound key on 404", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useUpdateLotacao(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "not-found", nome: "X" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("lotacoes:toast.notFound");
  });

  it("calls toast.error with duplicateName key on 409", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useUpdateLotacao(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "lotacao-001", nome: "DUPLICATE_TEST" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("lotacoes:toast.duplicateName");
  });

  it("invalidates list and detail queries on success", async () => {
    const { wrapper, queryClient } = renderWithProviders();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateLotacao(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "lotacao-001", nome: "Updated" });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["lotacoes", "list"] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["lotacoes", "detail", "lotacao-001"] })
      );
    });
  });
});

// ── useDeleteLotacao ─────────────────────────────────────────────────────────
describe("useDeleteLotacao", () => {
  it("calls toast.success with deleted key on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useDeleteLotacao(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "lotacao-001" });
    });

    expect(toastSuccess).toHaveBeenCalledWith("lotacoes:toast.deleted");
  });

  it("calls toast.error with notFound key on 404", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useDeleteLotacao(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "not-found" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("lotacoes:toast.notFound");
  });

  it("invalidates the list query on success", async () => {
    const { wrapper, queryClient } = renderWithProviders();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteLotacao(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "lotacao-001" });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["lotacoes", "list"] })
      );
    });
  });
});

// ── useReativarLotacao ───────────────────────────────────────────────────────
describe("useReativarLotacao", () => {
  it("calls toast.success with reativado key on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useReativarLotacao(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "lotacao-003" });
    });

    expect(toastSuccess).toHaveBeenCalledWith("lotacoes:toast.reativado");
  });

  it("calls toast.error with notFound key on 404", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useReativarLotacao(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "not-found" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("lotacoes:toast.notFound");
  });

  it("returns the reactivated lotacao with ativo: true", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useReativarLotacao(), { wrapper });

    let reativado;
    await act(async () => {
      reativado = await result.current.mutateAsync({ id: "lotacao-003" });
    });

    expect(reativado).toMatchObject({ ativo: true, deletedAt: null });
  });

  it("invalidates the list query on success", async () => {
    const { wrapper, queryClient } = renderWithProviders();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useReativarLotacao(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "lotacao-003" });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["lotacoes", "list"] })
      );
    });
  });
});
