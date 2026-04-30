import { delay, http, HttpResponse } from "msw";

import type { Department } from "@/models/Department";
import type { CreateDepartmentInput } from "@/types/departments";
import { mockDepartments } from "@/test/fixtures/departments";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Sentinel name that triggers a 409 conflict in tests. */
const DUPLICATE_NAME = "DUPLICATE_TEST";

function latency(): number {
  return 200 + Math.floor(Math.random() * 301);
}

/**
 * MSW v2 handlers for all `/departments` endpoints.
 * Response shape is a flat paginated object — no `{ success, data }` envelope.
 */
export const departmentsHandlers = [
  // GET /departments — list all
  http.get(`${BASE_URL}/departments`, async () => {
    await delay(latency());
    return HttpResponse.json({
      items: mockDepartments,
      total: mockDepartments.length,
      page: 1,
      pageSize: 25,
      hasMore: false,
    });
  }),

  // POST /departments — create
  http.post(`${BASE_URL}/departments`, async ({ request }) => {
    await delay(latency());
    const body = (await request.json()) as CreateDepartmentInput;

    if (body.name === DUPLICATE_NAME) {
      return HttpResponse.json(
        { code: "CONFLICT", message: "A department with this name already exists" },
        { status: 409 }
      );
    }

    const created: Department = {
      id: crypto.randomUUID(),
      name: body.name,
      description: body.description ?? null,
      userCount: 0,
      activeRunCount: 0,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(created, { status: 201 });
  }),
];
