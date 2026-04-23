# Requirements Document — Authentication Enhancements

## Introduction

This document specifies enhancements to the existing authentication system in GOVMOBI-ADMIN, focusing on ensuring all authentication APIs are consumed correctly, the token refresh mechanism is robust and reliable, and the token persistence strategy aligns with security best practices. This enhancement builds upon the existing authentication implementation (`.kiro/specs/authentication/`) and addresses gaps in API consumption, token lifecycle management, and error handling.

## Glossary

- **Auth_Facade**: The API abstraction layer at `src/facades/authFacade.ts` responsible for all `/auth/*` endpoint calls and token management.
- **Token_Pair**: The combination of an access token (short-lived) and a refresh token (long-lived) returned by login and refresh endpoints.
- **Refresh_Mutex**: The pattern that ensures only one token refresh request is in flight at a time, preventing concurrent refresh calls.
- **fetchWithAuth**: The authenticated fetch wrapper in `authFacade.ts` that automatically attaches the Bearer token and handles 401 responses with silent refresh.
- **Auth_Store**: The Zustand store at `src/stores/authStore.ts` holding client-side session state.
- **Session_Storage**: Browser sessionStorage API used for token persistence (survives page refresh, cleared on tab close).
- **Change_Password_Dialog**: A modal dialog component for authenticated users to change their password.
- **Admin_Shell**: The authenticated layout wrapper at `src/components/organisms/AdminShell.tsx` containing the topbar and sidebar.

## Requirements

### Requirement 1: Token Persistence Strategy Validation

**User Story:** As a security-conscious system, I want tokens stored using the most secure method available, so that session data is protected from XSS attacks while maintaining usability.

#### Acceptance Criteria

1. THE Auth_Facade SHALL store both access token and refresh token in sessionStorage under keys `govmobile.access_token` and `govmobile.refresh_token`.
2. WHEN the browser tab is closed, THE Session_Storage SHALL automatically clear all stored tokens.
3. WHEN the user refreshes the page, THE Auth_Facade SHALL load tokens from sessionStorage on module initialization.
4. THE Auth_Facade SHALL never write tokens to localStorage.
5. WHEN tokens are cleared (logout or refresh failure), THE Auth_Facade SHALL remove both keys from sessionStorage.

### Requirement 2: Token Refresh Mechanism Robustness

**User Story:** As an authenticated user, I want my session to remain active transparently across all API calls, so that I am not interrupted during my work.

#### Acceptance Criteria

1. WHEN any authenticated API request returns a 401 response, THE fetchWithAuth wrapper SHALL attempt a silent token refresh before failing the request.
2. WHEN the refresh succeeds, THE fetchWithAuth wrapper SHALL retry the original failed request exactly once with the new access token.
3. WHILE a token refresh is in progress, THE Refresh_Mutex SHALL prevent concurrent refresh calls by reusing the same refresh promise.
4. WHEN the refresh completes (success or failure), THE Refresh_Mutex SHALL reset the shared promise to null.
5. IF the refresh fails with any non-200 response, THEN THE Auth_Facade SHALL clear all tokens and set `isAuthenticated` to false in the Auth_Store.
6. WHEN the refresh token is missing or null, THE fetchWithAuth wrapper SHALL NOT attempt a refresh and SHALL immediately throw the 401 error.

### Requirement 3: Comprehensive API Endpoint Coverage

**User Story:** As a developer, I want all authentication API endpoints consumed correctly, so that the system uses all available backend functionality.

#### Acceptance Criteria

1. THE Auth_Facade SHALL expose a `login(cpf, senha)` method that calls POST `/auth/login` and returns an AuthUser.
2. THE Auth_Facade SHALL expose a `me()` method that calls GET `/auth/me` via fetchWithAuth and returns an AuthUser.
3. THE Auth_Facade SHALL expose a `refresh()` method that calls POST `/auth/refresh` with the Refresh_Mutex pattern and returns a Token_Pair.
4. THE Auth_Facade SHALL expose a `logout()` method that calls POST `/auth/logout` and clears all tokens.
5. THE Auth_Facade SHALL expose an `activate(id)` method that calls POST `/auth/activate/{id}` via fetchWithAuth and returns a Servidor.
6. THE Auth_Facade SHALL expose a `changePassword(senhaAntiga, novaSenha)` method that calls POST `/auth/change-password` via fetchWithAuth.

### Requirement 4: Change Password Functionality

**User Story:** As an authenticated user, I want to change my password, so that I can maintain account security.

#### Acceptance Criteria

