import { getApiBase } from "@/lib/apiBase";
import { fetchWithAuth } from "@/facades/authFacade";
import { handleApiResponse } from "@/lib/handleApiResponse";

export interface GeocodingResult {
  place_name: string;
  center: [number, number]; // [lng, lat]
}

export interface GeocodingResponse {
  features: GeocodingResult[];
}

export interface ReverseGeocodingResponse {
  place_name: string;
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
  ): Promise<GeocodingResponse> {
    const params = new URLSearchParams({ q });
    if (proximity) {
      params.set("lat", String(proximity.lat));
      params.set("lng", String(proximity.lng));
    }
    const response = await fetchWithAuth(
      `${getApiBase()}/pesquisa/geocoding?${params.toString()}`,
    );
    return handleApiResponse<GeocodingResponse>(response);
  },

  /**
   * Convert coordinates to a human-readable address.
   * GET /pesquisa/reverse-geocoding?lat=...&lng=...
   */
  async reverseGeocoding(lat: number, lng: number): Promise<ReverseGeocodingResponse> {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    const response = await fetchWithAuth(
      `${getApiBase()}/pesquisa/reverse-geocoding?${params.toString()}`,
    );
    return handleApiResponse<ReverseGeocodingResponse>(response);
  },
};
