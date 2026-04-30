import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";

import { motoristasHandlers } from "@/msw/motoristasHandlers";
import { mockMotoristas } from "@/test/fixtures/motoristas";
import type { Motorista } from "@/models/Motorista";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const server = setupServer(...motoristasHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/** Typed API envelope helper. */
interface Envelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

describe("motoristasHandlers", () => {
  // ── GET /frota/motoristas ──────────────────────────────────────────────────
  describe("GET /frota/motoristas", () => {
    it("returns 200 with enveloped motorista list", async () => {
      const response = await fetch(`${BASE_URL}/frota/motoristas`);
      const body = (await response.json()) as Envelope<Motorista[]>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(mockMotoristas.length);
      expect(typeof body.timestamp).toBe("string");
    });

    it("includes expected fixture CNH numbers in the list", async () => {
      const response = await fetch(`${BASE_URL}/frota/motoristas`);
      const body = (await response.json()) as Envelope<Motorista[]>;
      const cnhs = body.data.map((m) => m.cnhNumero);

      expect(cnhs).toContain("12345678901");
      expect(cnhs).toContain("98765432100");
    });
  });

  // ── POST /frota/motoristas ─────────────────────────────────────────────────
  describe("POST /frota/motoristas", () => {
    it("returns 201 with the created motorista (ativo: true, DISPONIVEL)", async () => {
      const response = await fetch(`${BASE_URL}/frota/motoristas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servidorId: "servidor-099",
          cnhNumero: "55566677788",
          cnhCategoria: "B",
        }),
      });
      const body = (await response.json()) as Envelope<Motorista>;

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.cnhNumero).toBe("55566677788");
      expect(body.data.ativo).toBe(true);
      expect(body.data.statusOperacional).toBe("DISPONIVEL");
      expect(body.data.deletedAt).toBeNull();
      expect(typeof body.data.id).toBe("string");
    });

    it("returns 409 when cnhNumero is DUPLICATE_TEST", async () => {
      const response = await fetch(`${BASE_URL}/frota/motoristas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servidorId: "servidor-099",
          cnhNumero: "DUPLICATE_TEST",
          cnhCategoria: "B",
        }),
      });
      const body = (await response.json()) as { code: string };

      expect(response.status).toBe(409);
      expect(body.code).toBe("CONFLICT");
    });
  });

  // ── GET /frota/motoristas/:id ──────────────────────────────────────────────
  describe("GET /frota/motoristas/:id", () => {
    it("returns 200 with the matching motorista", async () => {
      const response = await fetch(`${BASE_URL}/frota/motoristas/motorista-001`);
      const body = (await response.json()) as Envelope<Motorista>;

      expect(response.status).toBe(200);
      expect(body.data.id).toBe("motorista-001");
      expect(body.data.cnhCategoria).toBe("D");
    });

    it("returns 404 for id 'not-found'", async () => {
      const response = await fetch(`${BASE_URL}/frota/motoristas/not-found`);
      const body = (await response.json()) as { code: string };

      expect(response.status).toBe(404);
      expect(body.code).toBe("NOT_FOUND");
    });
  });

  // ── PUT /frota/motoristas/:id ──────────────────────────────────────────────
  describe("PUT /frota/motoristas/:id", () => {
    it("returns 200 with the updated motorista", async () => {
      const response = await fetch(`${BASE_URL}/frota/motoristas/motorista-001`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnhNumero: "99988877766", cnhCategoria: "E" }),
      });
      const body = (await response.json()) as Envelope<Motorista>;

      expect(response.status).toBe(200);
      expect(body.data.cnhNumero).toBe("99988877766");
      expect(body.data.cnhCategoria).toBe("E");
      expect(body.data.id).toBe("motorista-001");
    });

    it("returns 404 for id 'not-found'", async () => {
      const response = await fetch(`${BASE_URL}/frota/motoristas/not-found`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnhNumero: "00000000000" }),
      });

      expect(response.status).toBe(404);
    });

    it("returns 409 when cnhNumero is DUPLICATE_TEST", async () => {
      const response = await fetch(`${BASE_URL}/frota/motoristas/motorista-001`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnhNumero: "DUPLICATE_TEST" }),
      });

      expect(response.status).toBe(409);
    });
  });

  // ── PATCH /frota/motoristas/:id/status ────────────────────────────────────
  describe("PATCH /frota/motoristas/:id/status", () => {
    it("returns 200 with the updated operational status", async () => {
      const response = await fetch(
        `${BASE_URL}/frota/motoristas/motorista-001/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statusOperacional: "EM_SERVICO" }),
        }
      );
      const body = (await response.json()) as Envelope<Motorista>;

      expect(response.status).toBe(200);
      expect(body.data.statusOperacional).toBe("EM_SERVICO");
      expect(body.data.id).toBe("motorista-001");
    });

    it("returns 404 for id 'not-found'", async () => {
      const response = await fetch(
        `${BASE_URL}/frota/motoristas/not-found/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statusOperacional: "DISPONIVEL" }),
        }
      );

      expect(response.status).toBe(404);
    });
  });

  // ── PATCH /frota/motoristas/:id/desativar ─────────────────────────────────
  describe("PATCH /frota/motoristas/:id/desativar", () => {
    it("returns 200 with ativo: false and a deletedAt timestamp", async () => {
      const response = await fetch(
        `${BASE_URL}/frota/motoristas/motorista-001/desativar`,
        { method: "PATCH" }
      );
      const body = (await response.json()) as Envelope<Motorista>;

      expect(response.status).toBe(200);
      expect(body.data.ativo).toBe(false);
      expect(body.data.deletedAt).not.toBeNull();
      expect(body.data.statusOperacional).toBe("INDISPONIVEL");
    });

    it("returns 404 for id 'not-found'", async () => {
      const response = await fetch(
        `${BASE_URL}/frota/motoristas/not-found/desativar`,
        { method: "PATCH" }
      );

      expect(response.status).toBe(404);
    });
  });

  // ── PATCH /frota/motoristas/:id/reativar ──────────────────────────────────
  describe("PATCH /frota/motoristas/:id/reativar", () => {
    it("returns 200 with ativo: true and deletedAt: null", async () => {
      const response = await fetch(
        `${BASE_URL}/frota/motoristas/motorista-003/reativar`,
        { method: "PATCH" }
      );
      const body = (await response.json()) as Envelope<Motorista>;

      expect(response.status).toBe(200);
      expect(body.data.ativo).toBe(true);
      expect(body.data.deletedAt).toBeNull();
      expect(body.data.id).toBe("motorista-003");
    });

    it("returns 404 for id 'not-found'", async () => {
      const response = await fetch(
        `${BASE_URL}/frota/motoristas/not-found/reativar`,
        { method: "PATCH" }
      );

      expect(response.status).toBe(404);
    });
  });
});
