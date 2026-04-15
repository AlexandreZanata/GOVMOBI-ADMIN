import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";

import { cargosFacade } from "@/facades/cargosFacade";
import { cargosHandlers } from "@/msw/cargosHandlers";
import { cargosFixture } from "@/test/fixtures/cargos";
import { ApiError } from "@/types";

const server = setupServer(...cargosHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("cargosFacade", () => {
  describe("listCargos", () => {
    it("returns the full cargo list unwrapped from the envelope", async () => {
      const result = await cargosFacade.listCargos();

      expect(result).toHaveLength(cargosFixture.length);
      expect(result[0]).toMatchObject({
        id: "cargo-001",
        nome: "Auditor Fiscal",
        pesoPrioridade: 80,
        ativo: true,
      });
    });

    it("returns plain Cargo objects — no success/timestamp fields", async () => {
      const result = await cargosFacade.listCargos();
      const first = result[0] as unknown as Record<string, unknown>;

      expect(first["success"]).toBeUndefined();
      expect(first["timestamp"]).toBeUndefined();
    });
  });

  describe("getCargoById", () => {
    it("returns the matching cargo", async () => {
      const result = await cargosFacade.getCargoById({ id: "cargo-001" });

      expect(result.id).toBe("cargo-001");
      expect(result.nome).toBe("Auditor Fiscal");
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        cargosFacade.getCargoById({ id: "not-found" })
      ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
    });
  });

  describe("createCargo", () => {
    it("returns the created cargo with ativo: true", async () => {
      const result = await cargosFacade.createCargo({
        nome: "Novo Cargo",
        pesoPrioridade: 55,
      });

      expect(result.nome).toBe("Novo Cargo");
      expect(result.pesoPrioridade).toBe(55);
      expect(result.ativo).toBe(true);
      expect(result.deletedAt).toBeNull();
    });

    it("throws ApiError 409 when nome is already in use", async () => {
      await expect(
        cargosFacade.createCargo({ nome: "DUPLICATE_TEST", pesoPrioridade: 50 })
      ).rejects.toMatchObject({ status: 409, code: "CONFLICT" });
    });

    it("throws an ApiError instance (not a plain Error)", async () => {
      const error = await cargosFacade
        .createCargo({ nome: "DUPLICATE_TEST", pesoPrioridade: 50 })
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe("updateCargo", () => {
    it("returns the updated cargo with new values", async () => {
      const result = await cargosFacade.updateCargo("cargo-001", {
        nome: "Auditor Fiscal Senior",
        pesoPrioridade: 90,
      });

      expect(result.nome).toBe("Auditor Fiscal Senior");
      expect(result.pesoPrioridade).toBe(90);
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        cargosFacade.updateCargo("not-found", { nome: "X", pesoPrioridade: 1 })
      ).rejects.toMatchObject({ status: 404 });
    });

    it("throws ApiError 409 when new nome is already in use", async () => {
      await expect(
        cargosFacade.updateCargo("cargo-001", {
          nome: "DUPLICATE_TEST",
          pesoPrioridade: 80,
        })
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe("deleteCargo", () => {
    it("resolves without a value on success", async () => {
      const result = await cargosFacade.deleteCargo("cargo-001");
      expect(result).toBeUndefined();
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        cargosFacade.deleteCargo("not-found")
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("reativarCargo", () => {
    it("returns the reactivated cargo with ativo: true", async () => {
      const result = await cargosFacade.reativarCargo("cargo-003");

      expect(result.ativo).toBe(true);
      expect(result.deletedAt).toBeNull();
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        cargosFacade.reativarCargo("not-found")
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});
