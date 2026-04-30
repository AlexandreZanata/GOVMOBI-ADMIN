# Implementation Plan

## Overview

This task list implements the fix for the location search bug where private organization locations (secretarias, prédios internos) are not appearing in LocationPicker search results. The implementation follows the exploratory bugfix workflow: explore the bug first, write preservation tests, then implement the fix.

---

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Private Locations Missing from Search Results
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - search queries that match existing private locations
  - Test implementation details from Bug Condition in design:
    - Create test database with sample private locations (e.g., "Secretaria de Educação", "Prédio Administrativo", "Almoxarifado Central")
    - Generate property-based test: for all queries matching private location names (length >= 2), the API response should include those private locations
    - Use @fast-check/vitest to generate various search queries
    - Assert that response includes GeocodingFeature objects with matching private locations
    - Assert each private location has correct format: `{ address, placeName, lng, lat }`
  - The test assertions should match the Expected Behavior Properties from design:
    - Results include both Mapbox public locations AND matching private locations
    - Each private location is formatted as GeocodingFeature
    - Private locations have all required fields (address, placeName, lng, lat)
  - Run test on UNFIXED code (before modifying GET /pesquisa/geocoding endpoint)
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause:
    - Which private locations are missing from results?
    - Does the endpoint query the database at all?
    - Are results only coming from Mapbox?
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Public Location Search Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (public location searches):
    - Test search for "Avenida Paulista" - observe Mapbox results returned
    - Test search for "São Paulo" - observe city results returned
    - Test search with proximity parameter - observe results are ordered by distance
    - Test search with query < 2 characters - observe no results returned
    - Test search with invalid/empty query - observe error handling
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - Property: For all queries that do NOT match private locations, results are identical to original Mapbox-only behavior
    - Property: For all queries with proximity parameter, results maintain distance-based ordering
    - Property: For all queries < 2 characters, no API call is made and no results are shown
    - Property: For all API errors, error is handled gracefully (results cleared, dropdown closed)
  - Property-based testing generates many test cases for stronger guarantees
  - Use @fast-check/vitest to generate various public location queries
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3. Fix for private locations not appearing in search results

  - [x] 3.1 Create private_locations database table (if not exists)
    - Create migration file for private_locations table
    - Schema should include: id (UUID), name (VARCHAR 255), address (VARCHAR 500), latitude (DECIMAL 10,8), longitude (DECIMAL 11,8), description (TEXT), category (VARCHAR 100), is_active (BOOLEAN), created_at, updated_at
    - Add indexes: idx_private_locations_name, idx_private_locations_active
    - Run migration to create table
    - Seed table with sample private locations for testing (Secretaria de Educação, Prédio Administrativo, etc.)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Create database query function for private locations
    - Create function to query private_locations table by name (case-insensitive LIKE or full-text search)
    - Function should accept: searchQuery (string), isActive filter (boolean, default true)
    - Function should return: array of private location records with fields: id, name, address, latitude, longitude
    - Add unit tests for query function with various search terms
    - Test edge cases: empty query, special characters, partial matches, no results
    - _Requirements: 2.1, 2.3_

  - [x] 3.3 Create transformation function for private location data
    - Create function to transform database records to GeocodingFeature format
    - Input: array of private location database records
    - Output: array of GeocodingFeature objects `{ address, placeName, lng, lat }`
    - Mapping: name → placeName, address → address, longitude → lng, latitude → lat
    - Handle null/missing fields gracefully (skip records with missing required fields)
    - Add unit tests for transformation function
    - Test edge cases: null address, missing coordinates, empty array
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.4 Modify GET /pesquisa/geocoding endpoint to query and merge private locations
    - Locate backend endpoint handler for GET /pesquisa/geocoding
    - Add call to private location query function with search query parameter
    - Transform private location results to GeocodingFeature format
    - Call Mapbox API as before to get public locations
    - Merge results: private locations first (prioritized), then Mapbox results
    - Maintain existing response format (array of GeocodingFeature or envelope format)
    - Add error handling: if private location query fails, log error but continue with Mapbox results only
    - _Bug_Condition: isBugCondition(input) where input.query.length >= 2 AND existsPrivateLocationMatching(input.query) AND NOT privateLocationInResults(input.query)_
    - _Expected_Behavior: For all inputs where isBugCondition is true, response includes both Mapbox public locations AND matching private locations formatted as GeocodingFeature_
    - _Preservation: For all inputs where isBugCondition is false (public location searches), response is identical to original Mapbox-only behavior_
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.5 Add unit tests for endpoint with private location merging
    - Test endpoint returns private locations when query matches
    - Test endpoint returns Mapbox results when no private locations match
    - Test endpoint returns merged results when both private and public locations match
    - Test endpoint handles private location query errors gracefully
    - Test endpoint maintains response format compatibility
    - Test edge cases: empty query, query < 2 characters, special characters
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 3.6 (Optional) Add proximity filtering for private locations
    - If proximity parameter is provided, calculate distance from proximity point to each private location
    - Sort private locations by distance (closest first)
    - Maintain Mapbox proximity behavior for public locations
    - Add unit tests for proximity filtering with private locations
    - _Requirements: 3.3_

  - [x] 3.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Private Locations Appear in Search Results
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify that private locations now appear in search results
    - Verify that each private location has correct GeocodingFeature format
    - Verify that both private and public locations are returned when both match
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Public Location Search Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all preservation tests still pass after fix:
      - Public location searches return same Mapbox results as before
      - Proximity parameter still works correctly
      - Query validation (< 2 characters) still works
      - Error handling still works gracefully
    - Confirm no regressions in LocationPicker component behavior
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite: `npm run test`
  - Verify all unit tests pass (database query, transformation, endpoint)
  - Verify all property-based tests pass (bug condition, preservation)
  - Verify all integration tests pass (if any)
  - Run TypeScript compiler: `npx tsc --noEmit`
  - Run linter: `npm run lint`
  - Manually test LocationPicker in browser:
    - Search for private location (e.g., "Secretaria de Educação") - verify it appears in results
    - Select private location - verify coordinates are filled correctly
    - Search for public location (e.g., "Avenida Paulista") - verify Mapbox results still work
    - Test proximity parameter - verify results are ordered by distance
  - If any tests fail or issues are found, investigate and fix before proceeding
  - Ask user if questions arise or if manual testing reveals unexpected behavior

---

## Notes

- **Testing Framework**: Use Vitest with @fast-check/vitest for property-based tests
- **Database**: Ensure test database is set up with sample private locations before running tests
- **MSW**: Update MSW handlers if needed to mock private location database queries in frontend tests
- **Backend Location**: Endpoint handler location needs to be determined based on backend structure (Next.js API routes or separate backend service)
- **Migration**: Database migration should be reversible (include down migration)
- **Seeding**: Consider creating a seed script for private locations to facilitate testing and development
