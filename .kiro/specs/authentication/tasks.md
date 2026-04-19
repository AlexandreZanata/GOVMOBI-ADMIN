# Implementation Plan: Authentication

## Overview

Implements the full authentication lifecycle for GOVMOBI-ADMIN: data models, CPF/phone utilities, auth facade with in-memory token management and `fetchWithAuth`, Zustand session store, TanStack Query hooks, MSW handlers, AuthGuard, login page/form, registration page/form, admin layout wiring, and i18n. The implementation follows the project's mandatory Facade → Hook → Component data flow and uses TypeScript throughout.

## Tasks

- [x] 1. Create auth data models and utility functions
  - [x] 1.1 Create `src/models/Auth.ts` with `AuthUser`, `TokenPair`, `LoginInput`, `RegisterInput` interfaces and `authKeys` query key factory
    - Import `Permission` from `@/models/Permission` and `UserRole` from `@/models/User`
    - Export `AuthUser` (id, nome, cpf, email, role, permissions), `TokenPair` (accessToken, refreshToken), `LoginInput` (cpf, senha), `RegisterInput` (nome, cpf, email, telefone, cargoId, lotacaoId, senha)
    - Export `authKeys` object with `all` and `me` query key factories
    - Add barrel export from `src/models/index.ts`
    - _Requirements: 5.2, 13.1_

  - [x] 1.2 Create `src/lib/cpfUtils.ts` — consolidate existing `formatCpf` and add `unformatCpf`, `isValidCpfFormat`
    - Move and re-export `formatCpf` from existing `src/lib/formatCpf.ts` (keep backward-compatible re-export in old file)
    - Implement `unformatCpf(value: string): string` — strips all non-digit characters
    - Implement `isValidCpfFormat(value: string): boolean` — returns true if exactly 11 digits after unformatting
    - Include JSDoc on all exported functions
    - _Requirements: 1.3, 2.3, 10.2, 11.2_

  - [x] 1.3 Create `src/lib/phoneUtils.ts` with `formatPhone` and `unformatPhone`
    - `formatPhone` applies `(XX) XXXXX-XXXX` mask for 11 digits, `(XX) XXXX-XXXX` for 10 digits
    - `unformatPhone` strips all non-digit characters
    - Include JSDoc on all exported functions
    - _Requirements: 10.2_

  - [ ]* 1.4 Write property tests for CPF round-trip (Property 1)
    - **Property 1: CPF format round-trip**
    - For any string of exactly 11 digits, `unformatCpf(formatCpf(digits))` returns the original string
    - Test file: `src/lib/__tests__/cpfUtils.test.ts`
    - Use `fast-check` with minimum 100 iterations
    - **Validates: Requirements 1.3, 2.3**

  - [ ]* 1.5 Write property tests for phone round-trip (Property 2)
    - **Property 2: Phone format round-trip**
    - For any string of 10 or 11 digits, `unformatPhone(formatPhone(digits))` returns the original string
    - Test file: `src/lib/__tests__/phoneUtils.test.ts`
    - Use `fast-check` with minimum 100 iterations
    - **Validates: Requirements 10.2**

  - [ ]* 1.6 Write unit tests for `cpfUtils` and `phoneUtils` edge cases
    - Test empty string, partial digits, non-digit characters, strings longer than 11 digits
    - Test `isValidCpfFormat` with valid and invalid inputs
    - Add to `src/lib/__tests__/cpfUtils.test.ts` and `src/lib/__tests__/phoneUtils.test.ts`
    - _Requirements: 1.3, 2.3, 10.2_

