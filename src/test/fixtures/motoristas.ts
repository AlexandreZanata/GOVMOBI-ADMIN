import type { Motorista } from "@/models/Motorista";

/**
 * Fixture dataset used by motoristas MSW handlers and unit tests.
 * Contains a realistic mix of statuses and active/inactive records.
 */
export const mockMotoristas: Motorista[] = [
  {
    id: "motorista-001",
    servidorId: "servidor-001",
    cnhNumero: "12345678901",
    cnhCategoria: "D",
    statusOperacional: "DISPONIVEL",
    ativo: true,
    createdAt: "2026-04-15T08:00:00.000Z",
    updatedAt: "2026-04-15T08:00:00.000Z",
    deletedAt: null,
  },
  {
    id: "motorista-002",
    servidorId: "servidor-002",
    cnhNumero: "98765432100",
    cnhCategoria: "B",
    statusOperacional: "EM_SERVICO",
    ativo: true,
    createdAt: "2026-04-15T09:00:00.000Z",
    updatedAt: "2026-04-15T09:00:00.000Z",
    deletedAt: null,
  },
  {
    id: "motorista-003",
    servidorId: "servidor-003",
    cnhNumero: "11122233344",
    cnhCategoria: "E",
    statusOperacional: "AFASTADO",
    ativo: false,
    createdAt: "2026-04-10T10:00:00.000Z",
    updatedAt: "2026-04-14T08:00:00.000Z",
    deletedAt: "2026-04-14T08:00:00.000Z",
  },
];

/**
 * Builds a well-formed API envelope around a data payload,
 * matching the real backend response shape.
 *
 * @param data - Payload to wrap
 * @returns Envelope object `{ success, data, timestamp }`
 */
export function makeEnvelope<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}
