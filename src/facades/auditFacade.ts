import { getApiBase } from "@/lib/apiBase";
import { fetchWithAuth } from "@/facades/authFacade";
import { handleApiResponse } from "@/lib/handleApiResponse";
import type { AuditEntry, AuditPage } from "@/models/AuditEntry";
import type { AuditFilters } from "@/types/audit";

function baseUrl(): string {
  return getApiBase();
}

/**
 * Facade for audit trail read operations.
 * Consumes GET /admin/auditoria with page/limit pagination.
 */
export const auditFacade = {
  /**
   * Lists audit events with optional filters and pagination.
   * GET /admin/auditoria
   */
  async listAuditoria(filters: AuditFilters = {}): Promise<AuditPage> {
    const params = new URLSearchParams();

    if (filters.servidorId)   params.set("servidorId",   filters.servidorId);
    if (filters.aggregateId)  params.set("aggregateId",  filters.aggregateId);
    if (filters.aggregateType) params.set("aggregateType", filters.aggregateType);
    if (filters.eventName)    params.set("eventName",    filters.eventName);
    if (filters.isCritico !== undefined) params.set("isCritico", String(filters.isCritico));
    if (filters.dataInicio)   params.set("dataInicio",   filters.dataInicio);
    if (filters.dataFim)      params.set("dataFim",      filters.dataFim);
    if (filters.page)         params.set("page",         String(filters.page));
    if (filters.limit)        params.set("limit",        String(filters.limit));

    const qs = params.toString();
    const response = await fetchWithAuth(
      `${baseUrl()}/admin/auditoria${qs ? `?${qs}` : ""}`
    );
    return handleApiResponse<AuditPage>(response);
  },

  /**
   * Lists critical events in a date range.
   * GET /admin/auditoria/criticos
   */
  async listCriticos(dataInicio: string, dataFim: string): Promise<AuditEntry[]> {
    const params = new URLSearchParams({ dataInicio, dataFim });
    const response = await fetchWithAuth(
      `${baseUrl()}/admin/auditoria/criticos?${params.toString()}`
    );
    return handleApiResponse<AuditEntry[]>(response);
  },

  /**
   * Lists all events for a specific aggregate.
   * GET /admin/auditoria/aggregate/{id}
   */
  async listByAggregate(aggregateId: string): Promise<AuditEntry[]> {
    const response = await fetchWithAuth(
      `${baseUrl()}/admin/auditoria/aggregate/${aggregateId}`
    );
    return handleApiResponse<AuditEntry[]>(response);
  },
};
