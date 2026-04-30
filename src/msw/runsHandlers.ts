import { delay, http, HttpResponse } from "msw";

import {
  makeRunDetail,
  runsFixture,
  type PaginatedResponse,
  type RunListItem,
} from "@/test/fixtures/runs";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

interface CancelRunBody {
  solicitanteId: string;
  tipoSolicitante: "PASSAGEIRO" | "MOTORISTA" | "ADMIN";
  motivoCancelamento: string;
}

function getLatencyMs(): number {
  return 200 + Math.floor(Math.random() * 401);
}

function errorResponse(
  status: 403 | 404 | 422 | 500,
  code: string,
  message: string,
  field?: string
) {
  return HttpResponse.json(
    {
      code,
      message,
      field,
    },
    { status }
  );
}

function getScenario(url: URL): string | null {
  return url.searchParams.get("scenario");
}

function applyScenario(url: URL) {
  const scenario = getScenario(url);

  if (scenario === "forbidden") {
    return errorResponse(403, "FORBIDDEN", "Insufficient permissions");
  }

  if (scenario === "not-found") {
    return errorResponse(404, "NOT_FOUND", "Resource not found");
  }

  if (scenario === "validation") {
    return errorResponse(
      422,
      "VALIDATION_ERROR",
      "Validation failed for request payload",
      "motivoCancelamento"
    );
  }

  if (scenario === "server") {
    return errorResponse(500, "SERVER_ERROR", "Unexpected server error");
  }

  return null;
}

function paginate(items: RunListItem[], page: number, limit: number): PaginatedResponse<RunListItem> {
  const start = (page - 1) * limit;
  const pageItems = items.slice(start, start + limit);

  return {
    data: pageItems,
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit),
  };
}

/**
 * MSW handlers for run-related endpoints - aligned with new API structure.
 */
export const runsHandlers = [
  http.get(`${BASE_URL}/corridas`, async ({ request }) => {
    await delay(getLatencyMs());

    const url = new URL(request.url);
    const scenarioResult = applyScenario(url);
    if (scenarioResult) {
      return scenarioResult;
    }

    const status = url.searchParams.get("status");
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");

    const filtered = runsFixture.filter((run) => {
      const matchesStatus = status ? run.status === status : true;
      return matchesStatus;
    });

    return HttpResponse.json(paginate(filtered, page, limit), { status: 200 });
  }),

  http.get(`${BASE_URL}/corridas/:id`, async ({ params, request }) => {
    await delay(getLatencyMs());

    const url = new URL(request.url);
    const scenarioResult = applyScenario(url);
    if (scenarioResult) {
      return scenarioResult;
    }

    const runId = String(params.id);
    const run = makeRunDetail(runId);
    if (!run) {
      return errorResponse(404, "NOT_FOUND", "Run not found");
    }

    return HttpResponse.json(run, { status: 200 });
  }),

  http.post(`${BASE_URL}/corridas/:id/cancelar`, async ({ params, request }) => {
    await delay(getLatencyMs());

    const url = new URL(request.url);
    const scenarioResult = applyScenario(url);
    if (scenarioResult) {
      return scenarioResult;
    }

    const body = (await request.json()) as CancelRunBody;
    if (!body.motivoCancelamento?.trim()) {
      return errorResponse(
        422,
        "VALIDATION_ERROR",
        "Motivo de cancelamento é obrigatório",
        "motivoCancelamento"
      );
    }

    if (!body.solicitanteId?.trim()) {
      return errorResponse(
        422,
        "VALIDATION_ERROR",
        "ID do solicitante é obrigatório",
        "solicitanteId"
      );
    }

    if (!body.tipoSolicitante) {
      return errorResponse(
        422,
        "VALIDATION_ERROR",
        "Tipo de solicitante é obrigatório",
        "tipoSolicitante"
      );
    }

    const runId = String(params.id);
    const base = runsFixture.find((run) => run.id === runId);
    if (!base) {
      return errorResponse(404, "NOT_FOUND", "Run not found");
    }

    return HttpResponse.json(
      {
        ...makeRunDetail(runId),
        status: "cancelada",
        canceladoPor: body.solicitanteId,
        motivoCancelamento: body.motivoCancelamento,
        timestamps: {
          ...base.timestamps,
          canceladaEm: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  }),
];
