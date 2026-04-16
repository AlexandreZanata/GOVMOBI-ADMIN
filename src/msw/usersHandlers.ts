import { delay, http, HttpResponse } from "msw";

import type { User } from "@/models/User";
import { UserStatus } from "@/models/User";
import type { CreateUserInput, UpdateUserInput } from "@/types/users";
import { mockUsers } from "@/test/fixtures/users";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

/** Sentinel email that triggers a 409 conflict in tests. */
const DUPLICATE_EMAIL = "duplicate@gov.internal";

/** Sentinel id that triggers a 404 not-found in tests. */
const NOT_FOUND_ID = "not-found";

/** Sentinel id whose deactivation returns non-empty affectedRunIds. */
const HAS_RUNS_ID = "user-with-runs";

function latency(): number {
  return 200 + Math.floor(Math.random() * 301);
}

function notFound() {
  return HttpResponse.json(
    { code: "NOT_FOUND", message: "User not found" },
    { status: 404 }
  );
}

/**
 * MSW v2 handlers for all `/users` endpoints.
 * Response shape is a flat paginated object — no `{ success, data }` envelope.
 */
export const usersHandlers = [
  // GET /users — paginated list with optional filters
  http.get(`${BASE_URL}/users`, async ({ request }) => {
    await delay(latency());
    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const departmentId = url.searchParams.get("departmentId");

    let items = [...mockUsers];

    if (role) {
      items = items.filter((u) => u.role === role);
    }
    if (departmentId) {
      items = items.filter((u) => u.departmentId === departmentId);
    }
    if (status === "active") {
      items = items.filter(
        (u) => u.status === UserStatus.ACTIVE || u.status === UserStatus.ON_MISSION
      );
    } else if (status === "inactive") {
      items = items.filter((u) => u.status === UserStatus.INACTIVE);
    }

    return HttpResponse.json({
      items,
      total: items.length,
      page: 1,
      pageSize: 25,
      hasMore: false,
    });
  }),

  // POST /users — create
  http.post(`${BASE_URL}/users`, async ({ request }) => {
    await delay(latency());
    const body = (await request.json()) as CreateUserInput;

    if (body.email === DUPLICATE_EMAIL) {
      return HttpResponse.json(
        { code: "CONFLICT", message: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const created: User = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      role: body.role as User["role"],
      departmentId: body.departmentId,
      status: UserStatus.ACTIVE,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    return HttpResponse.json(created, { status: 201 });
  }),

  // PATCH /users/:id — partial update
  http.patch(`${BASE_URL}/users/:id`, async ({ params, request }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const user = mockUsers.find((u) => u.id === id);
    if (!user) return notFound();

    const body = (await request.json()) as UpdateUserInput;

    const updated: User = {
      ...user,
      ...(body.name !== undefined && { name: body.name }),
      ...(body.role !== undefined && { role: body.role as User["role"] }),
      ...(body.departmentId !== undefined && {
        departmentId: body.departmentId,
      }),
    };

    return HttpResponse.json(updated);
  }),

  // POST /users/:id/deactivate
  http.post(`${BASE_URL}/users/:id/deactivate`, async ({ params }) => {
    await delay(latency());
    const id = String(params.id);

    if (id === NOT_FOUND_ID) return notFound();

    const user = mockUsers.find((u) => u.id === id);
    if (!user) return notFound();

    const affectedRunIds =
      id === HAS_RUNS_ID ? ["run-001", "run-002"] : [];

    return HttpResponse.json({
      deactivatedUserId: id,
      affectedRunIds,
    });
  }),
];
