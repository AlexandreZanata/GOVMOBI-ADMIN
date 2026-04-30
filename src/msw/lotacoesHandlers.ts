import { delay, http, HttpResponse } from "msw";

import type { Lotacao } from "@/models/Lotacao";
import type { CreateLotacaoInput, UpdateLotacaoInput } from "@/types/lotacoes";
import { makeEnvelope, mockLotacoes } from "@/test/fixtures/lotacoes";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Sentinel nome value that triggers a 409 conflict in tests. */
const DUPLICATE_NOME = "DUPLICATE_TEST";

/** Sentinel id value that triggers a 404 not-found in tests. */
const NOT_FOUND_ID = "not-found";

function latency(): number {
  return 200 + Math.floor(Math.random() * 301);
}

function notFound() {
  return HttpResponse.json(
    { code: "NOT_FOUND", message: "Lotacao not found" },
    { status: 404 }
  );
}

function conflict() {
  return HttpResponse.json(
    { code: "CONFLICT", message: "Nome de lotação já existe" },
    { status: 409 }
  );
}

/**
 * MSW v2 handlers for all `/lotacoes` endpoints.
 * Response shape mirrors the real API: `{ success, data, timestamp }`.
 */
export const lotacoesHandlers = [
  // GET /lotacoes — list all
  http.get(`${BASE_URL}/lotacoes`, async () => {
    await delay(latency());
    return HttpResponse.json(makeEnvelope(mockLotacoes));
  }),

  // POST /lotacoes — create
  http.post(`${BASE_URL}/lotacoes`, async ({ request }) => {
    await delay(latency());
    const body = (await request.json()) as CreateLotacaoInput;

    if (body.nome === DUPLICATE_NOME) return conflict();

    const created: Lotacao = {
      id: crypto.randomUUID(),
      nome: body.nome,
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    return HttpResponse.json(makeEnvelope(created), { status: 201 });
  }),

  // GET /lotacoes/:id — get by id
  http.get(`${BASE_URL}/lotacoes/:id`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const lotacao = mockLotacoes.find((l) => l.id === id);
    if (!lotacao) return notFound();

    return HttpResponse.json(makeEnvelope(lotacao));
  }),

  // PUT /lotacoes/:id — update
  http.put(`${BASE_URL}/lotacoes/:id`, async ({ params, request }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const lotacao = mockLotacoes.find((l) => l.id === id);
    if (!lotacao) return notFound();

    const body = (await request.json()) as UpdateLotacaoInput;

    if (body.nome === DUPLICATE_NOME) return conflict();

    const updated: Lotacao = {
      ...lotacao,
      nome: body.nome,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(makeEnvelope(updated));
  }),

  // DELETE /lotacoes/:id — soft-delete
  http.delete(`${BASE_URL}/lotacoes/:id`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const lotacao = mockLotacoes.find((l) => l.id === id);
    if (!lotacao) return notFound();

    return HttpResponse.json({ success: true, timestamp: new Date().toISOString() });
  }),

  // PATCH /lotacoes/:id/reativar — reactivate
  http.patch(`${BASE_URL}/lotacoes/:id/reativar`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const lotacao = mockLotacoes.find((l) => l.id === id);
    if (!lotacao) return notFound();

    const reativado: Lotacao = {
      ...lotacao,
      ativo: true,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(makeEnvelope(reativado));
  }),
];