- [x] 2. Implement auth facade with in-memory token management
  - [x] 2.1 Create `src/facades/authFacade.ts` with all 6 public methods and `fetchWithAuth`
    - Module-scoped `accessToken`, `refreshToken`, and `refreshPromise` variables
    - `login(cpf, senha)`: POST `/auth/login`, store tokens, call `me()`, return `AuthUser`
    - `me()`: GET `/auth/me` via `fetchWithAuth`, unwrap envelope
    - `refresh()`: POST `/auth/refresh` with mutex pattern (shared `refreshPromise`), update tokens
    - `logout()`: POST `/auth/logout`, clear in-memory tokens
    - `register(payload)`: POST `/auth/register`, unwrap envelope
    - `activate(id)`: POST `/auth/activate/{id}` via `fetchWithAuth`, unwrap envelope
    - Use `handleEnvelopedResponse<T>()` from `@/lib/handleApiResponse` for all endpoints
    - Use `BASE_URL` from `process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000"`
    - Throw `ApiError` with code `NETWORK_ERROR` on fetch failures (try/catch around fetch)
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.1, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 10.4, 12.2, 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 2.2 Export `fetchWithAuth` for use by other facades
    - Implement 401 → refresh → retry logic with request queuing
    - Attach `Authorization: Bearer <accessToken>` header on all requests
    - On refresh failure: clear tokens, return error (let caller handle redirect)
    - _Requirements: 4.4, 6.1, 6.2, 6.3, 6.4, 13.4_

  - [ ]* 2.3 Write property test for Bearer token attachment (Property 3)
    - **Property 3: Bearer token attachment**
    - For any URL and options, when an access token is stored, `fetchWithAuth` includes `Authorization: Bearer <token>` header
    - Test file: `src/facades/__tests__/authFacade.test.ts`
    - Use `fast-check` with minimum 100 iterations
    - **Validates: Requirements 4.4, 13.4**

  - [ ]* 2.4 Write property test for 401 → refresh → retry (Property 4)
    - **Property 4: 401 triggers refresh then retry**
    - When `fetchWithAuth` receives a 401, it attempts refresh and retries exactly once with the new token
    - Test file: `src/facades/__tests__/authFacade.test.ts`
    - Use MSW to simulate 401 then success after refresh
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 2.5 Write property test for concurrent refresh deduplication (Property 5)
    - **Property 5: Concurrent refresh deduplication**
    - For N concurrent 401 responses, exactly one POST `/auth/refresh` is issued
    - Test file: `src/facades/__tests__/authFacade.test.ts`
    - **Validates: Requirements 6.4**

  - [ ]* 2.6 Write property test for network error handling (Property 6)
    - **Property 6: Network error produces typed ApiError**
    - For any auth facade method called when network is unavailable, it throws `ApiError` with code `NETWORK_ERROR`
    - Test file: `src/facades/__tests__/authFacade.test.ts`
    - **Validates: Requirements 13.5**

  - [ ]* 2.7 Write property test for API envelope unwrapping (Property 8)
    - **Property 8: API envelope unwrapping preserves data**
    - For any valid data object T, `handleEnvelopedResponse` on a response containing `{ success: true, data: T, timestamp }` returns T unchanged
    - Test file: `src/facades/__tests__/authFacade.test.ts`
    - Use `fast-check` with minimum 100 iterations
    - **Validates: Requirements 3.2, 13.2**

