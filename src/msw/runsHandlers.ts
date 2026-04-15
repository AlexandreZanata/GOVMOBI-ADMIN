import { delay, http, HttpResponse } from "msw";

import { RunPriority, RunStatus, RunType, type Run } from "@/models";

const runByIdMock: Run = {
  id: "run-42",
  type: RunType.INSPECTION,
  status: RunStatus.ASSIGNED,
  priority: RunPriority.HIGH,
  title: "Routine Fleet Inspection",
  description: "Vehicle readiness inspection in central district",
  location: {
    lat: -8.0476,
    lng: -34.877,
    address: "Central District Garage",
  },
  assignedAgentId: "agent-11",
  dispatcherId: "dispatcher-4",
  createdAt: "2026-04-15T09:00:00.000Z",
  updatedAt: "2026-04-15T09:30:00.000Z",
  completedAt: null,
  notes: "Bring maintenance checklist",
  proofs: [],
  departmentId: "dept-fleet",
};

/**
 * MSW handlers for run-related endpoints.
 */
export const runsHandlers = [
  http.get("/v1/runs/:runId", async ({ params }) => {
    await delay(200 + Math.floor(Math.random() * 301));

    const runId = String(params.runId);

    if (runId === "invalid") {
      return HttpResponse.json(
        {
          code: "INVALID_RUN_ID",
          message: "INVALID_RUN_ID",
        },
        {
          status: 400,
        }
      );
    }

    if (runId === "forbidden") {
      return HttpResponse.json(
        {
          code: "FORBIDDEN",
          message: "FORBIDDEN",
        },
        {
          status: 403,
        }
      );
    }

    if (runId === "not-found") {
      return HttpResponse.json(
        {
          code: "RUN_NOT_FOUND",
          message: "RUN_NOT_FOUND",
        },
        {
          status: 404,
        }
      );
    }

    return HttpResponse.json(
      {
        ...runByIdMock,
        id: runId,
      },
      {
        status: 200,
      }
    );
  }),
];
