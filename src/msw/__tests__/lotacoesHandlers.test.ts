import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";

import { lotacoesHandlers } from "@/msw/lotacoesHandlers";
import { mockLotacoes } from "@/test/fixtures/lotacoes";
import type { Lotacao } from "@/models/Lotacao";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

const server = setupServer(...lotacoesHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/** Typed API envelope helper. */
interface Envelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

describe("lotacoesHandlers", () => {
  // ── GET /lotacoes ──────────────────────────────────────────────────────────
  describe("GET /lotacoes", () => {
    it("returns 200 with enveloped lotacao list", async () => {
      const response = await fetch(`${BASE_URL}/lotacoes`);
      const body = (await response.json()) as Envelope<Lotacao[]>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(mockLotacoes.length);
      expect(typeof body.timestamp).toBe("string");
    });

    it("includes expected fixture names in the list", async () => {
      const response = await fetch(`${BASE_URL}/lotacoes`);
      const body = (await response.json()) as Envelope<Lotacao[]>;
      const names = body.data.map((l) => l.nome);

      expect(names).toContain("Secretaria de Fazenda");
      expect(names).toContain("Secretaria de Planejamento");
      expect(names).toContain("Controladoria Geral do Município");
    });
  });

  // ── POST /lotacoes ─────────────────────────────────────────────────────────
  describe("POST /lotacoes", () => {
    it("returns 201 with the created lotacao", async () => {
      const response = await fetch(`${BASE_URL}/lotacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "Nova Lotação" }),
      });
      const body = (await response.json()) as Envelope<Lotacao>;

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.nome).toBe("Nova Lotação");
      expect(body.data.ativo).toBe(true);
      expect(body.data.deletedAt).toBeNull();
      expect(typeof body.data.id).toBe("string");
    });

    it("returns 409 when nome is DUPLICATE_TEST", async () => {
      const response = await fetch(`${BASE_URL}/lotacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "DUPLICATE_TEST" }),
      });
      const body = (await response.json()) as { code: string };

      expect(response.status).toBe(409);
      expect(body.code).toBe("CONFLICT");
    });
  });

  // ── GET /lotacoes/:id ──────────────────────────────────────────────────────
  describe("GET /lotacoes/:id", () => {
    it("returns 200 with the matching lotacao", async () => {
      const response = await fetch(`${BASE_URL}/lotacoes/lotacao-001`);
      const body = (await response.json()) as Envelope<Lotacao>;

      expect(response.status).toBe(200);
      expect(body.data.id).toBe("lotacao-001");
      expect(body.data.nome).toBe("Secretaria de Fazenda");
    });

    it("returns 404 for id 'not-found'", async () => {
      const response = await fetch(`${BASE_URL}/lotacoes/not-found`);
      const body = (await response.json()) as { code: string };

      expect(response.status).toBe(404);
      expect(body.code).toBe("NOT_FOUND");
    });
  });

  // ── PUT /lotacoes/:id ──────────────────────────────────────────────────────
  describe("PUT /lotacoes/:id", () => {
    it("returns 200 with the updated lotacao", async () => {
      const response = await fetch(`${BASE_URL}/lotacoes/lotacao-001`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "Secretaria Atualizada" }),
      });
      const body = (await response.json()) as Envelope<Lotacao>;

      expect(response.status).toBe(200);
      expect(body.data.nome).toBe("Secretaria Atualizada");
      expect(body.data.id).toBe("lotacao-001");
    });

    it("returns 404 for id 'not-found'", async () => {
      const response = await fetch(`${BASE_URL}/lotacoes/not-found`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "X" }),
      });

      expect(response.status).toBe(404);
    });

    it("returns 409 when nome is DUPLICATE_TEST", async () => {
      const response = await fetch(`${BASE_URL}/lotacoes/lotacao-001`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "DUPLICATE_TEST" }),
      });

      expect(response.status).toBe(409);
    });
  });

  // ── DELETE /lotacoes/:id ───────────────────────────────────────────────────
  describe("DELETE /lotacoes/:id", () => {
    it("returns 200 with success envelope", async () => {
      const response = await fetch(`${BASE_URL}/lotacoes/lotacao-001`, {
        method: "DELETE",
      });
      const body = (await response.json()) as { success: boolean; timestamp: string };

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(typeof body.timestamp).toBe("string");
    });

    it("returns 404 for id 'not-found'", async () => {
      const response = await fetch(`${BASE_URL}/lotacoes/not-found`, {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
    });
  });

  // ── PATCH /lotacoes/:id/reativar ───────────────────────────────────────────
  describe("PATCH /lotacoes/:id/reativar", () => {
    it("returns 200 with reactivated lotacao (ativo: true, deletedAt: null)", async () => {
      const response = await fetch(
        `${BASE_URL}/lotacoes/lotacao-004/reativar`,
        { method: "PATCH" }
      );
      const body = (await response.json()) as Envelope<Lotacao>;

      expect(response.status).toBe(200);
      expect(body.data.ativo).toBe(true);
      expect(body.data.deletedAt).toBeNull();
      expect(body.data.id).toBe("lotacao-004");
    });

    it("returns 404 for id 'not-found'", async () => {
      const response = await fetch(
        `${BASE_URL}/lotacoes/not-found/reativar`,
        { method: "PATCH" }
      );

      expect(response.status).toBe(404);
    });
  });
});
