/**
 * Audit trail entry matching the real API response shape.
 */
export interface AuditEntry {
  /** Unique audit entry identifier (UUID). */
  id: string;
  /** Machine-readable event type (e.g. "run.overridden"). */
  eventType: string;
  /** Identifier of the user who performed the action. */
  actorId: string;
  /** Role of the actor at the time of the event. */
  actorRole: "ADMIN" | "SUPERVISOR" | "DISPATCHER" | "FIELD_AGENT";
  /** Type of the affected entity (e.g. "run", "user"). */
  entityType: string;
  /** Identifier of the affected entity. */
  entityId: string;
  /** Department context for the event. */
  departmentId: string;
  /** Arbitrary event payload — key/value pairs specific to the event type. */
  payload: Record<string, unknown>;
  /** Severity indicator for the event. */
  priority: "low" | "medium" | "high";
  /** ISO 8601 timestamp when the event occurred. */
  timestamp: string;
}