1. THE Admin_Shell SHALL display a "Change Password" action in the user profile dropdown menu.
2. WHEN the user clicks "Change Password", THE Admin_Shell SHALL open the Change_Password_Dialog.
3. THE Change_Password_Dialog SHALL render a form with three fields: "Current Password", "New Password", and "Confirm New Password".
4. THE Change_Password_Dialog SHALL validate that the new password is at least 8 characters long.
5. THE Change_Password_Dialog SHALL validate that "New Password" and "Confirm New Password" match before allowing submission.
6. WHEN the user submits the form with valid data, THE Auth_Facade SHALL call POST `/auth/change-password` with `{ senhaAntiga, novaSenha }`.
7. WHEN the API returns a 200 response, THE Change_Password_Dialog SHALL display a success message and close after 2 seconds.
8. WHEN the API returns a 401 response, THE Change_Password_Dialog SHALL display an error message indicating the current password is incorrect.
9. WHEN the API returns a 422 response, THE Change_Password_Dialog SHALL display inline validation errors from the API response.
10. THE Change_Password_Dialog SHALL use the `auth` i18n namespace for all user-visible strings.

### Requirement 5: Token Refresh Error Handling

**User Story:** As a user whose refresh token has expired, I want to be redirected to login with context, so that I understand why my session ended.

#### Acceptance Criteria

1. WHEN the token refresh fails with a 401 response, THE Auth_Facade SHALL clear all tokens from memory and sessionStorage.
2. WHEN the token refresh fails, THE Auth_Store SHALL call `clearSession()` to reset user state.
3. WHEN the token refresh fails while the user is on an authenticated page, THE Auth_Guard SHALL redirect to `/login?reason=session_expired`.
4. WHEN the Login_Page loads with `?reason=session_expired`, THE Login_Page SHALL display an informational message: "Your session has expired. Please log in again."
5. THE session expiry message SHALL use `role="status"` for screen reader announcement.

### Requirement 6: API Response Envelope Handling

**User Story:** As a developer, I want consistent API response parsing, so that all auth endpoints are handled uniformly.

#### Acceptance Criteria

1. THE Auth_Facade SHALL use `handleApiResponse<T>()` for endpoints that return data directly (login, refresh).
2. THE Auth_Facade SHALL use `handleEnvelopedResponse<T>()` for endpoints that return `{ success, data, timestamp }` envelopes (activate).
3. WHEN the login endpoint returns `{ accessToken, refreshToken }` directly, THE Auth_Facade SHALL handle it without unwrapping an envelope.
4. WHEN the login endpoint returns `{ success: true, data: { accessToken, refreshToken } }`, THE Auth_Facade SHALL unwrap the envelope and extract the Token_Pair from the `data` field.
5. THE Auth_Facade SHALL handle both response formats for backward compatibility with different backend versions.

### Requirement 7: Network Error Handling

**User Story:** As a user experiencing network issues, I want clear error messages, so that I understand the problem is not with my credentials.

#### Acceptance Criteria

1. WHEN any auth API call fails with a network error (fetch throws), THE Auth_Facade SHALL throw an ApiError with code `NETWORK_ERROR`.
2. WHEN the Login_Page receives a `NETWORK_ERROR`, THE Login_Page SHALL display a user-friendly message: "Network connection failed. Please check your internet connection and try again."
3. WHEN the Change_Password_Dialog receives a `NETWORK_ERROR`, THE Change_Password_Dialog SHALL display the same network error message.
4. THE network error message SHALL use the `auth.errors.networkError` i18n key.

### Requirement 8: Token Refresh Retry Logic

**User Story:** As a user with an intermittent network connection, I want the system to retry failed refresh attempts, so that temporary network issues don't force me to log in again.

#### Acceptance Criteria

1. WHEN the token refresh fails with a network error (not a 401), THE Auth_Facade SHALL retry the refresh request up to 2 times with exponential backoff (1s, 2s).
2. IF all retry attempts fail, THEN THE Auth_Facade SHALL clear tokens and trigger the session expiry flow.
3. WHEN the token refresh fails with a 401 response, THE Auth_Facade SHALL NOT retry and SHALL immediately clear tokens.
4. THE retry logic SHALL only apply to network errors and 5xx server errors, not to 4xx client errors.

### Requirement 9: Concurrent Request Handling During Refresh

**User Story:** As a user with multiple API requests in flight, I want all requests to wait for a single token refresh, so that the system doesn't make redundant refresh calls.

#### Acceptance Criteria

1. WHEN multiple authenticated requests return 401 responses simultaneously, THE fetchWithAuth wrapper SHALL trigger exactly one refresh call.
2. WHILE the refresh is in progress, THE fetchWithAuth wrapper SHALL queue all 401-triggered requests.
3. WHEN the refresh succeeds, THE fetchWithAuth wrapper SHALL retry all queued requests with the new access token.
4. WHEN the refresh fails, THE fetchWithAuth wrapper SHALL fail all queued requests with the same error.
5. THE Refresh_Mutex SHALL use a shared promise stored in a module-scoped variable to coordinate concurrent requests.

### Requirement 10: Change Password Hook

**User Story:** As a developer, I want a TanStack Query hook for password changes, so that the component follows the established data flow pattern.

#### Acceptance Criteria

