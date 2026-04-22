import { getApiBase } from "@/lib/apiBase";
import { fetchWithAuth } from "@/facades/authFacade";

/**
 * Real API response shape from GET /pesquisa/geocoding
 * Each item has: address, placeName, lng, lat
 */
export interface GeocodingFeature {
  address: string;
  placeName: string;
  lng: number;
  lat: number;
}

/**
 * Facade for the /pesquisa endpoints (Mapbox-backed geocoding).
 */
export const pesquisaFacade = {
  /**
   * Search for an address/place and return a list of results.
   * GET /pesquisa/geocoding?q=...
   * Returns an array of { address, placeName, lng, lat }
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

    if (!response.ok) return [];

    const json = await response.json() as unknown;

    // API returns array directly: [{ address, placeName, lng, lat }, ...]
    if (Array.isArray(json)) return json as GeocodingFeature[];

    // Enveloped: { success, data: [...], timestamp }
    if (json && typeof json === "object") {
      const obj = json as Record<string, unknown>;
      if (Array.isArray(obj.data)) return obj.data as GeocodingFeature[];
    }

    return [];
  },

  /**
   * Convert coordinates to a human-readable address.
   * GET /pesquisa/reverse-geocoding?lat=...&lng=...
   * Returns { placeName: "..." } or enveloped { data: { placeName: "..." } }
   */
  async reverseGeocoding(lat: number, lng: number): Promise<string | null> {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });

    const response = await fetchWithAuth(
      `${getApiBase()}/pesquisa/reverse-geocoding?${params.toString()}`,
    );

    if (!response.ok) return null;

    const json = await response.json() as unknown;
    if (!json || typeof json !== "object") return null;

    const obj = json as Record<string, unknown>;

    // Direct: { placeName: "..." }
    if (typeof obj.placeName === "string") return obj.placeName;

    // Enveloped: { data: { placeName: "..." } }
    if (obj.data && typeof obj.data === "object") {
      const inner = obj.data as Record<string, unknown>;
      if (typeof inner.placeName === "string") return inner.placeName;
    }

    return null;
  },
};
