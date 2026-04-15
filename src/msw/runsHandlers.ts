import { delay, http, HttpResponse } from "msw";

import {
  makeRunDetail,
  runsFixture,
  type PaginatedResponse,
  type RunDetail,
  type RunListItem,
} from "@/test/fixtures/runs";

interface CreateRunBody {
  title?: string;
  description?: string;
  departmentId?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  agentId?: string | null;
  scheduledAt?: string | null;
}

interface AssignRunBody {
  agentId?: string;
}

interface CancelRunBody {
  reason?: string;
}

interface OverrideRunBody {
  targetStatus?: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  reason?: string;
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
      "reason"
    );
  }

  if (scenario === "server") {
    return errorResponse(500, "SERVER_ERROR", "Unexpected server error");
  }

  return null;
}

function paginate(items: RunListItem[], page: number, pageSize: number): PaginatedResponse<RunListItem> {
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    items: pageItems,
    total: items.length,
    page,
    pageSize,
    hasMore: start + pageSize < items.length,
  };
}

/**
 * MSW handlers for run-related endpoints.
 */
export const runsHandlers = [
  http.get("/v1/runs", async ({ request }) => {
    await delay(getLatencyMs());

    const url = new URL(request.url);
    const scenarioResult = applyScenario(url);
    if (scenarioResult) {
      return scenarioResult;
    }

    const status = url.searchParams.get("status");
    const departmentId = url.searchParams.get("departmentId");
    const agentId = url.searchParams.get("agentId");
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "25");

    const filtered = runsFixture.filter((run) => {
      const matchesStatus = status ? run.status === status : true;
      const matchesDepartment = departmentId ? run.departmentId === departmentId : true;
      const matchesAgent = agentId ? run.agentId === agentId : true;

      return matchesStatus && matchesDepartment && matchesAgent;
    });

    return HttpResponse.json(paginate(filtered, page, pageSize), { status: 200 });
  }),

  http.get("/v1/runs/:id", async ({ params, request }) => {
    await delay(getLatencyMs());

    const url = new URL(request.url);
    const scenarioResult = applyScenario(url);
    if (scenarioResult) {
      return scenarioResult;
    }

    const runId = String(params.id);
    const fixtureExists = runsFixture.some((run) => run.id === runId);
    if (!fixtureExists) {
      return errorResponse(404, "NOT_FOUND", "Run not found");
    }

    return HttpResponse.json(makeRunDetail(runId), { status: 200 });
  }),

  http.post("/v1/runs", async ({ request }) => {
    await delay(getLatencyMs());

    const url = new URL(request.url);
    const scenarioResult = applyScenario(url);
    if (scenarioResult) {
      return scenarioResult;
    }

    const body = (await request.json()) as CreateRunBody;
    if (!body.title?.trim()) {
      return errorResponse(
        422,
        "VALIDATION_ERROR",
        "Title is required",
        "title"
      );
    }

    const created: RunDetail = {
      id: "run-created",
      title: body.title,
      status: "PENDING",
      departmentId: body.departmentId ?? "dept-001",
      agentId: body.agentId ?? null,
      history: [
        {
          status: "PENDING",
          timestamp: new Date().toISOString(),
          actorId: "user-dispatcher",
          actorRole: "DISPATCHER",
          note: null,
        },
      ],
    };

    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/v1/runs/:id/assign", async ({ params, request }) => {
    await delay(getLatencyMs());

    const url = new URL(request.url);
    const scenarioResult = applyScenario(url);
    if (scenarioResult) {
      return scenarioResult;
    }

    const body = (await request.json()) as AssignRunBody;
    if (!body.agentId?.trim()) {
      return errorResponse(
        422,
        "VALIDATION_ERROR",
        "Agent id is required",
        "agentId"
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
        status: "ASSIGNED",
        agentId: body.agentId,
      },
      { status: 200 }
    );
  }),

  http.post("/v1/runs/:id/cancel", async ({ params, request }) => {
    await delay(getLatencyMs());

    const url = new URL(request.url);
    const scenarioResult = applyScenario(url);
    if (scenarioResult) {
      return scenarioResult;
    }

    const body = (await request.json()) as CancelRunBody;
    if (!body.reason?.trim()) {
      return errorResponse(
        422,
        "VALIDATION_ERROR",
        "Reason is required for cancellation",
        "reason"
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
        status: "CANCELLED",
      },
      { status: 200 }
    );
  }),

  http.post("/v1/runs/:id/override", async ({ params, request }) => {
    await delay(getLatencyMs());

    const url = new URL(request.url);
    const scenarioResult = applyScenario(url);
    if (scenarioResult) {
      return scenarioResult;
    }

    const body = (await request.json()) as OverrideRunBody;
    if (!body.reason?.trim()) {
      return errorResponse(
        422,
        "VALIDATION_ERROR",
        "Reason is required for override",
        "reason"
      );
    }

    if (!body.targetStatus) {
      return errorResponse(
        422,
        "VALIDATION_ERROR",
        "Target status is required",
        "targetStatus"
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
        status: body.targetStatus,
        history: [
          ...makeRunDetail(runId).history,
          {
            status: body.targetStatus,
            timestamp: new Date().toISOString(),
            actorId: "user-supervisor",
            actorRole: "SUPERVISOR",
            note: body.reason,
            isOverride: true,
          },
        ],
      },
      { status: 200 }
    );
  }),

  http.patch("/v1/runs/:id/override", async ({ params, request }) => {
    await delay(getLatencyMs());

    const url = new URL(request.url);
    const scenarioResult = applyScenario(url);
    if (scenarioResult) {
      return scenarioResult;
    }

    const body = (await request.json()) as OverrideRunBody;
    if (!body.reason?.trim()) {
      return errorResponse(
        422,
        "VALIDATION_ERROR",
        "Reason is required for override",
        "reason"
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
        history: [
          ...makeRunDetail(runId).history,
          {
            status: makeRunDetail(runId).status,
            timestamp: new Date().toISOString(),
            actorId: "user-supervisor",
            actorRole: "SUPERVISOR",
            note: body.reason,
            isOverride: true,
          },
        ],
      },
      { status: 200 }
    );
  }),
];
