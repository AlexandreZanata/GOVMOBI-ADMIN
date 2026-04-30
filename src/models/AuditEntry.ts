/**
 * Audit event entry matching the real API response shape from GET /admin/auditoria.
 */
export interface AuditEntry {
  /** Unique audit entry identifier (UUID). */
  id: string;
  /** Name of the event (e.g. "CorridaCriadaPorAdmin"). */
  eventName: string;
  /** UUID of the affected aggregate (e.g. corridaId, motoristaId). */
  aggregateId: string;
  /** Type of the affected aggregate (e.g. "Corrida", "Motorista"). */
  aggregateType: string;
  /** Arbitrary event payload — key/value pairs specific to the event type. */
  payload: Record<string, unknown>;
  /** ISO 8601 timestamp when the event occurred. */
  occurredAt: string;
  /** UUID of the servidor who triggered the event. */
  servidorId: string | null;
  /** IP address of the request origin. */
  ipAddress: string | null;
  /** Whether this event is marked as critical. */
  isCritico: boolean;
  /** SHA-256 hash for integrity verification. */
  hash: string;
  /** ISO 8601 timestamp when the record was created. */
  createdAt: string;
}

/**
 * Paginated response from GET /admin/auditoria.
 */
export interface AuditPage {
  data: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