- [x] 3. Checkpoint — Verify models, utilities, and facade
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement auth store and hooks
  - [x] 4.1 Create `src/stores/authStore.ts` — Zustand session store
    - Implement `AuthState` interface: `user`, `isAuthenticated`, `isHydrated`, `redirectUrl`
    - Implement `AuthActions`: `setUser`, `setAuthenticated`, `setHydrated`, `setRedirectUrl`, `clearSession`
    - `setUser` should set both `user` and `isAuthenticated: true`
    - `clearSession` should reset `user` to null and `isAuthenticated` to false
    - _Requirements: 5.2, 5.3, 7.3, 8.1_

  - [x] 4.2 Create `src/hooks/auth/useLogin.ts` — login mutation hook
    - Use `useMutation` calling `authFacade.login()`
    - On success: call `authStore.setUser(user)`, read redirect URL from `sessionStorage`, redirect via `useRouter().push()`
    - Remove `govmobile.redirect_url` from `sessionStorage` after redirect
    - Return `mutate`, `isPending`, `isError`, `error`
    - _Requirements: 8.4, 8.5, 14.1_

  - [x] 4.3 Create `src/hooks/auth/useCurrentUser.ts` — session query hook
    - Use `useQuery` with key `authKeys.me()` calling `authFacade.me()`
    - On success: call `authStore.setUser(data)` and `authStore.setHydrated(true)`
    - On error: call `authStore.setHydrated(true)` (so AuthGuard knows verification is done)
    - Return `isLoading`, `isError`, `data`, `error`
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 14.2_

  - [x] 4.4 Create `src/hooks/auth/useLogout.ts` — logout mutation hook
    - Use `useMutation` calling `authFacade.logout()`
    - On success: call `authStore.clearSession()`, clear TanStack Query cache via `useQueryClient().clear()`, redirect to `/login`
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 14.3_

  - [x] 4.5 Create `src/hooks/auth/useRegister.ts` — registration mutation hook
    - Use `useMutation` calling `authFacade.register()`
    - Return `mutate`, `isPending`, `isError`, `error`
    - _Requirements: 10.4, 14.4_

  - [x] 4.6 Create `src/hooks/auth/useActivateServidor.ts` — activation mutation hook
    - Use `useMutation` calling `authFacade.activate()`
    - On success: invalidate `["servidores"]` query cache, show success toast via `sonner`
    - _Requirements: 12.2, 12.3, 14.5_

  - [ ]* 4.7 Write unit tests for `authStore`
    - Test `setUser` sets user and `isAuthenticated`
    - Test `clearSession` resets state
    - Test `setRedirectUrl` stores URL
    - Test file: `src/stores/__tests__/authStore.test.ts`
    - _Requirements: 5.2, 5.3, 7.3, 8.1_

- [x] 5. Checkpoint — Verify store and hooks
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create MSW auth handlers
  - [x] 6.1 Create `src/msw/authHandlers.ts` with handlers for all 6 auth endpoints
    - POST `/auth/login`: return `TokenPair` on valid credentials (`cpf: "00000000000"`, `senha: "password"`), 401 on invalid, 200–500ms delay
    - GET `/auth/me`: return `AuthUser` when authenticated (check Authorization header), 401 when not
    - POST `/auth/refresh`: return new `TokenPair`, 200–500ms delay
    - POST `/auth/logout`: return 204 No Content
    - POST `/auth/register`: return 201 on success, 409 on duplicate CPF (`00000000000`), 200–500ms delay
    - POST `/auth/activate/:id`: return 200 on success, 404 on invalid ID
    - All success responses wrapped in `{ success: true, data: T, timestamp: string }` envelope
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

  - [x] 6.2 Register auth handlers in `src/msw/browser.ts`
    - Import `authHandlers` and spread into `setupWorker()`
    - _Requirements: 17.1_

- [x] 7. Implement AuthGuard and auth layout
  - [x] 7.1 Create `src/components/organisms/AuthGuard.tsx` — session verification wrapper
    - Use `useCurrentUser` hook to verify session on mount
    - While loading: render full-page skeleton with `aria-busy="true"`
    - On success: render `<PermissionsProvider role={user.role}>` wrapping `children`
    - On auth failure (401 after refresh fails): save current URL to `sessionStorage` under `govmobile.redirect_url`, redirect to `/login?reason=session_expired`
    - On network error: render error state with retry button
    - Include `data-testid="auth-guard"` and appropriate sub-testids
    - _Requirements: 5.5, 8.1, 8.2, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 7.2 Create `src/app/(auth)/layout.tsx` — minimal auth layout (no admin shell)
    - Server component with minimal styling (centered content, no sidebar/topbar)
    - Accept `children` prop and render without `AdminShell`
    - _Requirements: 1.7, 10.10_

  - [x] 7.3 Wire `AuthGuard` into `src/app/(admin)/layout.tsx`
    - Wrap the existing `AdminShell` content with `<AuthGuard>`
    - The admin layout becomes a client component or uses a client wrapper
    - Preserve existing skip-to-content link and sidebar collapse cookie logic
    - _Requirements: 9.1, 9.4_

