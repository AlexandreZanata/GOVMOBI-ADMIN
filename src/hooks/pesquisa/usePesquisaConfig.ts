"use client";

import { useQuery } from "@tanstack/react-query";
import { pesquisaFacade } from "@/facades/pesquisaFacade";

/**
 * Fetches map configuration from GET /pesquisa/config.
 * Used to get municipality coordinates for proximity-biased geocoding.
 */
export function usePesquisaConfig() {
  return useQuery({
    queryKey: ["pesquisa-config"],
    queryFn: () => pesquisaFacade.getConfig(),
    staleTime: 60 * 60_000, // 1 hour — config rarely changes
    retry: false,
  });
}
