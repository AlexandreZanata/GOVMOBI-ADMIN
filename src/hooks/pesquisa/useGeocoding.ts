"use client";

import { useQuery } from "@tanstack/react-query";
import { pesquisaFacade } from "@/facades/pesquisaFacade";
import type { GeocodingFeature } from "@/facades/pesquisaFacade";

/**
 * Query key factory for geocoding searches.
 * Includes query and proximity to ensure correct cache invalidation.
 */
export const geocodingKeys = {
  search: (q: string, proximity?: { lat: number; lng: number }) =>
    ["geocoding", q, proximity] as const,
};

/**
 * Searches for addresses and places using GET /pesquisa/geocoding.
 * Returns both Mapbox public locations AND private organization locations.
 *
 * @param q - Search query (minimum 2 characters to trigger search)
 * @param proximity - Optional coordinates to bias results toward a location
 * @returns TanStack Query result with array of GeocodingFeature
 */
export function useGeocoding(
  q: string,
  proximity?: { lat: number; lng: number },
) {
  const trimmed = q.trim();
  const enabled = trimmed.length >= 2;

  return useQuery<GeocodingFeature[]>({
    queryKey: geocodingKeys.search(trimmed, proximity),
    queryFn: () => pesquisaFacade.geocoding(trimmed, proximity),
    enabled,
    staleTime: 30_000, // 30s — search results can be cached briefly
    retry: false,
    placeholderData: [],
  });
}
