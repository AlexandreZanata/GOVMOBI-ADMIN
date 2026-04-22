"use client";

import { useQuery } from "@tanstack/react-query";
import { pesquisaFacade } from "@/facades/pesquisaFacade";

/**
 * Resolves a lat/lng pair to a human-readable address string.
 * Returns null when coordinates are missing or the API fails.
 */
export function useReverseGeocoding(lat: number | null, lng: number | null) {
  return useQuery<string | null>({
    queryKey: ["reverse-geocoding", lat, lng],
    queryFn: () => pesquisaFacade.reverseGeocoding(lat!, lng!),
    enabled: lat != null && lng != null,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
