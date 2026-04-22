import { getApiBase } from "@/lib/apiBase";
import { fetchWithAuth } from "@/facades/authFacade";
import { ApiError } from "@/types";

export interface GeocodingFeature {
  place_name: string;
  center: [number, number]; // [lng, lat]
}

export interface ReverseGeocodingResult {
  place_name: string;
}

/**
 * Parses the geocoding response — handles both raw Mapbox format
 * { features: [...] } and the enveloped format { data: { features: [...] } }.
 */
function parseGeocodingFeatures(json: unknown): GeocodingFeature[] {
  if (!json || typeof json !== "object") return [];
  const obj = json as Record<string, unknown>;

  // Enveloped: { success, data: { features: [...] }, timestamp }
  if ("data" in obj && obj.data && typeof obj.data === "object") {
    const inner = obj.data as Record<string, unknown>;
    if (Array.isArray(inner.features)) return inner.features as GeocodingFeature[];
    // data is the array directly
    if (Array.isArray(obj.data)) return obj.data as GeocodingFeature[];
  }

  // Raw Mapbox: { features: [...] }
  if (Array.isArray(obj.features)) return obj.features as GeocodingFeature[];

  return [];
}

/**
 * Parses the reverse-geocoding response — handles both formats.
 * Returns the place_name string or null.
 */
function parseReverseGeocodingPlaceName(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const obj = json as Record<string, unknown>;

  // Enveloped: { success, data: { place_name: "..." }, timestamp }
  if ("data" in obj && obj.data && typeof obj.data === "object") {
    const inner = obj.data as Record<string, unknown>;
    if (typeof inner.place_name === "string") return inner.place_name;
    // data might be the string directly
    if (typeof obj.data === "string") return obj.data;
  }

  // Raw: { place_name: "..." }
  if (typeof obj.place_name === "string") return obj.place_name;

  // Mapbox-style: { features: [{ place_name: "..." }] }
  if (Array.isArray(obj.features) && obj.features.length > 0) {
    const first = obj.features[0] as Record<string, unknown>;
    if (typeof first.place_name === "string") return first.place_name;
  }

  return null;
}

/**
 * Facade for the /pesquisa endpoints (Mapbox-backed geocoding).
 */
export const pesquisaFacade = {
  /**
   * Search for an address/place and return coordinates.
   * GET /pesquisa/geocoding?q=...&lat=...&lng=...
   */
  async geocoding(
    q: string,
    proximity?: { lat: number; lng: number },
  ): Promise<GeocodingFeature[]> {
    const params = new URLSearchParams({ q });
    if (proximity) {
      params.set("lat", String(proximity.lat));
      params.set("lng", String(proximity.lng));
    }
    const response = await fetchWithAuth(
      `${getApiBase()}/pesquisa/geocoding?${params.toString()}`,
    );

    if (!response.ok) {
      throw new ApiError(response.status, "GEOCODING_ERROR", `Geocoding failed: ${response.status}`);
    }

    const json = await response.json() as unknown;
    return parseGeocodingFeatures(json);
  },

  /**
   * Convert coordinates to a human-readable address.
   * GET /pesquisa/reverse-geocoding?lat=...&lng=...
   */
  async reverseGeocoding(lat: number, lng: number): Promise<string | null> {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    const response = await fetchWithAuth(
      `${getApiBase()}/pesquisa/reverse-geocoding?${params.toString()}`,
    );

    if (!response.ok) return null; // silently fall back to coordinates

    const json = await response.json() as unknown;
    return parseReverseGeocodingPlaceName(json);
  },
};
