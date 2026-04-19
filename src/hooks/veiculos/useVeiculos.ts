"use client";

import { useQuery } from "@tanstack/react-query";

import { veiculosFacade } from "@/facades/veiculosFacade";
import { veiculosKeys } from "@/lib/queryKeys/veiculosKeys";
import type { Veiculo } from "@/models/Veiculo";

/**
 * Fetches and caches the full vehicle list.
 *
 * @returns TanStack Query state with `data`, `isLoading`, `isError`, and `refetch`
 */
export function useVeiculos() {
  const query = useQuery<Veiculo[], Error>({
    queryKey: veiculosKeys.list(),
    queryFn: () => veiculosFacade.listVeiculos(),
    staleTime: 30_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
