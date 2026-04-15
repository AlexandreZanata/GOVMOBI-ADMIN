import type { Cargo } from "@/models/Cargo";

/**
 * Fixture dataset used by cargos MSW handlers and unit tests.
 */
export const mockCargos: Cargo[] = [
  {
    id: "cargo-001",
    nome: "Auditor Fiscal",
    pesoPrioridade: 80,
    ativo: true,
    createdAt: "2026-04-15T14:00:00.000Z",
    updatedAt: "2026-04-15T14:00:00.000Z",
    deletedAt: null,
  },
  {
    id: "cargo-002",
    nome: "Técnico Administrativo",
    pesoPrioridade: 60,
    ativo: true,
    createdAt: "2026-04-15T14:05:00.000Z",
    updatedAt: "2026-04-15T14:05:00.000Z",
    deletedAt: null,
  },
  {
    id: "cargo-003",
    nome: "Analista de TI",
    pesoPrioridade: 70,
    ativo: false,
    createdAt: "2026-04-10T10:00:00.000Z",
    updatedAt: "2026-04-14T08:00:00.000Z",
    deletedAt: "2026-04-14T08:00:00.000Z",
  },
];

/**
 * Backward-compatible alias for legacy imports.
 */
export const cargosFixture: Cargo[] = mockCargos;

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
