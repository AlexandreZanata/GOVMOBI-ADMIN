"use client";

import {
  useQuery,
  type QueryObserverResult,
  type RefetchOptions,
} from "@tanstack/react-query";

import { servidoresFacade } from "@/facades/servidoresFacade";
import { servidoresKeys } from "@/lib/queryKeys/servidoresKeys";
import type { Servidor } from "@/models/Servidor";

const DEFAULT_STALE_TIME_MS = 30_000;

/**
 * Fetches and caches the full servidor list through the servidores facade.
 *
 * @param staleTime - Query freshness window in milliseconds (default: 30000)
 * @returns TanStack Query state slice containing `data`, `isLoading`, `isError`, and `refetch`
 */
export function useServidores(staleTime = DEFAULT_STALE_TIME_MS): {
  data: Servidor[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<Servidor[], Error>>;
} {
  const query = useQuery<Servidor[], Error>({
    queryKey: servidoresKeys.list(),
    queryFn: () => servidoresFacade.listServidores(),
    staleTime,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
