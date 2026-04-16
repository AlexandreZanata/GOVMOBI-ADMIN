"use client";

import {
  useQuery,
  type QueryObserverResult,
  type RefetchOptions,
} from "@tanstack/react-query";

import { lotacoesFacade } from "@/facades/lotacoesFacade";
import { lotacoesKeys } from "@/lib/queryKeys/lotacoesKeys";
import type { Lotacao } from "@/models/Lotacao";

const DEFAULT_STALE_TIME_MS = 30_000;

/**
 * Fetches and caches the full lotacao list through the lotacoes facade.
 *
 * @param staleTime - Query freshness window in milliseconds (default: 30000)
 * @returns TanStack Query state slice containing `data`, `isLoading`, `isError`, and `refetch`
 */
export function useLotacoes(staleTime = DEFAULT_STALE_TIME_MS): {
  data: Lotacao[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<Lotacao[], Error>>;
} {
  const query = useQuery<Lotacao[], Error>({
    queryKey: lotacoesKeys.list(),
    queryFn: () => lotacoesFacade.listLotacoes(),
    staleTime,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