- [x] 8. Implement login page and form
  - [x] 8.1 Create `src/components/organisms/LoginForm.tsx` — login form organism
    - CPF input with mask (`formatCpf` on change), `autocomplete="username"`, `data-testid="input-cpf"`
    - Password input, `autocomplete="current-password"`, `type="password"`, `data-testid="input-password"`
    - Submit button with loading state, `data-testid="button-login"`
    - Client-side validation: non-empty CPF, valid CPF format (11 digits), non-empty password
    - Inline validation errors with `role="alert"`, `aria-invalid="true"`, `aria-describedby` linking
    - API error display: generic "invalid credentials" for 401, "too many attempts" for 429, generic error for 500/network
    - Error container with `data-testid="error-message"`
    - Session expiry message with `role="status"` when `?reason=session_expired` is present
    - Link to `/register` below the form
    - All strings from `auth` i18n namespace via `useTranslation("auth")`
    - `aria-busy="true"` on submit button while submitting
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 3.3, 3.4, 3.5, 3.6, 8.3, 8.4, 15.1, 15.2, 15.3, 15.4, 15.6, 15.7, 16.1, 16.2_

  - [x] 8.2 Create `src/app/(auth)/login/page.tsx` — login page
    - Render `<LoginForm />` within the auth layout
    - Pass `searchParams` for session expiry reason detection
    - _Requirements: 1.7, 8.3_

- [x] 9. Implement registration page and form
  - [x] 9.1 Create `src/components/organisms/RegisterForm.tsx` — registration form organism
    - Fields: nome, CPF (with mask), email, telefone (with phone mask), cargoId (select), lotacaoId (select), senha, confirmSenha
    - Populate cargoId and lotacaoId selects from existing `useCargos` and `useLotacoes` hooks
    - Client-side validation: all required fields, CPF format, email format, password min 8 chars, password confirmation match
    - Inline validation errors with `role="alert"`, `aria-invalid`, `aria-describedby`
    - API error handling: 409 → CPF already registered on CPF field, 422 → map `error.field` to inline errors
    - Success message on 201 indicating pending admin activation
    - Link to `/login` below the form
    - All strings from `auth` i18n namespace
    - `data-testid` attributes on all inputs and buttons
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 15.5, 15.6, 16.3_

  - [x] 9.2 Create `src/app/(auth)/register/page.tsx` — registration page
    - Render `<RegisterForm />` within the auth layout
    - _Requirements: 10.10_

  - [ ]* 9.3 Write property test for password confirmation validation (Property 7)
    - **Property 7: Password confirmation validation**
    - For any two randomly generated strings, validation rejects when they differ and accepts when identical
    - Test file: `src/components/organisms/__tests__/RegisterForm.test.tsx`
    - Use `fast-check` with minimum 100 iterations
    - **Validates: Requirements 11.5**

- [x] 10. Checkpoint — Verify full auth flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Update i18n and finalize integration
  - [x] 11.1 Update `src/i18n/locales/en/auth.json` with all required auth keys
    - Add keys for: login form labels/placeholders/buttons, validation errors, API errors, session expiry message, registration form labels/placeholders/buttons, registration success message, navigation links
    - Preserve existing keys (`signIn`, `signOut`, `email`, `password`)
    - _Requirements: 1.2, 8.3, 10.9, 16.2_

  - [x] 11.2 Update `src/i18n/locales/pt-BR/auth.json` with matching Portuguese translations
    - Mirror all keys from `en/auth.json` with Portuguese translations
    - Preserve existing keys
    - _Requirements: 1.2, 10.9_

  - [x] 11.3 Add `src/types/auth.ts` with auth-specific API types and update `src/types/index.ts` barrel export
    - Re-export auth model types for consistency with project conventions
    - Add `ApiErrorPayload` field property if not already present
    - _Requirements: 10.7, 13.5_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing `src/lib/formatCpf.ts` is preserved with a re-export for backward compatibility
- The `src/stores/` directory does not exist yet and will be created with the auth store
- Auth i18n namespace files already exist with basic keys — they will be extended, not replaced
- `fast-check` is already installed as a dev dependency
- MSW v2 is already configured with a browser worker in `src/msw/browser.ts`