1. THE `useChangePassword` hook SHALL use `useMutation` to call `authFacade.changePassword(senhaAntiga, novaSenha)`.
2. THE `useChangePassword` hook SHALL return `mutate`, `isPending`, `isError`, `error`, and `isSuccess`.
3. WHEN the mutation succeeds, THE `useChangePassword` hook SHALL display a success toast using `sonner`.
4. WHEN the mutation fails, THE `useChangePassword` hook SHALL NOT display a toast (the dialog handles error display).
5. THE `useChangePassword` hook SHALL be located at `src/hooks/auth/useChangePassword.ts`.

### Requirement 11: Change Password Dialog Accessibility

**User Story:** As a user with assistive technology, I want the change password dialog to be fully accessible, so that I can change my password without barriers.

#### Acceptance Criteria

1. THE Change_Password_Dialog SHALL be navigable entirely via keyboard with logical tab order: Current Password → New Password → Confirm New Password → Cancel → Submit.
2. THE Change_Password_Dialog SHALL set `aria-invalid="true"` on inputs that have validation errors.
3. THE Change_Password_Dialog SHALL link error messages to their inputs via `aria-describedby`.
4. WHEN the form is submitting, THE Change_Password_Dialog SHALL set `aria-busy="true"` on the submit button and disable all inputs.
5. THE Change_Password_Dialog SHALL trap focus within the modal while open.
6. WHEN the dialog opens, THE Change_Password_Dialog SHALL focus the "Current Password" input.
7. THE Change_Password_Dialog SHALL close when the user presses Escape.

### Requirement 12: Token Lifecycle Logging

**User Story:** As a developer debugging authentication issues, I want token lifecycle events logged, so that I can trace token refresh and expiry flows.

#### Acceptance Criteria

1. WHEN tokens are saved, THE Auth_Facade SHALL log "Tokens saved" to the console in development mode only.
2. WHEN tokens are cleared, THE Auth_Facade SHALL log "Tokens cleared" to the console in development mode only.
3. WHEN a token refresh is triggered, THE Auth_Facade SHALL log "Token refresh initiated" to the console in development mode only.
4. WHEN a token refresh succeeds, THE Auth_Facade SHALL log "Token refresh succeeded" to the console in development mode only.
5. WHEN a token refresh fails, THE Auth_Facade SHALL log "Token refresh failed: [reason]" to the console in development mode only.
6. THE logging SHALL check `process.env.NODE_ENV === "development"` before logging.

### Requirement 13: Auth Facade Type Safety

**User Story:** As a developer, I want strong TypeScript types for all auth operations, so that I catch errors at compile time.

#### Acceptance Criteria

1. THE Auth_Facade SHALL define a `ChangePasswordInput` interface with `senhaAntiga: string` and `novaSenha: string` fields.
2. THE `changePassword` method SHALL accept `senhaAntiga` and `novaSenha` as separate parameters, not a payload object.
3. THE `changePassword` method SHALL return `Promise<void>` (204 No Content response).
4. THE Auth_Facade SHALL export all auth-related types: `AuthUser`, `TokenPair`, `LoginInput`, `RegisterInput`, `ChangePasswordInput`.
5. THE `fetchWithAuth` function SHALL be exported for use by other facades.

### Requirement 14: MSW Mock Handler for Change Password

**User Story:** As a developer, I want an MSW handler for the change password endpoint, so that I can develop and test the feature without a running backend.

#### Acceptance Criteria

1. THE MSW auth handlers SHALL simulate POST `/auth/change-password` with realistic latency (200–500ms).
2. WHEN the request body contains `{ senhaAntiga: "password", novaSenha: "newpassword" }`, THE MSW handler SHALL return 204 No Content.
3. WHEN the request body contains an incorrect `senhaAntiga`, THE MSW handler SHALL return 401 with `{ code: "UNAUTHORIZED", message: "Current password is incorrect" }`.
4. WHEN the request body contains a `novaSenha` shorter than 8 characters, THE MSW handler SHALL return 422 with `{ code: "VALIDATION_ERROR", message: "Password must be at least 8 characters", field: "novaSenha" }`.
5. THE MSW handler SHALL check for a valid Authorization header and return 401 if missing.

### Requirement 15: Integration with Existing Auth System

**User Story:** As a developer, I want the enhancements to integrate seamlessly with the existing auth system, so that no existing functionality is broken.

#### Acceptance Criteria

1. THE Auth_Facade enhancements SHALL NOT modify the existing `login`, `me`, `refresh`, `logout`, or `activate` method signatures.
2. THE Auth_Facade enhancements SHALL NOT change the token storage location (sessionStorage keys remain the same).
3. THE Auth_Facade enhancements SHALL NOT modify the Auth_Store interface or actions.
4. THE existing `useLogin`, `useCurrentUser`, `useLogout`, and `useActivateServidor` hooks SHALL continue to work without modification.
5. THE existing Login_Page, Auth_Guard, and AdminShell components SHALL continue to work without modification (except for adding the Change Password menu item).
