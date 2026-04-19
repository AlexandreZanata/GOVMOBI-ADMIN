import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";

import { motoristasFacade } from "@/facades/motoristasFacade";
import { motoristasHandlers } from "@/msw/motoristasHandlers";
import { mockMotoristas } from "@/test/fixtures/motoristas";
import { ApiError } from "@/types";

const server = setupServer(...motoristasHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("motoristasFacade", () => {
  describe("listMotoristas", () => {
    it("returns the full motorista list unwrapped from the envelope", async () => {
      const result = await motoristasFacade.listMotoristas();

      expect(result).toHaveLength(mockMotoristas.length);
      expect(result[0]).toMatchObject({
        id: "motorista-001",
        cnhNumero: "12345678901",
        cnhCategoria: "D",
        statusOperacional: "DISPONIVEL",
        ativo: true,
      });
    });

    it("returns plain Motorista objects — no success/timestamp fields", async () => {
      const result = await motoristasFacade.listMotoristas();
      const first = result[0] as unknown as Record<string, unknown>;

      expect(first["success"]).toBeUndefined();
      expect(first["timestamp"]).toBeUndefined();
    });
  });

  describe("getMotoristaById", () => {
    it("returns the matching motorista", async () => {
      const result = await motoristasFacade.getMotoristaById({
        id: "motorista-001",
      });

      expect(result.id).toBe("motorista-001");
      expect(result.cnhCategoria).toBe("D");
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        motoristasFacade.getMotoristaById({ id: "not-found" })
      ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
    });
  });

  describe("createMotorista", () => {
    it("returns the created motorista with ativo: true and DISPONIVEL status", async () => {
      const result = await motoristasFacade.createMotorista({
        servidorId: "servidor-099",
        municipioId: "f0928929-373e-4614-9273-df3092039402",
        cnhNumero: "55566677788",
        cnhCategoria: "B",
      });

      expect(result.cnhNumero).toBe("55566677788");
      expect(result.cnhCategoria).toBe("B");
      expect(result.ativo).toBe(true);
      expect(result.statusOperacional).toBe("DISPONIVEL");
      expect(result.deletedAt).toBeNull();
    });

    it("throws ApiError 409 when cnhNumero is already in use", async () => {
      await expect(
        motoristasFacade.createMotorista({
          servidorId: "servidor-099",
        municipioId: "f0928929-373e-4614-9273-df3092039402",
          cnhNumero: "DUPLICATE_TEST",
          cnhCategoria: "B",
        })
      ).rejects.toMatchObject({ status: 409, code: "CONFLICT" });
    });

    it("throws an ApiError instance (not a plain Error)", async () => {
      const error = await motoristasFacade
        .createMotorista({
          servidorId: "servidor-099",
        municipioId: "f0928929-373e-4614-9273-df3092039402",
          cnhNumero: "DUPLICATE_TEST",
          cnhCategoria: "B",
        })
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe("updateMotorista", () => {
    it("returns the updated motorista with new CNH values", async () => {
      const result = await motoristasFacade.updateMotorista("motorista-001", {
        cnhNumero: "99988877766",
        cnhCategoria: "E",
      });

      expect(result.cnhNumero).toBe("99988877766");
      expect(result.cnhCategoria).toBe("E");
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        motoristasFacade.updateMotorista("not-found", { cnhNumero: "00000000000" })
      ).rejects.toMatchObject({ status: 404 });
    });

    it("throws ApiError 409 when new cnhNumero is already in use", async () => {
      await expect(
        motoristasFacade.updateMotorista("motorista-001", {
          cnhNumero: "DUPLICATE_TEST",
        })
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe("updateMotoristaStatus", () => {
    it("returns the motorista with the updated status", async () => {
      const result = await motoristasFacade.updateMotoristaStatus(
        "motorista-001",
        { statusOperacional: "EM_SERVICO" }
      );

      expect(result.statusOperacional).toBe("EM_SERVICO");
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        motoristasFacade.updateMotoristaStatus("not-found", {
          statusOperacional: "DISPONIVEL",
        })
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("desativarMotorista", () => {
    it("returns the motorista with ativo: false", async () => {
      const result = await motoristasFacade.desativarMotorista("motorista-001");

      expect(result.ativo).toBe(false);
      expect(result.deletedAt).not.toBeNull();
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        motoristasFacade.desativarMotorista("not-found")
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("reativarMotorista", () => {
    it("returns the reactivated motorista with ativo: true", async () => {
      const result = await motoristasFacade.reativarMotorista("motorista-003");

      expect(result.ativo).toBe(true);
      expect(result.deletedAt).toBeNull();
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        motoristasFacade.reativarMotorista("not-found")
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});
