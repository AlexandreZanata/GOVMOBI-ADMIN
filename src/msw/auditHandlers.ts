import { delay, http, HttpResponse } from "msw";

import type { AuditEntry } from "@/models/AuditEntry";
import { mockAuditEntries } from "@/test/fixtures/audit";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

function latency(): number {
  return 200 + Math.floor(Math.random() * 301);
}

function applyFilters(entries: AuditEntry[], url: URL): AuditEntry[] {
  const eventType = url.searchParams.get("eventType");
  const actorId = url.searchParams.get("actorId");
  const entityType = url.searchParams.get("entityType");
  const entityId = url.searchParams.get("entityId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  return entries.filter((entry) => {
    const matchesEventType = eventType ? entry.eventType === eventType : true;
    const matchesActor = actorId ? entry.actorId === actorId : true;
    const matchesEntityType = entityType ? entry.entityType === entityType : true;
    const matchesEntityId = entityId ? entry.entityId === entityId : true;
    const matchesFrom = from ? entry.timestamp >= from : true;
    const matchesTo = to ? entry.timestamp <= to : true;

    return (
      matchesEventType &&
      matchesActor &&
      matchesEntityType &&
      matchesEntityId &&
      matchesFrom &&
      matchesTo
    );
  });
}

/**
 * MSW v2 handlers for `/v1/audit` endpoints.
 * Uses cursor-based pagination with `cursor` and `pageSize` query params.
 */
export const auditHandlers = [
  http.get(`${BASE_URL}/v1/audit`, async ({ request }) => {
    await delay(latency());

    const url = new URL(request.url);
    const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
    const cursor = Number(url.searchParams.get("cursor") ?? "0");

    const sorted = [...mockAuditEntries].sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );
    const filtered = applyFilters(sorted, url);

    const start = Number.isNaN(cursor) ? 0 : Math.max(0, cursor);
    const end = start + Math.max(1, pageSize);

    const items = filtered.slice(start, end);
    const hasMore = end < filtered.length;
    const nextCursor = hasMore ? String(end) : null;

    return HttpResponse.json({
      items,
      hasMore,
      nextCursor,
    });
  }),
];
