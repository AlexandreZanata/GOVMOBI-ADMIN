"use client";

import { useQuery } from "@tanstack/react-query";
import { pesquisaFacade } from "@/facades/pesquisaFacade";

/**
 * Resolves a lat/lng pair to a human-readable address.
 * Only fetches when both lat and lng are provided.
 */
export function useReverseGeocoding(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ["reverse-geocoding", lat, lng],
    queryFn: () => pesquisaFacade.reverseGeocoding(lat!, lng!),
    enabled: lat != null && lng != null,
    staleTime: 5 * 60_000, // 5 min — addresses don't change
    retry: false,
  });
}
