/**
 * Filter parameters for querying the audit trail via GET /admin/auditoria.
 */
export interface AuditFilters {
  /** Filter by UUID of the servidor who generated the event. */
  servidorId?: string;
  /** Filter by UUID of the aggregate (e.g. corridaId, motoristaId). */
  aggregateId?: string;
  /** Filter by aggregate type (e.g. "Corrida", "Motorista"). */
  aggregateType?: string;
  /** Filter by event name (partial match, case-insensitive). */
  eventName?: string;
  /** Filter only critical events. */
  isCritico?: boolean;
  /** ISO 8601 start of date range. */
  dataInicio?: string;
  /** ISO 8601 end of date range. */
  dataFim?: string;
  /** Page number (default: 1). */
  page?: number;
  /** Items per page (default: 20, max: 100). */
  limit?: number;
}
