import { delay, http, HttpResponse } from "msw";

import type { Cargo } from "@/models/Cargo";
import type { CreateCargoInput, UpdateCargoInput } from "@/types/cargos";
import { makeEnvelope, mockCargos } from "@/test/fixtures/cargos";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

/** Sentinel nome value that triggers a 409 conflict in tests. */
const DUPLICATE_NOME = "DUPLICATE_TEST";

/** Sentinel id value that triggers a 404 not-found in tests. */
const NOT_FOUND_ID = "not-found";

function latency(): number {
  return 200 + Math.floor(Math.random() * 301);
}

function notFound() {
  return HttpResponse.json(
    { code: "NOT_FOUND", message: "Cargo not found" },
    { status: 404 }
  );
}

function conflict() {
  return HttpResponse.json(
    { code: "CONFLICT", message: "Nome de cargo já existe" },
    { status: 409 }
  );
}

/**
 * MSW v2 handlers for all `/cargos` endpoints.
 * Response shape mirrors the real API: `{ success, data, timestamp }`.
 */
export const cargosHandlers = [
  // GET /cargos — list all
  http.get(`${BASE_URL}/cargos`, async () => {
    await delay(latency());
    return HttpResponse.json(makeEnvelope(mockCargos));
  }),

  // POST /cargos — create
  http.post(`${BASE_URL}/cargos`, async ({ request }) => {
    await delay(latency());
    const body = (await request.json()) as CreateCargoInput;

    if (body.nome === DUPLICATE_NOME) {
      return conflict();
    }

    const created: Cargo = {
      id: crypto.randomUUID(),
      nome: body.nome,
      pesoPrioridade: body.pesoPrioridade,
      nivelHierarquia: 1,
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    return HttpResponse.json(makeEnvelope(created), { status: 201 });
  }),

  // GET /cargos/:id — get by id
  http.get(`${BASE_URL}/cargos/:id`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const cargo = mockCargos.find((c) => c.id === id);
    if (!cargo) return notFound();

    return HttpResponse.json(makeEnvelope(cargo));
  }),

  // PUT /cargos/:id — update
  http.put(`${BASE_URL}/cargos/:id`, async ({ params, request }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const cargo = mockCargos.find((c) => c.id === id);
    if (!cargo) return notFound();

    const body = (await request.json()) as UpdateCargoInput;

    if (body.nome === DUPLICATE_NOME) return conflict();

    const updated: Cargo = {
      ...cargo,
      nome: body.nome,
      pesoPrioridade: body.pesoPrioridade,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(makeEnvelope(updated));
  }),

  // DELETE /cargos/:id — soft-delete
  http.delete(`${BASE_URL}/cargos/:id`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const cargo = mockCargos.find((c) => c.id === id);
    if (!cargo) return notFound();

    return HttpResponse.json({ success: true, timestamp: new Date().toISOString() });
  }),

  // PATCH /cargos/:id/reativar — reactivate
  http.patch(`${BASE_URL}/cargos/:id/reativar`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const cargo = mockCargos.find((c) => c.id === id);
    if (!cargo) return notFound();

    const reativado: Cargo = {
      ...cargo,
      ativo: true,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(makeEnvelope(reativado));
  }),
];
