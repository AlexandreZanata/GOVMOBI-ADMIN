import { delay, http, HttpResponse } from "msw";

import type { Motorista } from "@/models/Motorista";
import { StatusOperacional } from "@/models";
import type {
  CreateMotoristaInput,
  UpdateMotoristaInput,
  UpdateMotoristaStatusInput,
} from "@/types/motoristas";
import { makeEnvelope, mockMotoristas } from "@/test/fixtures/motoristas";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Sentinel cnhNumero value that triggers a 409 conflict in tests. */
const DUPLICATE_CNH = "DUPLICATE_TEST";

/** Sentinel id value that triggers a 404 not-found in tests. */
const NOT_FOUND_ID = "not-found";

function latency(): number {
  return 200 + Math.floor(Math.random() * 301);
}

function notFound() {
  return HttpResponse.json(
    { code: "NOT_FOUND", message: "Motorista not found" },
    { status: 404 }
  );
}

function conflict() {
  return HttpResponse.json(
    { code: "CONFLICT", message: "CNH já cadastrada" },
    { status: 409 }
  );
}

/**
 * MSW v2 handlers for all `/frota/motoristas` endpoints.
 * Response shape mirrors the real API: `{ success, data, timestamp }`.
 */
export const motoristasHandlers = [
  // GET /frota/motoristas — list all
  http.get(`${BASE_URL}/frota/motoristas`, async () => {
    await delay(latency());
    return HttpResponse.json(makeEnvelope(mockMotoristas));
  }),

  // POST /frota/motoristas — create
  http.post(`${BASE_URL}/frota/motoristas`, async ({ request }) => {
    await delay(latency());
    const body = (await request.json()) as CreateMotoristaInput;

    if (body.cnhNumero === DUPLICATE_CNH) {
      return conflict();
    }

    const created: Motorista = {
      id: crypto.randomUUID(),
      servidorId: body.servidorId,
      cnhNumero: body.cnhNumero,
      cnhCategoria: body.cnhCategoria,
      statusOperacional: StatusOperacional.DISPONIVEL,
      veiculoId: null,
      notaMedia: null,
      totalAvaliacoes: 0,
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    return HttpResponse.json(makeEnvelope(created), { status: 201 });
  }),

  // GET /frota/motoristas/:id — get by id
  http.get(`${BASE_URL}/frota/motoristas/:id`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const motorista = mockMotoristas.find((m) => m.id === id);
    if (!motorista) return notFound();

    return HttpResponse.json(makeEnvelope(motorista));
  }),

  // PUT /frota/motoristas/:id — update license data
  http.put(`${BASE_URL}/frota/motoristas/:id`, async ({ params, request }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const motorista = mockMotoristas.find((m) => m.id === id);
    if (!motorista) return notFound();

    const body = (await request.json()) as UpdateMotoristaInput;

    if (body.cnhNumero === DUPLICATE_CNH) return conflict();

    const updated: Motorista = {
      ...motorista,
      ...(body.cnhNumero !== undefined && { cnhNumero: body.cnhNumero }),
      ...(body.cnhCategoria !== undefined && { cnhCategoria: body.cnhCategoria }),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(makeEnvelope(updated));
  }),

  // PATCH /frota/motoristas/:id/status — update operational status
  http.patch(
    `${BASE_URL}/frota/motoristas/:id/status`,
    async ({ params, request }) => {
      await delay(latency());
      const id = String(params.id);

      if (id === NOT_FOUND_ID) return notFound();

      const motorista = mockMotoristas.find((m) => m.id === id);
      if (!motorista) return notFound();

      const body = (await request.json()) as UpdateMotoristaStatusInput;

      const updated: Motorista = {
        ...motorista,
        statusOperacional: body.statusOperacional,
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json(makeEnvelope(updated));
    }
  ),

  // PATCH /frota/motoristas/:id/desativar — soft-deactivate
  http.patch(`${BASE_URL}/frota/motoristas/:id/desativar`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const motorista = mockMotoristas.find((m) => m.id === id);
    if (!motorista) return notFound();

    const updated: Motorista = {
      ...motorista,
      ativo: false,
      statusOperacional: StatusOperacional.OFFLINE,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(makeEnvelope(updated));
  }),

  // PATCH /frota/motoristas/:id/reativar — reactivate
  http.patch(`${BASE_URL}/frota/motoristas/:id/reativar`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const motorista = mockMotoristas.find((m) => m.id === id);
    if (!motorista) return notFound();

    const updated: Motorista = {
      ...motorista,
      ativo: true,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(makeEnvelope(updated));
  }),
];
