/**
 * Types for the /pesquisa endpoints (geocoding, config, reverse-geocoding).
 */

/**
 * Represents a private/internal organization location stored in the backend database.
 * These locations are merged with Mapbox public results in GET /pesquisa/geocoding.
 */
export interface PrivateLocation {
  /** Unique identifier */
  id: string;
  /** Display name of the location (e.g., "Secretaria de Educação") */
  name: string;
  /** Full address string */
  address: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Whether this location is active and should appear in search results */
  isActive: boolean;
}
