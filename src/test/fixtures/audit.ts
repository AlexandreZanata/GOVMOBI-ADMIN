import type { AuditEntry } from "@/models/AuditEntry";

/**
 * Fixture dataset used by audit MSW handlers and unit tests.
 * Matches the real API shape from GET /admin/auditoria.
 */
export const mockAuditEntries: AuditEntry[] = [
  {
    id: "audit-001",
    eventName: "CorridaCriadaPorAdmin",
    aggregateId: "run-001",
    aggregateType: "Corrida",
    payload: { adminId: "user-001", corridaId: "run-001" },
    occurredAt: "2026-04-15T10:30:00.000Z",
    servidorId: "user-001",
    ipAddress: "192.168.1.1",
    isCritico: true,
    hash: "abc123",
    createdAt: "2026-04-15T10:30:00.000Z",
  },
  {
    id: "audit-002",
    eventName: "MotoristaDesativado",
    aggregateId: "motorista-001",
    aggregateType: "Motorista",
    payload: { motoristaId: "motorista-001" },
    occurredAt: "2026-04-15T09:00:00.000Z",
    servidorId: "user-001",
    ipAddress: null,
    isCritico: false,
    hash: "def456",
    createdAt: "2026-04-15T09:00:00.000Z",
  },
];
