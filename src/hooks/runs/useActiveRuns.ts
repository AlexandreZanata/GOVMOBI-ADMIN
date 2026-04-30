"use client";

import { useQuery } from "@tanstack/react-query";

import { runsFacade } from "@/facades/runsFacade";
import { runsKeys } from "@/lib/queryKeys/runsKeys";
import type { Run } from "@/models/Run";

const ACTIVE_RUNS_REFETCH_INTERVAL_MS = 15_000;

/**
 * Fetches all active corridas with motorista position (admin only).
 * GET /admin/corridas/ativas
 * Polls every 15 seconds to keep the list fresh.
 */
export function useActiveRuns() {
  const query = useQuery<Run[], Error>({
    queryKey: [...runsKeys.all, "ativas"],
    queryFn: () => runsFacade.listActiveRuns(),
    staleTime: 10_000,
    refetchInterval: ACTIVE_RUNS_REFETCH_INTERVAL_MS,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
