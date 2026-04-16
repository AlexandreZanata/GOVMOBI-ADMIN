import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";

import { cargosHandlers } from "@/msw/cargosHandlers";
import { mockCargos } from "@/test/fixtures/cargos";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

const server = setupServer(...cargosHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("cargosHandlers", () => {
  it("returns enveloped cargo list from GET /cargos", async () => {
    const response = await fetch(`${BASE_URL}/cargos`);
    const body = (await response.json()) as {
      success: boolean;
      data: typeof mockCargos;
      timestamp: string;
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(mockCargos.length);
    expect(typeof body.timestamp).toBe("string");
  });

  it("returns 409 when creating a duplicate cargo", async () => {
    const response = await fetch(`${BASE_URL}/cargos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: "DUPLICATE_TEST", pesoPrioridade: 50 }),
    });

    const body = (await response.json()) as { code: string; message: string };

    expect(response.status).toBe(409);
    expect(body.code).toBe("CONFLICT");
  });

  it("returns 200 with success timestamp for DELETE /cargos/:id", async () => {
    const response = await fetch(`${BASE_URL}/cargos/cargo-001`, {
      method: "DELETE",
    });

    const body = (await response.json()) as { success: boolean; timestamp: string };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(typeof body.timestamp).toBe("string");
  });
});
