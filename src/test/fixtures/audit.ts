import type { AuditEntry } from "@/models/AuditEntry";

/**
 * Fixture dataset used by audit MSW handlers and unit tests.
 * Contains a realistic mix of event types and priorities.
 */
export const mockAuditEntries: AuditEntry[] = [
  {
    id: "audit-001",
    eventType: "run.overridden",
    actorId: "user-001",
    actorRole: "SUPERVISOR",
    entityType: "run",
    entityId: "run-001",
    departmentId: "dept-001",
    payload: {
      prevStatus: "IN_PROGRESS",
      newStatus: "COMPLETED",
      reason: "Agent confirmed verbally",
    },
    priority: "high",
    timestamp: "2026-04-15T10:30:00.000Z",
  },
  {
    id: "audit-002",
    eventType: "user.deactivated",
    actorId: "user-001",
    actorRole: "ADMIN",
    entityType: "user",
    entityId: "user-003",
    departmentId: "dept-002",
    payload: { reason: "Left organization" },
    priority: "medium",
    timestamp: "2026-04-15T09:00:00.000Z",
  },
  {
    id: "audit-003",
    eventType: "run.assigned",
    actorId: "user-002",
    actorRole: "DISPATCHER",
    entityType: "run",
    entityId: "run-002",
    departmentId: "dept-001",
    payload: { agentId: "user-004" },
    priority: "low",
    timestamp: "2026-04-15T08:45:00.000Z",
  },
  {
    id: "audit-004",
    eventType: "run.cancelled",
    actorId: "user-001",
    actorRole: "SUPERVISOR",
    entityType: "run",
    entityId: "run-003",
    departmentId: "dept-001",
    payload: { reason: "Operation postponed due to weather" },
    priority: "medium",
    timestamp: "2026-04-14T16:20:00.000Z",
  },
  {
    id: "audit-005",
    eventType: "user.roleChanged",
    actorId: "user-001",
    actorRole: "ADMIN",
    entityType: "user",
    entityId: "user-002",
    departmentId: "dept-001",
    payload: { prevRole: "DISPATCHER", newRole: "SUPERVISOR" },
    priority: "high",
    timestamp: "2026-04-14T14:00:00.000Z",
  },
];
