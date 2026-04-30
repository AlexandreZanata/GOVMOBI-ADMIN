/**
 * Bug Condition Exploration Test for Location Search Private Places Fix
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3**
 * 
 * This test explores the bug condition where private organization locations
 * (secretarias, prédios internos) are missing from LocationPicker search results.
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * **DO NOT attempt to fix the test or the code when it fails**
 * **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * **GOAL**: Surface counterexamples that demonstrate the bug exists
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { fc, test } from "@fast-check/vitest";

import { pesquisaFacade } from "@/facades/pesquisaFacade";
import { pesquisaHandlers, mockPrivateLocations } from "@/msw/pesquisaHandlers";

// Setup MSW server for API mocking
const server = setupServer(...pesquisaHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Bug Condition Exploration: Private Locations Missing from Search Results", () => {
  /**
   * Property 1: Bug Condition - Private Locations Missing from Search Results
   * 
   * For any search query that matches a private location name (length >= 2),
   * the API response SHOULD include those private locations.
   * 
   * **EXPECTED OUTCOME**: This test FAILS on unfixed code (proves bug exists)
   * 
   * **Scoped PBT Approach**: We scope the property to concrete failing cases -
   * search queries that match existing private locations in our test database.
   */
  test.prop([
    fc.constantFrom(...mockPrivateLocations.map(loc => loc.name)),
  ])("should return private locations when searching by their name", async (privateLocationName) => {
    // Arrange: We have a private location in the database with this name
    const matchingLocation = mockPrivateLocations.find(
      loc => loc.name === privateLocationName && loc.isActive
    );
    
    expect(matchingLocation).toBeDefined();
    
    // Act: Search for this private location
    const results = await pesquisaFacade.geocoding(privateLocationName);
    
    // Assert: The private location SHOULD appear in results
    // This assertion will FAIL on unfixed code because the endpoint only returns Mapbox results
    const privateLocationInResults = results.some(
      result => result.placeName === privateLocationName
    );
    
    expect(privateLocationInResults).toBe(true);
    
    // Assert: Each result has correct GeocodingFeature format
    results.forEach(result => {
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
   * Property 1b: Bug Condition - Partial Name Matches
   * 
   * For any search query that partially matches a private location name (length >= 2),
   * the API response SHOULD include those private locations.
   */
  test.prop([
    fc.constantFrom(...mockPrivateLocations.map(loc => loc.name)),
    fc.integer({ min: 2, max: 10 }),
  ])("should return private locations when searching by partial name", async (privateLocationName, substringLength) => {
    // Arrange: Extract a substring from the private location name
    const searchQuery = privateLocationName.substring(0, Math.min(substringLength, privateLocationName.length));
    
    // Skip if query is too short
    if (searchQuery.length < 2) return;
    
    // Find all private locations that match this query
    const matchingLocations = mockPrivateLocations.filter(
      loc => loc.isActive && loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Skip if no matches (edge case)
    if (matchingLocations.length === 0) return;
    
    // Act: Search for this partial name
    const results = await pesquisaFacade.geocoding(searchQuery);
    
    // Assert: At least one matching private location SHOULD appear in results
    // This assertion will FAIL on unfixed code
    const hasPrivateLocation = matchingLocations.some(matchingLoc =>
      results.some(result => result.placeName === matchingLoc.name)
    );
    
    expect(hasPrivateLocation).toBe(true);
  });
  
  /**
   * Example-based test: Specific bug scenarios
   * 
   * These are concrete examples that demonstrate the bug clearly.
   */
  it("should return 'Secretaria de Educação' when searching for 'Secretaria'", async () => {
    const results = await pesquisaFacade.geocoding("Secretaria");
    
    const secretariaEducacao = results.find(
      r => r.placeName === "Secretaria de Educação"
    );
    
    expect(secretariaEducacao).toBeDefined();
    expect(secretariaEducacao?.address).toBe("Rua das Flores, 123 - Centro");
    expect(secretariaEducacao?.lng).toBe(-46.6333);
    expect(secretariaEducacao?.lat).toBe(-23.5505);
  });
  
  it("should return 'Prédio Administrativo' when searching for 'Prédio'", async () => {
    const results = await pesquisaFacade.geocoding("Prédio");
    
    const predioAdministrativo = results.find(
      r => r.placeName === "Prédio Administrativo"
    );
    
    expect(predioAdministrativo).toBeDefined();
    expect(predioAdministrativo?.address).toBe("Avenida Principal, 456 - Centro");
  });
  
  it("should return 'Almoxarifado Central' when searching for 'Almoxarifado'", async () => {
    const results = await pesquisaFacade.geocoding("Almoxarifado");
    
    const almoxarifado = results.find(
      r => r.placeName === "Almoxarifado Central"
    );
    
    expect(almoxarifado).toBeDefined();
    expect(almoxarifado?.address).toBe("Rua do Comércio, 789 - Industrial");
  });
  
  it("should return both public and private locations when searching for 'Prefeitura'", async () => {
    const results = await pesquisaFacade.geocoding("Prefeitura");
    
    // Should include the private location
    const privateLocation = results.find(
      r => r.placeName === "Prefeitura Municipal"
    );
    expect(privateLocation).toBeDefined();
    
    // May also include public Mapbox results
    // (This is acceptable - we want BOTH public and private results)
  });
  
  it("should return empty array for queries shorter than 2 characters", async () => {
    const results = await pesquisaFacade.geocoding("S");
    expect(results).toEqual([]);
  });
  
  it("should return empty array for empty query", async () => {
    const results = await pesquisaFacade.geocoding("");
    expect(results).toEqual([]);
  });
});
