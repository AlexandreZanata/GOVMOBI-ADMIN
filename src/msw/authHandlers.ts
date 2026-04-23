import { delay, http, HttpResponse } from "msw";

import { Permission } from "@/models/Permission";
import { UserRole } from "@/models/User";
import type { AuthUser, TokenPair, LoginInput, RegisterInput } from "@/models/Auth";
import type { Servidor } from "@/models/Servidor";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

/** Valid password accepted by the mock login handler. Any CPF is accepted. */
const VALID_SENHA = "GovMob@2026";

/** Sentinel CPF that triggers a 409 conflict on registration. */
const DUPLICATE_CPF = "00000000000";

/** Sentinel id that triggers a 404 on activation. */
const NOT_FOUND_ID = "not-found";

/** Simulated latency between 200–500ms. */
function latency(): number {
  return 200 + Math.floor(Math.random() * 301);
}

/** Wraps data in the standard API envelope. */
function makeEnvelope<T>(data: T) {
  return { success: true as const, data, timestamp: new Date().toISOString() };
}

/** Mock authenticated user profile. */
const mockAuthUser: AuthUser = {
  id: "user-1",
  nome: "Admin User",
  cpf: "00000000000",
  email: "admin@gov.br",
  role: UserRole.ADMIN,
  permissions: Object.values(Permission),
};

/** Generates a fake token pair. */
function generateTokenPair(): TokenPair {
  return {
    accessToken: `mock-access-${crypto.randomUUID()}`,
    refreshToken: `mock-refresh-${crypto.randomUUID()}`,
  };
}

/**
 * MSW v2 handlers for all `/auth/*` endpoints.
 * Response shape mirrors the real API: `{ success, data, timestamp }`.
 */
export const authHandlers = [
  // POST /auth/login — 200 with TokenPair on valid credentials, 401 on invalid
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    await delay(latency());

    const body = (await request.json()) as LoginInput;

    if (body.senha === VALID_SENHA) {
      return HttpResponse.json(makeEnvelope(generateTokenPair()), {
        status: 200,
      });
    }

    return HttpResponse.json(
      { code: "UNAUTHORIZED", message: "Invalid credentials" },
      { status: 401 }
    );
  }),

  // GET /auth/me — 200 with AuthUser when authenticated, 401 when not
  http.get(`${BASE_URL}/auth/me`, async ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "Missing or invalid token" },
        { status: 401 }
      );
    }

    return HttpResponse.json(makeEnvelope(mockAuthUser));
  }),

  // POST /auth/refresh — 200 with new TokenPair
  http.post(`${BASE_URL}/auth/refresh`, async () => {
    await delay(latency());

    return HttpResponse.json(makeEnvelope(generateTokenPair()));
  }),

  // POST /auth/logout — 204 No Content
  http.post(`${BASE_URL}/auth/logout`, async () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /auth/register — 201 on success, 409 on duplicate CPF
  http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
    await delay(latency());

    const body = (await request.json()) as RegisterInput;

    if (body.cpf === DUPLICATE_CPF) {
      return HttpResponse.json(
        { code: "CONFLICT", message: "CPF already registered" },
        { status: 409 }
      );
    }

    const created: Servidor = {
      id: crypto.randomUUID(),
      nome: body.nome,
      cpf: body.cpf,
      email: body.email,
      telefone: body.telefone,
      cargoId: body.cargoId,
      lotacaoId: body.lotacaoId,
      papeis: ["USUARIO"],
      ativo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    return HttpResponse.json(makeEnvelope(created), { status: 201 });
  }),

  // POST /auth/activate/:id — 200 on success, 404 on invalid ID
  http.post(`${BASE_URL}/auth/activate/:id`, async ({ params }) => {
    await delay(latency());

    const id = String(params.id);

    if (id === NOT_FOUND_ID) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "Servidor not found" },
        { status: 404 }
      );
    }

    const activated: Servidor = {
      id,
      nome: "Activated Servidor",
      cpf: "11111111111",
      email: "servidor@gov.br",
      telefone: "11999999999",
      cargoId: "cargo-1",
      lotacaoId: "lotacao-1",
      papeis: ["USUARIO"],
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    return HttpResponse.json(makeEnvelope(activated));
  }),

  // POST /auth/change-password — 204 on success, 401 on incorrect password, 422 on validation error
  http.post(`${BASE_URL}/auth/change-password`, async ({ request }) => {
    await delay(latency());

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "Missing or invalid token" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { senhaAntiga: string; novaSenha: string };

    // Simulate incorrect current password
    if (body.senhaAntiga !== VALID_SENHA) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Simulate validation error (password too short)
    if (body.novaSenha.length < 8) {
      return HttpResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Password must be at least 8 characters",
          field: "novaSenha",
        },
        { status: 422 }
      );
    }

    // Success - 204 No Content
    return new HttpResponse(null, { status: 204 });
  }),
];
