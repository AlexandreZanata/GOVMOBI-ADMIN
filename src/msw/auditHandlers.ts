import { delay, http, HttpResponse } from "msw";

import type { AuditEntry } from "@/models/AuditEntry";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

function latency(): number {
  return 200 + Math.floor(Math.random() * 301);
}

/** MSW v2 handlers for /admin/auditoria endpoints. */
export const auditHandlers = [
  http.get(`${BASE_URL}/admin/auditoria`, async ({ request }) => {
    await delay(latency());
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const eventName = url.searchParams.get("eventName");
    const aggregateType = url.searchParams.get("aggregateType");
    const isCritico = url.searchParams.get("isCritico");

    const mockEntries: AuditEntry[] = [];

    const filtered = mockEntries.filter((e) => {
      if (eventName && !e.eventName.toLowerCase().includes(eventName.toLowerCase())) return false;
      if (aggregateType && e.aggregateType !== aggregateType) return false;
      if (isCritico !== null && String(e.isCritico) !== isCritico) return false;
      return true;
    });

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    });
  }),

  http.get(`${BASE_URL}/admin/auditoria/criticos`, async () => {
    await delay(latency());
    return HttpResponse.json([]);
  }),

  http.get(`${BASE_URL}/admin/auditoria/aggregate/:id`, async () => {
    await delay(latency());
    return HttpResponse.json([]);
  }),
];
