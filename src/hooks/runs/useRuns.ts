"use client";

import { useQuery } from "@tanstack/react-query";

import { runsFacade } from "@/facades/runsFacade";
import { runsKeys } from "@/lib/queryKeys/runsKeys";
import type { CorridasFilters, CorridasPage } from "@/models/Run";

/**
 * Fetches and caches corridas (rides) with optional filters.
 *
 * @param filters - Optional pagination and status filters
 * @returns TanStack Query state with `data` (CorridasPage), `isLoading`, `isError`, and `refetch`
 */
export function useRuns(filters: CorridasFilters = {}) {
  const query = useQuery<CorridasPage, Error>({
    queryKey: runsKeys.list(filters),
    queryFn: () => runsFacade.listRuns(filters),
    staleTime: 30_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
