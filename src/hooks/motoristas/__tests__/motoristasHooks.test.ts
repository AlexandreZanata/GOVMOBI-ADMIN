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

import { StatusOperacional } from "@/models";

import { useMotoristas } from "@/hooks/motoristas/useMotoristas";
import { useCreateMotorista } from "@/hooks/motoristas/useCreateMotorista";
import { useUpdateMotorista } from "@/hooks/motoristas/useUpdateMotorista";
import { useUpdateMotoristaStatus } from "@/hooks/motoristas/useUpdateMotoristaStatus";
import { useDesativarMotorista } from "@/hooks/motoristas/useDesativarMotorista";
import { useReativarMotorista } from "@/hooks/motoristas/useReativarMotorista";
import { motoristasHandlers } from "@/msw/motoristasHandlers";
import { mockMotoristas, makeEnvelope } from "@/test/fixtures/motoristas";
import { renderWithProviders } from "@/test/renderWithProviders";

// ── Mock sonner ──────────────────────────────────────────────────────────────
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (msg: string) => toastSuccess(msg),
    error: (msg: string) => toastError(msg),
  },
}));

// ── Mock react-i18next ───────────────────────────────────────────────────────
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

const server = setupServer(...motoristasHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  toastSuccess.mockClear();
  toastError.mockClear();
});
afterAll(() => server.close());

// ── useMotoristas ────────────────────────────────────────────────────────────
describe("useMotoristas", () => {
  it("returns the unwrapped motorista array on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useMotoristas(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.data).toHaveLength(mockMotoristas.length);
    expect(result.current.data?.[0]).toMatchObject({
      id: "motorista-001",
      cnhCategoria: "D",
      statusOperacional: StatusOperacional.DISPONIVEL,
    });
  });

  it("exposes loading state before query resolves", async () => {
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

  it("data items do not contain envelope fields", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useMotoristas(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const first = result.current.data?.[0] as unknown as Record<string, unknown>;
    expect(first["success"]).toBeUndefined();
    expect(first["timestamp"]).toBeUndefined();
  });
});

// ── useCreateMotorista ───────────────────────────────────────────────────────
describe("useCreateMotorista", () => {
  it("calls toast.success on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateMotorista(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        servidorId: "servidor-099",
        municipioId: "f0928929-373e-4614-9273-df3092039402",
        cnhNumero: "55566677788",
        cnhCategoria: "B",
      });
    });

    expect(toastSuccess).toHaveBeenCalledWith("motoristas:toast.created");
    expect(toastError).not.toHaveBeenCalled();
  });

  it("calls toast.error with duplicateCnh key on 409", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateMotorista(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({
          servidorId: "servidor-099",
          municipioId: "f0928929-373e-4614-9273-df3092039402",
          cnhNumero: "DUPLICATE_TEST",
          cnhCategoria: "B",
        })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("motoristas:toast.duplicateCnh");
  });

  it("calls toast.error with serverError key on 500", async () => {
    server.use(
      http.post(`${BASE_URL}/frota/motoristas`, () =>
        HttpResponse.json({ code: "SERVER_ERROR" }, { status: 500 })
      )
    );

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateMotorista(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({
          servidorId: "servidor-099",
          municipioId: "f0928929-373e-4614-9273-df3092039402",
          cnhNumero: "00000000000",
          cnhCategoria: "B",
        })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("common:toast.serverError");
  });

  it("returns the created motorista with ativo: true", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateMotorista(), { wrapper });

    let created;
    await act(async () => {
      created = await result.current.mutateAsync({
        servidorId: "servidor-099",
        municipioId: "f0928929-373e-4614-9273-df3092039402",
        cnhNumero: "44455566677",
        cnhCategoria: "D",
      });
    });

    expect(created).toMatchObject({ ativo: true, statusOperacional: StatusOperacional.DISPONIVEL });
  });
});

// ── useUpdateMotorista ───────────────────────────────────────────────────────
describe("useUpdateMotorista", () => {
  it("calls toast.success on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useUpdateMotorista(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: "motorista-001",
        cnhNumero: "99988877766",
        cnhCategoria: "E",
      });
    });

    expect(toastSuccess).toHaveBeenCalledWith("motoristas:toast.updated");
  });

  it("calls toast.error with notFound key on 404", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useUpdateMotorista(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "not-found", cnhNumero: "00000000000" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("motoristas:toast.notFound");
  });

  it("calls toast.error with duplicateCnh key on 409", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useUpdateMotorista(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "motorista-001", cnhNumero: "DUPLICATE_TEST" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("motoristas:toast.duplicateCnh");
  });

  it("invalidates list and detail queries on success", async () => {
    const { wrapper, queryClient } = renderWithProviders();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateMotorista(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: "motorista-001",
        cnhCategoria: "AB",
      });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["motoristas", "list"] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ["motoristas", "detail", "motorista-001"],
        })
      );
    });
  });
});

// ── useUpdateMotoristaStatus ─────────────────────────────────────────────────
describe("useUpdateMotoristaStatus", () => {
  it("calls toast.success on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useUpdateMotoristaStatus(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: "motorista-001",
        statusOperacional: StatusOperacional.EM_CORRIDA,
      });
    });

    expect(toastSuccess).toHaveBeenCalledWith("motoristas:toast.statusUpdated");
  });

  it("calls toast.error with notFound key on 404", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useUpdateMotoristaStatus(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "not-found", statusOperacional: StatusOperacional.DISPONIVEL })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("motoristas:toast.notFound");
  });
});

// ── useDesativarMotorista ────────────────────────────────────────────────────
describe("useDesativarMotorista", () => {
  it("calls toast.success on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useDesativarMotorista(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "motorista-001" });
    });

    expect(toastSuccess).toHaveBeenCalledWith("motoristas:toast.desativado");
  });

  it("calls toast.error with notFound key on 404", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useDesativarMotorista(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "not-found" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("motoristas:toast.notFound");
  });

  it("returns motorista with ativo: false on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useDesativarMotorista(), { wrapper });

    let desativado;
    await act(async () => {
      desativado = await result.current.mutateAsync({ id: "motorista-001" });
    });

    expect(desativado).toMatchObject({ ativo: false });
  });
});

// ── useReativarMotorista ─────────────────────────────────────────────────────
describe("useReativarMotorista", () => {
  it("calls toast.success on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useReativarMotorista(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "motorista-003" });
    });

    expect(toastSuccess).toHaveBeenCalledWith("motoristas:toast.reativado");
  });

  it("calls toast.error with notFound key on 404", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useReativarMotorista(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ id: "not-found" })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("motoristas:toast.notFound");
  });

  it("returns the reactivated motorista with ativo: true and deletedAt: null", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useReativarMotorista(), { wrapper });

    let reativado;
    await act(async () => {
      reativado = await result.current.mutateAsync({ id: "motorista-003" });
    });

    expect(reativado).toMatchObject({ ativo: true, deletedAt: null });
  });

  it("invalidates the list query on success", async () => {
    const { wrapper, queryClient } = renderWithProviders();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useReativarMotorista(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "motorista-003" });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["motoristas", "list"] })
      );
    });
  });
});
