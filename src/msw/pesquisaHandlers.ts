import { http, HttpResponse } from "msw";
import type { GeocodingFeature } from "@/facades/pesquisaFacade";

/**
 * Mock private locations database
 * These represent organization-specific locations that should appear in search results
 */
export const mockPrivateLocations: Array<{
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
}> = [
  {
    id: "priv-001",
    name: "Secretaria de Educação",
    address: "Rua das Flores, 123 - Centro",
    latitude: -23.5505,
    longitude: -46.6333,
    isActive: true,
  },
  {
    id: "priv-002",
    name: "Prédio Administrativo",
    address: "Avenida Principal, 456 - Centro",
    latitude: -23.5515,
    longitude: -46.6343,
    isActive: true,
  },
  {
    id: "priv-003",
    name: "Almoxarifado Central",
    address: "Rua do Comércio, 789 - Industrial",
    latitude: -23.5525,
    longitude: -46.6353,
    isActive: true,
  },
  {
    id: "priv-004",
    name: "Secretaria de Saúde",
    address: "Praça da Saúde, 100 - Centro",
    latitude: -23.5535,
    longitude: -46.6363,
    isActive: true,
  },
  {
    id: "priv-005",
    name: "Prefeitura Municipal",
    address: "Praça Central, 1 - Centro",
    latitude: -23.5545,
    longitude: -46.6373,
    isActive: true,
  },
];

/**
 * Mock Mapbox public locations
 * These simulate what Mapbox API would return for public places
 */
function getMockMapboxResults(query: string): GeocodingFeature[] {
  const lowerQuery = query.toLowerCase();
  
  // Simulate Mapbox returning public street/place results
  const mapboxResults: GeocodingFeature[] = [];
  
  if (lowerQuery.includes("avenida") || lowerQuery.includes("rua")) {
    mapboxResults.push({
      address: "Avenida Paulista, São Paulo - SP",
      placeName: "Avenida Paulista",
      lng: -46.6566,
      lat: -23.5614,
    });
  }
  
  if (lowerQuery.includes("são paulo") || lowerQuery.includes("sp")) {
    mapboxResults.push({
      address: "São Paulo, SP, Brasil",
      placeName: "São Paulo",
      lng: -46.6333,
      lat: -23.5505,
    });
  }
  
  if (lowerQuery.includes("prefeitura")) {
    // Mapbox might return a generic public result for "prefeitura"
    mapboxResults.push({
      address: "Viaduto do Chá, 15 - Centro, São Paulo - SP",
      placeName: "Prefeitura de São Paulo",
      lng: -46.6361,
      lat: -23.5475,
    });
  }
  
  return mapboxResults;
}

/**
 * Search private locations by query (case-insensitive)
 */
function searchPrivateLocations(query: string): GeocodingFeature[] {
  const lowerQuery = query.toLowerCase();
  
  return mockPrivateLocations
    .filter((loc) => loc.isActive && loc.name.toLowerCase().includes(lowerQuery))
    .map((loc) => ({
      address: loc.address,
      placeName: loc.name,
      lng: loc.longitude,
      lat: loc.latitude,
    }));
}

/**
 * MSW handlers for /pesquisa endpoints
 */
export const pesquisaHandlers = [
  /**
   * GET /pesquisa/geocoding
   *
   * FIXED BEHAVIOR: Returns both Mapbox public locations AND private organization locations.
   * Private locations are prepended (higher priority) before Mapbox results.
   *
   * Bug fix: Previously only returned Mapbox results, ignoring private locations.
   * Now queries private locations database and merges results.
   */
  http.get("*/pesquisa/geocoding", ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query || query.length < 2) {
      return HttpResponse.json([]);
    }

    // Query private locations (organization-specific places)
    const privateResults = searchPrivateLocations(query);

    // Query Mapbox public locations
    const mapboxResults = getMockMapboxResults(query);

    // Merge: private locations first (prioritized), then Mapbox results
    const mergedResults = [...privateResults, ...mapboxResults];

    return HttpResponse.json(mergedResults);
  }),
  
  /**
   * GET /pesquisa/config
   */
  http.get("*/pesquisa/config", () => {
    return HttpResponse.json({
      mapboxToken: "mock-mapbox-token",
      municipioLat: -23.5505,
      municipioLng: -46.6333,
    });
  }),
  
  /**
   * GET /pesquisa/reverse-geocoding
   */
  http.get("*/pesquisa/reverse-geocoding", ({ request }) => {
    const url = new URL(request.url);
    const lat = url.searchParams.get("lat");
    const lng = url.searchParams.get("lng");
    
    if (!lat || !lng) {
      return HttpResponse.json({ placeName: null });
    }
    
    return HttpResponse.json({
      placeName: `Location at ${lat}, ${lng}`,
      address: `Address for ${lat}, ${lng}`,
    });
  }),
];
