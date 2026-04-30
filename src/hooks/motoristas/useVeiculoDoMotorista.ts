"use client";

import { useQuery } from "@tanstack/react-query";

import { motoristasFacade } from "@/facades/motoristasFacade";
import { motoristasKeys } from "@/lib/queryKeys/motoristasKeys";
import type { Veiculo } from "@/models/Veiculo";

/**
 * Fetches the vehicle currently associated to a motorista.
 * GET /frota/motoristas/{id}/veiculo
 * Returns null when no vehicle is associated (404).
 */
export function useVeiculoDoMotorista(motoristaId: string | null | undefined) {
  const query = useQuery<Veiculo | null, Error>({
    queryKey: [...motoristasKeys.detail(motoristaId ?? ""), "veiculo"],
    queryFn: () => motoristasFacade.getVeiculoDoMotorista(motoristaId!),
    enabled: !!motoristaId,
    staleTime: 30_000,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
