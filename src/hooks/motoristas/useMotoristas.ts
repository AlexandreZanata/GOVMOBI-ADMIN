"use client";

import {
  useQuery,
  type QueryObserverResult,
  type RefetchOptions,
} from "@tanstack/react-query";

import { motoristasFacade } from "@/facades/motoristasFacade";
import { motoristasKeys } from "@/lib/queryKeys/motoristasKeys";
import type { Motorista } from "@/models/Motorista";

const DEFAULT_STALE_TIME_MS = 60_000;

/**
 * Fetches and caches the full motorista list through the motoristas facade.
 *
 * @param staleTime - Query freshness window in milliseconds (default: 60000)
 * @returns TanStack Query state slice containing `data`, `isLoading`, `isError`, and `refetch`
 */
export function useMotoristas(staleTime = DEFAULT_STALE_TIME_MS): {
  data: Motorista[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<Motorista[], Error>>;
} {
  const query = useQuery<Motorista[], Error>({
    queryKey: motoristasKeys.list(),
    queryFn: () => motoristasFacade.listMotoristas(),
    staleTime,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
