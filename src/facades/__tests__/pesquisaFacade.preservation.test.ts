/**
 * Preservation Property Tests for Location Search Private Places Fix
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 *
 * These tests capture the EXISTING behavior of the geocoding endpoint for
 * non-buggy inputs (public location searches). They MUST PASS on unfixed code
 * and MUST CONTINUE TO PASS after the fix is applied.
 *
 * **METHODOLOGY**: Observation-first — we observe behavior on unfixed code first,
 * then encode those observations as properties that must be preserved.
 *
 * **EXPECTED OUTCOME**: All tests PASS (both before and after the fix)
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { fc, test } from "@fast-check/vitest";

import { pesquisaFacade } from "@/facades/pesquisaFacade";
import { pesquisaHandlers } from "@/msw/pesquisaHandlers";

// Setup MSW server for API mocking
const server = setupServer(...pesquisaHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Preservation: Public Location Search Behavior Unchanged", () => {
  /**
   * Property 2a: Queries shorter than 2 characters return empty results
   *
   * Observed on unfixed code: queries with length < 2 return []
   * This behavior MUST be preserved after the fix.
   */
  test.prop([
    fc.string({ minLength: 0, maxLength: 1 }),
  ])("should return empty array for queries shorter than 2 characters", async (shortQuery) => {
    const results = await pesquisaFacade.geocoding(shortQuery);
    expect(results).toEqual([]);
  });

  /**
   * Property 2b: Empty query returns empty results
   *
   * Observed on unfixed code: empty string returns []
   */
  it("should return empty array for empty query", async () => {
    const results = await pesquisaFacade.geocoding("");
    expect(results).toEqual([]);
  });

  /**
   * Property 2c: Results always have valid GeocodingFeature format
   *
   * Observed on unfixed code: all returned items have address, placeName, lng, lat
   * This format MUST be preserved after the fix (including for private locations).
   */
  test.prop([
    fc.constantFrom("Avenida Paulista", "São Paulo", "rua das flores", "avenida principal"),
  ])("should always return results with valid GeocodingFeature format", async (query) => {
    const results = await pesquisaFacade.geocoding(query);

    // Results may be empty (no match) — that's fine
    // But if results exist, they MUST have the correct format
    results.forEach((result) => {
      expect(result).toHaveProperty("address");
      expect(result).toHaveProperty("placeName");
      expect(result).toHaveProperty("lng");
      expect(result).toHaveProperty("lat");
      expect(typeof result.address).toBe("string");
      expect(typeof result.placeName).toBe("string");
      expect(typeof result.lng).toBe("number");
      expect(typeof result.lat).toBe("number");
    });
  });

  /**
   * Property 2d: Results are always an array (never null/undefined)
   *
   * Observed on unfixed code: geocoding always returns an array
   * This MUST be preserved after the fix.
   */
  test.prop([
    fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
  ])("should always return an array (never null or undefined)", async (query) => {
    const results = await pesquisaFacade.geocoding(query);
    expect(Array.isArray(results)).toBe(true);
  });

  /**
   * Property 2e: Public location searches (streets/avenues) return Mapbox results
   *
   * Observed on unfixed code: searching "avenida" or "rua" returns Mapbox street results
   * This MUST be preserved after the fix.
   */
  it("should return Mapbox results when searching for public streets", async () => {
    const results = await pesquisaFacade.geocoding("Avenida Paulista");

    // Should have at least one result from Mapbox
    expect(results.length).toBeGreaterThan(0);

    // All results must have valid format
    results.forEach((result) => {
      expect(typeof result.placeName).toBe("string");
      expect(result.placeName.length).toBeGreaterThan(0);
      expect(typeof result.lat).toBe("number");
      expect(typeof result.lng).toBe("number");
    });
  });

  /**
   * Property 2f: Proximity parameter is accepted without errors
   *
   * Observed on unfixed code: proximity parameter is passed through without errors
   * This MUST be preserved after the fix.
   */
  test.prop([
    fc.record({
      lat: fc.float({ min: Math.fround(-33.75), max: Math.fround(5.27), noNaN: true }),
      lng: fc.float({ min: Math.fround(-73.99), max: Math.fround(-34.79), noNaN: true }),
    }),
  ])("should accept proximity parameter without errors", async (proximity) => {
    // Should not throw — proximity is optional and must be handled gracefully
    const results = await pesquisaFacade.geocoding("São Paulo", proximity);
    expect(Array.isArray(results)).toBe(true);
  });

  /**
   * Property 2g: Coordinates in results are valid numbers (not NaN/Infinity)
   *
   * Observed on unfixed code: lat/lng values are always valid finite numbers
   * This MUST be preserved after the fix (including for private locations).
   */
  test.prop([
    fc.constantFrom("Avenida", "rua", "São Paulo", "Secretaria", "Prédio"),
  ])("should return valid finite coordinates in all results", async (query) => {
    const results = await pesquisaFacade.geocoding(query);

    results.forEach((result) => {
      expect(Number.isFinite(result.lat)).toBe(true);
      expect(Number.isFinite(result.lng)).toBe(true);
      // Latitude must be in valid range [-90, 90]
      expect(result.lat).toBeGreaterThanOrEqual(-90);
      expect(result.lat).toBeLessThanOrEqual(90);
      // Longitude must be in valid range [-180, 180]
      expect(result.lng).toBeGreaterThanOrEqual(-180);
      expect(result.lng).toBeLessThanOrEqual(180);
    });
  });

  /**
   * Example-based: Specific preservation scenarios
   */
  it("should return Mapbox results for city search (São Paulo)", async () => {
    const results = await pesquisaFacade.geocoding("São Paulo");

    expect(results.length).toBeGreaterThan(0);
    const saoPaulo = results.find((r) => r.placeName === "São Paulo");
    expect(saoPaulo).toBeDefined();
  });

  it("should return empty array for single character query", async () => {
    const results = await pesquisaFacade.geocoding("A");
    expect(results).toEqual([]);
  });

  it("should handle whitespace-only query gracefully", async () => {
    const results = await pesquisaFacade.geocoding("  ");
    expect(Array.isArray(results)).toBe(true);
  });
});
