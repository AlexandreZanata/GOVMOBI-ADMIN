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

/** Extract placeName from any response shape the API might return */
function extractPlaceName(json: unknown): string | null {
  if (!json) return null;

  // String directly
  if (typeof json === "string") return json;

  // ARRAY: [{ placeName, lng, lat }] — reverse-geocoding returns an array
  if (Array.isArray(json)) {
    if (json.length === 0) return null;
    return extractPlaceName(json[0]);
  }

  if (typeof json !== "object") return null;
  const obj = json as Record<string, unknown>;

  // { placeName: "..." }
  if (typeof obj.placeName === "string" && obj.placeName) return obj.placeName;

  // { place_name: "..." }  (Mapbox raw)
  if (typeof obj.place_name === "string" && obj.place_name) return obj.place_name;

  // { address: "..." }
  if (typeof obj.address === "string" && obj.address) return obj.address;

  // Enveloped: { success, data: { placeName|place_name|address }, timestamp }
  if (obj.data) {
    const inner = extractPlaceName(obj.data);
    if (inner) return inner;
  }

  // Mapbox features array: { features: [{ place_name }] }
  if (Array.isArray(obj.features) && obj.features.length > 0) {
    const first = obj.features[0] as Record<string, unknown>;
    if (typeof first.place_name === "string") return first.place_name;
    if (typeof first.placeName === "string") return first.placeName;
  }

  return null;
}

export interface PesquisaConfig {
  mapboxToken?: string;
  municipioLat?: number;
  municipioLng?: number;
  [key: string]: unknown;
}

/**
 * Facade for the /pesquisa endpoints (Mapbox-backed geocoding).
 */
export const pesquisaFacade = {
  /**
   * Get map configuration including municipality coordinates.
   * GET /pesquisa/config
   */
  async getConfig(): Promise<PesquisaConfig> {
    try {
      const response = await fetchWithAuth(`${getApiBase()}/pesquisa/config`);
      if (!response.ok) return {};
      const json = await response.json() as unknown;
      if (json && typeof json === "object") {
        const obj = json as Record<string, unknown>;
        // Handle envelope
        if (obj.data && typeof obj.data === "object") return obj.data as PesquisaConfig;
        return obj as PesquisaConfig;
      }
      return {};
    } catch {
      return {};
    }
  },
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
   */
  async reverseGeocoding(lat: number, lng: number): Promise<string | null> {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });

    let response: Response;
    try {
      response = await fetchWithAuth(
        `${getApiBase()}/pesquisa/reverse-geocoding?${params.toString()}`,
      );
    } catch {
      return null;
    }

    if (!response.ok) return null;

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return null;
    }

    return extractPlaceName(json);
  },
};
