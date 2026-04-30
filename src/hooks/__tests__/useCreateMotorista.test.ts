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

import { useCreateMotorista } from "@/hooks/motoristas/useCreateMotorista";
import { motoristasHandlers } from "@/msw/motoristasHandlers";
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

describe("useCreateMotorista", () => {
  it("returns the created motorista with ativo: true on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateMotorista(), { wrapper });

    let created;
    await act(async () => {
      created = await result.current.mutateAsync({
        servidorId: "servidor-099",
        municipioId: "f0928929-373e-4614-9273-df3092039402",
        cnhNumero: "55566677788",
        cnhCategoria: "B",
      });
    });

    expect(created).toMatchObject({
      ativo: true,
      statusOperacional: "DISPONIVEL",
      cnhNumero: "55566677788",
      cnhCategoria: "B",
    });
  });

  it("calls toast.success with created key on success", async () => {
    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateMotorista(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        servidorId: "servidor-099",
        municipioId: "f0928929-373e-4614-9273-df3092039402",
        cnhNumero: "44455566677",
        cnhCategoria: "D",
      });
    });

    expect(toastSuccess).toHaveBeenCalledWith("motoristas:toast.created");
    expect(toastError).not.toHaveBeenCalled();
  });

  it("invalidates the motorista list query on success", async () => {
    const { wrapper, queryClient } = renderWithProviders();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateMotorista(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        servidorId: "servidor-099",
        municipioId: "f0928929-373e-4614-9273-df3092039402",
        cnhNumero: "33344455566",
        cnhCategoria: "C",
      });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["motoristas", "list"] })
      );
    });
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
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("calls toast.error with invalidData key on 400", async () => {
    server.use(
      http.post(`${BASE_URL}/frota/motoristas`, () =>
        HttpResponse.json(
          { code: "VALIDATION_ERROR", message: "Invalid CNH format" },
          { status: 400 }
        )
      )
    );

    const { wrapper } = renderWithProviders();
    const { result } = renderHook(() => useCreateMotorista(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({
          servidorId: "servidor-099",
        municipioId: "f0928929-373e-4614-9273-df3092039402",
          cnhNumero: "INVALID",
          cnhCategoria: "B",
        })
        .catch(() => undefined);
    });

    expect(toastError).toHaveBeenCalledWith("motoristas:toast.invalidData");
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

  it("does not invalidate the list on error", async () => {
    server.use(
      http.post(`${BASE_URL}/frota/motoristas`, () =>
        HttpResponse.json({ code: "CONFLICT" }, { status: 409 })
      )
    );

    const { wrapper, queryClient } = renderWithProviders();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

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

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
