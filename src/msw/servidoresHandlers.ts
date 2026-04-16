import { delay, http, HttpResponse } from "msw";

import type { Servidor } from "@/models/Servidor";
import type {
  CreateServidorInput,
  UpdateServidorInput,
} from "@/types/servidores";
import { makeEnvelope, mockServidores } from "@/test/fixtures/servidores";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

/** Sentinel CPF that triggers a 409 conflict in tests. */
const DUPLICATE_CPF = "00000000000";

/** Sentinel email that triggers a 409 conflict in tests. */
const DUPLICATE_EMAIL = "duplicate@gov.br";

/** Sentinel id that triggers a 404 not-found in tests. */
const NOT_FOUND_ID = "not-found";

function latency(): number {
  return 200 + Math.floor(Math.random() * 301);
}

function notFound() {
  return HttpResponse.json(
    { code: "NOT_FOUND", message: "Servidor not found" },
    { status: 404 }
  );
}

function conflict() {
  return HttpResponse.json(
    { code: "CONFLICT", message: "CPF ou email já cadastrado" },
    { status: 409 }
  );
}

/**
 * MSW v2 handlers for all `/servidores` endpoints.
 * Response shape mirrors the real API: `{ success, data, timestamp }`.
 */
export const servidoresHandlers = [
  // GET /servidores — list all
  http.get(`${BASE_URL}/servidores`, async () => {
    await delay(latency());
    return HttpResponse.json(makeEnvelope(mockServidores));
  }),

  // POST /servidores — create
  http.post(`${BASE_URL}/servidores`, async ({ request }) => {
    await delay(latency());
    const body = (await request.json()) as CreateServidorInput;

    if (body.cpf === DUPLICATE_CPF || body.email === DUPLICATE_EMAIL) {
      return conflict();
    }

    if (body.cargoId === NOT_FOUND_ID || body.lotacaoId === NOT_FOUND_ID) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "Cargo or Lotação not found" },
        { status: 404 }
      );
    }

    const created: Servidor = {
      id: crypto.randomUUID(),
      ...body,
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    return HttpResponse.json(makeEnvelope(created), { status: 201 });
  }),

  // GET /servidores/:id — get by id
  http.get(`${BASE_URL}/servidores/:id`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const servidor = mockServidores.find((s) => s.id === id);
    if (!servidor) return notFound();

    return HttpResponse.json(makeEnvelope(servidor));
  }),

  // PUT /servidores/:id — partial update
  http.put(`${BASE_URL}/servidores/:id`, async ({ params, request }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const servidor = mockServidores.find((s) => s.id === id);
    if (!servidor) return notFound();

    const body = (await request.json()) as UpdateServidorInput;

    const updated: Servidor = {
      ...servidor,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(makeEnvelope(updated));
  }),

  // DELETE /servidores/:id — soft-delete
  http.delete(`${BASE_URL}/servidores/:id`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const servidor = mockServidores.find((s) => s.id === id);
    if (!servidor) return notFound();

    return HttpResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  }),

  // PATCH /servidores/:id/reativar — reactivate
  http.patch(`${BASE_URL}/servidores/:id/reativar`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const servidor = mockServidores.find((s) => s.id === id);
    if (!servidor) return notFound();

    const reativado: Servidor = {
      ...servidor,
      ativo: true,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(makeEnvelope(reativado));
  }),
];
