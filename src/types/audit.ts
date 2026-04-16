import type { AuditEntry } from "@/models/AuditEntry";

/**
 * Filter parameters for querying the audit trail.
 */
export interface AuditFilters {
  /** Filter by machine-readable event type (e.g. "run.overridden"). */
  eventType?: string;
  /** Filter by actor user identifier. */
  actorId?: string;
  /** Filter by entity type (e.g. "run", "user"). */
  entityType?: string;
  /** Filter by specific entity identifier. */
  entityId?: string;
  /** ISO 8601 start of date range (inclusive). */
  from?: string;
  /** ISO 8601 end of date range (inclusive). */
  to?: string;
  /** Number of items per page (default: 50). */
  pageSize?: number;
}

/**
 * Query input for cursor-based audit trail pagination.
 */
export interface ListAuditTrailInput {
  /** Optional filters applied to all fetched pages. */
  filters?: AuditFilters;
  /** Cursor token returned by the previous page. */
  cursor?: string | null;
}

/**
 * Cursor-based page returned by the audit trail endpoint.
 */
export interface AuditTrailPage {
  /** Audit entries for the current page window. */
  items: AuditEntry[];
  /** Cursor for the next page; null when exhausted. */
  nextCursor: string | null;
  /** Indicates whether another page can be requested. */
  hasMore: boolean;
}
