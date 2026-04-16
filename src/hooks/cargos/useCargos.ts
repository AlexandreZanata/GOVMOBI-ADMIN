"use client";

import {
  useQuery,
  type QueryObserverResult,
  type RefetchOptions,
} from "@tanstack/react-query";

import { cargosFacade } from "@/facades/cargosFacade";
import { cargosKeys } from "@/lib/queryKeys/cargosKeys";
import type { Cargo } from "@/models/Cargo";

const DEFAULT_STALE_TIME_MS = 30_000;

/**
 * Fetches and caches the full cargo list through the cargos facade.
 *
 * @param staleTime - Query freshness window in milliseconds (default: 30000)
 * @returns TanStack Query state slice containing `data`, `isLoading`, `isError`, and `refetch`
 */
export function useCargos(staleTime = DEFAULT_STALE_TIME_MS): {
  data: Cargo[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<Cargo[], Error>>;
} {
  const query = useQuery<Cargo[], Error>({
    queryKey: cargosKeys.list(),
    queryFn: () => cargosFacade.listCargos(),
    staleTime,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
