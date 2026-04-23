import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";

import { Papel } from "@/models";

import { servidoresFacade } from "@/facades/servidoresFacade";
import { servidoresHandlers } from "@/msw/servidoresHandlers";
import { mockServidores } from "@/test/fixtures/servidores";
import { ApiError } from "@/types";

const server = setupServer(...servidoresHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("servidoresFacade", () => {
  describe("listServidores", () => {
    it("returns the full servidor list unwrapped from the envelope", async () => {
      const result = await servidoresFacade.listServidores();
      expect(result).toHaveLength(mockServidores.length);
      expect(result[0]).toMatchObject({ id: "srv-001", nome: "João Vitor Flávio Pinto" });
    });

    it("returns plain Servidor objects — no envelope fields", async () => {
      const result = await servidoresFacade.listServidores();
      const first = result[0] as unknown as Record<string, unknown>;
      expect(first["success"]).toBeUndefined();
      expect(first["timestamp"]).toBeUndefined();
    });
  });

  describe("getServidorById", () => {
    it("returns the matching servidor", async () => {
      const result = await servidoresFacade.getServidorById({ id: "srv-001" });
      expect(result.id).toBe("srv-001");
      expect(result.cpf).toBe("04673024133");
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        servidoresFacade.getServidorById({ id: "not-found" })
      ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
    });
  });

  describe("createServidor", () => {
    it("returns the created servidor with ativo: true", async () => {
      const result = await servidoresFacade.createServidor({
        nome: "Novo Servidor",
        cpf: "12312312312",
        email: "novo@gov.br",
        telefone: "11999998888",
        cargoId: "cargo-001",
        lotacaoId: "lotacao-001",
        papeis: [Papel.USUARIO],
        senha: "GovMob@2026",
      });
      expect(result.nome).toBe("Novo Servidor");
      expect(result.ativo).toBe(true);
      expect(result.deletedAt).toBeNull();
    });

    it("throws ApiError 409 on duplicate CPF", async () => {
      await expect(
        servidoresFacade.createServidor({
          nome: "Dup",
          cpf: "00000000000",
          email: "unique@gov.br",
          telefone: "11999998888",
          cargoId: "cargo-001",
          lotacaoId: "lotacao-001",
          papeis: [Papel.USUARIO],
        senha: "GovMob@2026",
        })
      ).rejects.toMatchObject({ status: 409, code: "CONFLICT" });
    });

    it("throws ApiError 404 when cargoId is not-found", async () => {
      await expect(
        servidoresFacade.createServidor({
          nome: "Test",
          cpf: "99988877766",
          email: "test@gov.br",
          telefone: "11999998888",
          cargoId: "not-found",
          lotacaoId: "lotacao-001",
          papeis: [Papel.USUARIO],
        senha: "GovMob@2026",
        })
      ).rejects.toMatchObject({ status: 404 });
    });

    it("throws an ApiError instance (not a plain Error)", async () => {
      const error = await servidoresFacade
        .createServidor({
          nome: "Dup",
          cpf: "00000000000",
          email: "x@gov.br",
          telefone: "11999998888",
          cargoId: "cargo-001",
          lotacaoId: "lotacao-001",
          papeis: [Papel.USUARIO],
        senha: "GovMob@2026",
        })
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe("updateServidor", () => {
    it("returns the updated servidor", async () => {
      const result = await servidoresFacade.updateServidor("srv-001", {
        nome: "João Atualizado",
      });
      expect(result.nome).toBe("João Atualizado");
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        servidoresFacade.updateServidor("not-found", { nome: "X" })
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("deleteServidor", () => {
    it("resolves without a value on success", async () => {
      const result = await servidoresFacade.deleteServidor("srv-001");
      expect(result).toBeUndefined();
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        servidoresFacade.deleteServidor("not-found")
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("reativarServidor", () => {
    it("returns the reactivated servidor with ativo: true", async () => {
      const result = await servidoresFacade.reativarServidor("srv-003");
      expect(result.ativo).toBe(true);
      expect(result.deletedAt).toBeNull();
    });

    it("throws ApiError 404 for unknown id", async () => {
      await expect(
        servidoresFacade.reativarServidor("not-found")
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});
