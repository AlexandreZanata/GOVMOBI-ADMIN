"use client";

import { useQuery } from "@tanstack/react-query";
import { runsFacade } from "@/facades/runsFacade";
import { RunStatus } from "@/models";
import type { Run } from "@/models/Run";
import type { Motorista } from "@/models/Motorista";
import type { Servidor } from "@/models/Servidor";

/** Query keys for dashboard stats */
export const dashboardKeys = {
  stats: () => ["dashboard", "stats"] as const,
  runs: () => ["dashboard", "runs"] as const,
};

function isToday(isoDate: string): boolean {
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Fetches all runs available for dashboard aggregation.
 * Uses a large page size to get as many runs as possible for client-side stats.
 * Falls back to empty array on error so the dashboard never breaks.
 */
export function useDashboardRuns() {
  return useQuery<Run[]>({
    queryKey: dashboardKeys.runs(),
    queryFn: async () => {
      try {
        const page = await runsFacade.listRuns({ page: 1, limit: 100 });
        return page.data ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
    retry: 1,
    placeholderData: [],
  });
}

/**
 * Computes top motoristas by rating using a Bayesian weighted score.
 *
 * Ranking formula: score = (v / (v + m)) * R + (m / (v + m)) * C
 *   - R = motorista's average rating
 *   - v = number of reviews (totalAvaliacoes)
 *   - m = minimum reviews threshold (5) — acts as a confidence weight
 *   - C = global average rating across all rated motoristas
 *
 * This ensures motoristas with few reviews are pulled toward the global
 * average, preventing a single 5★ review from outranking drivers with
 * many consistent reviews. Motoristas with 0 reviews are excluded entirely.
 */
export function computeTopMotoristasByRating(
  motoristas: Motorista[] = [],
  servidores: Servidor[] = [],
): Array<{ rank: number; id: string; name: string; rating: number; totalAvaliacoes: number; score: number }> {
  const servidorById = new Map<string, Servidor>(
    servidores.map((s) => [s.id, s]),
  );

  // Only include motoristas with at least 1 real review
  const rated = motoristas.filter(
    (m) => m.notaMedia != null && m.notaMedia > 0 && m.totalAvaliacoes >= 1,
  );

  if (rated.length === 0) return [];

  // Global average rating (C)
  const globalAvg = rated.reduce((sum, m) => sum + (m.notaMedia ?? 0), 0) / rated.length;

  // Minimum reviews threshold (m) — use 5 or median, whichever is smaller
  const MIN_REVIEWS = 5;

  return rated
    .map((m) => {
      const R = m.notaMedia ?? 0;
      const v = m.totalAvaliacoes;
      const score = (v / (v + MIN_REVIEWS)) * R + (MIN_REVIEWS / (v + MIN_REVIEWS)) * globalAvg;
      return { m, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ m, score }, idx) => {
      const servidor = servidorById.get(m.servidorId);
      const name = servidor?.nome ?? m.id.slice(0, 8) + "…";
      return {
        rank: idx + 1,
        id: m.id,
        name,
        rating: m.notaMedia ?? 0,
        totalAvaliacoes: m.totalAvaliacoes,
        score,
      };
    });
}

/**
 * Computes dashboard statistics from runs data, resolving UUIDs to display names
 * using the already-loaded servidores and motoristas lists.
 *
 * - passageiroId → servidor.nome (servidores list)
 * - motoristaId  → servidor.nome via motorista.servidorId (motoristas + servidores lists)
 */
export function computeDashboardStats(
  runs: Run[],
  servidores: Servidor[] = [],
  motoristas: Motorista[] = [],
): {
  corridasPorStatus: Array<{ status: string; count: number }>;
  topSolicitantes: Array<{ rank: number; id: string; name: string; total: number }>;
  topMotoristas: Array<{ rank: number; id: string; name: string; total: number }>;
  corridasHoje: number;
} {
  // Build lookup maps for O(1) resolution
  const servidorById = new Map<string, Servidor>(
    servidores.map((s) => [s.id, s]),
  );
  const motoristaById = new Map<string, Motorista>(
    motoristas.map((m) => [m.id, m]),
  );

  const statusCounts: Record<string, number> = {};
  const solicitanteCounts: Record<string, number> = {};
  const motoristaCounts: Record<string, number> = {};
  let corridasHoje = 0;

  for (const run of runs) {
    // Status counts
    statusCounts[run.status] = (statusCounts[run.status] ?? 0) + 1;

    // Today's runs
    if (isToday(run.createdAt)) corridasHoje++;

    // Top solicitantes — passageiroId is a servidorId
    if (run.passageiroId) {
      solicitanteCounts[run.passageiroId] =
        (solicitanteCounts[run.passageiroId] ?? 0) + 1;
    }

    // Top motoristas — only completed/rated runs
    if (
      run.motoristaId &&
      (run.status === RunStatus.CONCLUIDA || run.status === RunStatus.AVALIADA)
    ) {
      motoristaCounts[run.motoristaId] =
        (motoristaCounts[run.motoristaId] ?? 0) + 1;
    }
  }

  const corridasPorStatus = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({ status, count }));

  const topSolicitantes = Object.entries(solicitanteCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, total], idx) => {
      const servidor = servidorById.get(id);
      const name = servidor?.nome ?? id.slice(0, 8) + "…";
      return { rank: idx + 1, id, name, total };
    });

  const topMotoristas = Object.entries(motoristaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, total], idx) => {
      const motorista = motoristaById.get(id);
      const servidor = motorista
        ? servidorById.get(motorista.servidorId)
        : undefined;
      const name = servidor?.nome ?? id.slice(0, 8) + "…";
      return { rank: idx + 1, id, name, total };
    });

  return { corridasPorStatus, topSolicitantes, topMotoristas, corridasHoje };
}
