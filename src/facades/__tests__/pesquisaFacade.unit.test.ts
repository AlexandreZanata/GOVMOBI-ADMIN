/**
 * Unit Tests for pesquisaFacade — Private Location Merging
 *
 * Tests the transformation functions and endpoint behavior after the fix.
 * Validates: Requirements 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

import {
  pesquisaFacade,
  transformPrivateLocation,
  transformPrivateLocations,
} from "@/facades/pesquisaFacade";
import { pesquisaHandlers, mockPrivateLocations } from "@/msw/pesquisaHandlers";
import type { PrivateLocation } from "@/types/pesquisa";

// ─── Transformation Function Tests ───────────────────────────────────────────

describe("transformPrivateLocation", () => {
  it("should transform a valid PrivateLocation to GeocodingFeature", () => {
    const location: PrivateLocation = {
      id: "test-001",
      name: "Secretaria de Educação",
      address: "Rua das Flores, 123 - Centro",
      latitude: -23.5505,
      longitude: -46.6333,
      isActive: true,
    };

    const result = transformPrivateLocation(location);

    expect(result).not.toBeNull();
    expect(result?.placeName).toBe("Secretaria de Educação");
    expect(result?.address).toBe("Rua das Flores, 123 - Centro");
    expect(result?.lat).toBe(-23.5505);
    expect(result?.lng).toBe(-46.6333);
  });

  it("should use name as address fallback when address is missing", () => {
    const location: PrivateLocation = {
      id: "test-002",
      name: "Prédio Administrativo",
      address: "",
      latitude: -23.5515,
      longitude: -46.6343,
      isActive: true,
    };

    const result = transformPrivateLocation(location);

    expect(result).not.toBeNull();
    expect(result?.address).toBe("Prédio Administrativo");
  });

  it("should return null when name is missing", () => {
    const location = {
      id: "test-003",
      name: "",
      address: "Rua Teste, 1",
      latitude: -23.5505,
      longitude: -46.6333,
      isActive: true,
    } as PrivateLocation;

    const result = transformPrivateLocation(location);
    expect(result).toBeNull();
  });

  it("should return null when latitude is not a finite number", () => {
    const location: PrivateLocation = {
      id: "test-004",
      name: "Local Inválido",
      address: "Rua Teste, 1",
      latitude: NaN,
      longitude: -46.6333,
      isActive: true,
    };

    const result = transformPrivateLocation(location);
    expect(result).toBeNull();
  });

  it("should return null when longitude is not a finite number", () => {
    const location: PrivateLocation = {
      id: "test-005",
      name: "Local Inválido",
      address: "Rua Teste, 1",
      latitude: -23.5505,
      longitude: Infinity,
      isActive: true,
    };

    const result = transformPrivateLocation(location);
    expect(result).toBeNull();
  });
});

describe("transformPrivateLocations", () => {
  it("should transform an array of valid locations", () => {
    const locations: PrivateLocation[] = mockPrivateLocations.slice(0, 2);
    const results = transformPrivateLocations(locations);

    expect(results).toHaveLength(2);
    results.forEach((r) => {
      expect(r).toHaveProperty("placeName");
      expect(r).toHaveProperty("address");
      expect(r).toHaveProperty("lat");
      expect(r).toHaveProperty("lng");
    });
  });

  it("should filter out invalid locations", () => {
    const locations: PrivateLocation[] = [
      { id: "1", name: "Válido", address: "Rua 1", latitude: -23.5, longitude: -46.6, isActive: true },
      { id: "2", name: "", address: "Rua 2", latitude: -23.5, longitude: -46.6, isActive: true }, // invalid: no name
      { id: "3", name: "Válido 2", address: "Rua 3", latitude: NaN, longitude: -46.6, isActive: true }, // invalid: NaN lat
    ];

    const results = transformPrivateLocations(locations);
    expect(results).toHaveLength(1);
    expect(results[0].placeName).toBe("Válido");
  });

  it("should return empty array for empty input", () => {
    const results = transformPrivateLocations([]);
    expect(results).toEqual([]);
  });
});

// ─── Endpoint Behavior Tests (with MSW) ──────────────────────────────────────

const server = setupServer(...pesquisaHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("pesquisaFacade.geocoding — after fix", () => {
  it("should return private locations when query matches", async () => {
    const results = await pesquisaFacade.geocoding("Secretaria");

    const secretaria = results.find((r) => r.placeName === "Secretaria de Educação");
    expect(secretaria).toBeDefined();
    expect(secretaria?.address).toBe("Rua das Flores, 123 - Centro");
    expect(secretaria?.lat).toBe(-23.5505);
    expect(secretaria?.lng).toBe(-46.6333);
  });

  it("should return Mapbox results when no private locations match", async () => {
    const results = await pesquisaFacade.geocoding("Avenida Paulista");

    expect(results.length).toBeGreaterThan(0);
    const avenida = results.find((r) => r.placeName === "Avenida Paulista");
    expect(avenida).toBeDefined();
  });

  it("should return merged results when both private and public locations match", async () => {
    const results = await pesquisaFacade.geocoding("Prefeitura");

    // Private location
    const privateLocation = results.find((r) => r.placeName === "Prefeitura Municipal");
    expect(privateLocation).toBeDefined();

    // Public Mapbox location
    const publicLocation = results.find((r) => r.placeName === "Prefeitura de São Paulo");
    expect(publicLocation).toBeDefined();

    // Private locations should come first
    const privateIdx = results.findIndex((r) => r.placeName === "Prefeitura Municipal");
    const publicIdx = results.findIndex((r) => r.placeName === "Prefeitura de São Paulo");
    expect(privateIdx).toBeLessThan(publicIdx);
  });

  it("should return empty array for query shorter than 2 characters", async () => {
    const results = await pesquisaFacade.geocoding("S");
    expect(results).toEqual([]);
  });

  it("should return empty array for empty query", async () => {
    const results = await pesquisaFacade.geocoding("");
    expect(results).toEqual([]);
  });

  it("should handle API errors gracefully and return empty array", async () => {
    server.use(
      http.get("*/pesquisa/geocoding", () => {
        return HttpResponse.error();
      }),
    );

    const results = await pesquisaFacade.geocoding("Secretaria");
    expect(results).toEqual([]);
  });

  it("should handle non-ok API response gracefully", async () => {
    server.use(
      http.get("*/pesquisa/geocoding", () => {
        return HttpResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }),
    );

    const results = await pesquisaFacade.geocoding("Secretaria");
    expect(results).toEqual([]);
  });

  it("should accept proximity parameter and return results", async () => {
    const proximity = { lat: -23.5505, lng: -46.6333 };
    const results = await pesquisaFacade.geocoding("Secretaria", proximity);

    expect(Array.isArray(results)).toBe(true);
    const secretaria = results.find((r) => r.placeName === "Secretaria de Educação");
    expect(secretaria).toBeDefined();
  });

  it("should return all results with valid GeocodingFeature format", async () => {
    const results = await pesquisaFacade.geocoding("Secretaria");

    results.forEach((result) => {
      expect(typeof result.address).toBe("string");
      expect(typeof result.placeName).toBe("string");
      expect(typeof result.lat).toBe("number");
      expect(typeof result.lng).toBe("number");
      expect(Number.isFinite(result.lat)).toBe(true);
      expect(Number.isFinite(result.lng)).toBe(true);
    });
  });

  it("should return multiple private locations matching the same query", async () => {
    const results = await pesquisaFacade.geocoding("Secretaria");

    const secretarias = results.filter((r) =>
      r.placeName.toLowerCase().includes("secretaria"),
    );
    // Both "Secretaria de Educação" and "Secretaria de Saúde" should appear
    expect(secretarias.length).toBeGreaterThanOrEqual(2);
  });
});
