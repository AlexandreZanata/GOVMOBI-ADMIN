# Requirements Document — Authentication

## Introduction

This document specifies the authentication feature for GOVMOBI-ADMIN, covering the complete authentication lifecycle: login via CPF and password, JWT token management, session state, automatic token refresh, logout, self-registration with admin activation, session expiry handling, and protected route guards. The feature integrates with the existing backend API (`/auth/*` endpoints) and follows the project's established Facade → Hook → Component architecture, WCAG 2.1 AA accessibility standards, and i18n requirements.

## Glossary

- **Auth_Facade**: The API abstraction layer (`authFacade.ts`) responsible for all `/auth/*` endpoint calls. Used exclusively by hooks.
- **Auth_Store**: The Zustand store (`authStore.ts`) holding client-side session state: current user, authentication status, and redirect URL.
- **Login_Page**: The page rendered at `/login` within the `(auth)` route group, containing the CPF + password form.
- **Registration_Page**: The page rendered at `/register` within the `(auth)` route group, containing the self-registration form.
- **Auth_Guard**: A client component that wraps the `(admin)` route group layout, verifying authentication before rendering protected content.
- **Token_Pair**: The combination of an access token (15-minute expiry) and a refresh token (8-hour expiry) returned by the login and refresh endpoints.
- **CPF**: Cadastro de Pessoas Físicas — the Brazilian individual taxpayer registry number used as the login identifier.
- **Session**: The authenticated state maintained by valid tokens, populated with user info from `/auth/me`.
- **API_Envelope**: The standard backend response shape `{ success: boolean, data: T, timestamp: string }` used by all auth endpoints.
- **Servidor**: A government employee entity that registers for access and requires admin activation before login is permitted.

## Requirements

### Requirement 1: Login Form Rendering

**User Story:** As a user, I want to see a login form with CPF and password fields, so that I can authenticate into the admin panel.

#### Acceptance Criteria

1. THE Login_Page SHALL render a form with a CPF input field, a password input field, and a submit button.
2. THE Login_Page SHALL use the `auth` i18n namespace for all user-visible strings including labels, placeholders, and button text.
3. THE Login_Page SHALL apply a CPF mask (XXX.XXX.XXX-XX) to the CPF input field as the user types.
4. THE Login_Page SHALL set `autocomplete="username"` on the CPF input and `autocomplete="current-password"` on the password input.
5. THE Login_Page SHALL associate each input with a visible `<label>` element via `htmlFor`/`id` attributes.
6. THE Login_Page SHALL include `data-testid` attributes on the CPF input, password input, submit button, and error message container.
7. THE Login_Page SHALL render without the admin shell (sidebar, topbar) using the `(auth)` route group layout.

### Requirement 2: Login Form Validation

**User Story:** As a user, I want immediate feedback when I submit invalid credentials, so that I can correct my input before the request is sent.

#### Acceptance Criteria

1. WHEN the user submits the login form with an empty CPF field, THE Login_Page SHALL display an inline validation error below the CPF input with `role="alert"`.
2. WHEN the user submits the login form with an empty password field, THE Login_Page SHALL display an inline validation error below the password input with `role="alert"`.
3. WHEN the user submits the login form with a CPF that does not match the 11-digit format, THE Login_Page SHALL display an inline validation error indicating the CPF format is invalid.
4. WHILE the login form has validation errors, THE Login_Page SHALL prevent the form submission to the API.
5. WHEN the user corrects a field that previously had a validation error, THE Login_Page SHALL clear the inline error for that field.

### Requirement 3: Login API Integration

**User Story:** As a user, I want to authenticate with my CPF and password, so that I receive a valid session.

#### Acceptance Criteria

1. WHEN the user submits valid credentials, THE Auth_Facade SHALL send a POST request to `/auth/login` with `{ cpf, senha }` in the request body.
2. WHEN the API returns a 200 response, THE Auth_Facade SHALL unwrap the API_Envelope and return the Token_Pair from the `data` field.
3. WHEN the API returns a 401 response, THE Login_Page SHALL display an error message indicating invalid credentials without revealing which field is incorrect.
4. WHEN the API returns a 429 response, THE Login_Page SHALL display an error message indicating too many attempts and advising the user to wait.
5. IF the API returns a 500 or network error, THEN THE Login_Page SHALL display a generic error message with a retry suggestion.
6. WHILE the login request is in progress, THE Login_Page SHALL disable the submit button and display a loading spinner within the button.

### Requirement 4: Token Storage

**User Story:** As a security-conscious system, I want tokens stored securely, so that they are not exposed to XSS attacks.

#### Acceptance Criteria

1. WHEN the Auth_Facade receives a Token_Pair from the login or refresh endpoint, THE Auth_Facade SHALL store the access token in memory only (a module-scoped variable within the facade).
2. WHEN the Auth_Facade receives a Token_Pair, THE Auth_Facade SHALL store the refresh token in an httpOnly cookie via a Set-Cookie response header, or if the API returns tokens in the response body, store the refresh token in memory alongside the access token.
3. THE Auth_Facade SHALL never write tokens to `localStorage` or `sessionStorage`.
4. THE Auth_Facade SHALL attach the access token as a `Bearer` token in the `Authorization` header of all authenticated API requests.

### Requirement 5: Session Initialization

**User Story:** As an authenticated user, I want my profile information loaded after login, so that the application knows my role and permissions.

#### Acceptance Criteria

1. WHEN the login succeeds and a Token_Pair is stored, THE Auth_Facade SHALL immediately call GET `/auth/me` to retrieve the authenticated user profile.
2. WHEN `/auth/me` returns a 200 response, THE Auth_Store SHALL store the user object (id, nome, cpf, email, role, permissions) in the Zustand session state.
3. WHEN `/auth/me` returns a 200 response, THE Auth_Store SHALL set the `isAuthenticated` flag to `true`.
4. IF `/auth/me` returns a non-200 response after a successful login, THEN THE Login_Page SHALL display an error message and clear any stored tokens.
5. WHEN the application loads on a page refresh, THE Auth_Guard SHALL attempt to call GET `/auth/me` to restore the session from existing tokens.

### Requirement 6: Automatic Token Refresh

**User Story:** As an authenticated user, I want my session to remain active transparently, so that I am not interrupted during my work within the 8-hour session window.

#### Acceptance Criteria

1. WHEN an authenticated API request returns a 401 response, THE Auth_Facade SHALL attempt a silent token refresh by calling POST `/auth/refresh` before failing the original request.
2. WHEN the refresh endpoint returns a 200 response with a new Token_Pair, THE Auth_Facade SHALL update the in-memory access token and retry the original failed request exactly once.
3. IF the refresh endpoint returns a non-200 response, THEN THE Auth_Facade SHALL clear all stored tokens and set `isAuthenticated` to `false` in the Auth_Store.
4. WHILE a token refresh is in progress, THE Auth_Facade SHALL queue any concurrent 401-triggered requests and resolve them after the refresh completes, preventing multiple simultaneous refresh calls.
5. WHEN the refresh token itself is expired or invalid, THE Auth_Facade SHALL trigger the session expiry flow (Requirement 8).

### Requirement 7: Logout

**User Story:** As an authenticated user, I want to log out, so that my session is terminated and tokens are invalidated.

#### Acceptance Criteria

1. WHEN the user triggers the logout action, THE Auth_Facade SHALL send a POST request to `/auth/logout`.
2. WHEN the logout request completes (regardless of success or failure), THE Auth_Facade SHALL clear all in-memory tokens.
3. WHEN the logout request completes, THE Auth_Store SHALL reset the session state: set `user` to `null` and `isAuthenticated` to `false`.
4. WHEN the logout completes, THE Login_Page SHALL be displayed by redirecting the user to `/login`.
5. WHEN the logout completes, THE Auth_Store SHALL clear the TanStack Query cache to remove any cached authenticated data.

### Requirement 8: Session Expiry Handling

**User Story:** As a user whose session has expired, I want to be redirected to the login page with context, so that I can re-authenticate and return to my previous location.

#### Acceptance Criteria

1. WHEN the token refresh fails (refresh token expired or revoked), THE Auth_Store SHALL save the current page URL to `sessionStorage` under the key `govmobile.redirect_url`.
2. WHEN the token refresh fails, THE Auth_Guard SHALL redirect the user to `/login?reason=session_expired`.
3. WHEN the Login_Page loads with `?reason=session_expired` in the URL, THE Login_Page SHALL display an informational message indicating the session has expired.
4. WHEN the user successfully logs in after a session expiry redirect, THE Login_Page SHALL redirect the user to the URL stored in `sessionStorage` under `govmobile.redirect_url`, or to `/` if no URL is stored.
5. WHEN the post-login redirect completes, THE Auth_Store SHALL remove the `govmobile.redirect_url` entry from `sessionStorage`.

### Requirement 9: Protected Route Guard

**User Story:** As the system, I want to prevent unauthenticated users from accessing admin pages, so that protected content is only visible to authenticated users.

#### Acceptance Criteria

1. THE Auth_Guard SHALL wrap the `(admin)` route group layout and verify authentication status before rendering child content.
2. WHILE the Auth_Guard is verifying authentication (calling `/auth/me`), THE Auth_Guard SHALL render a full-page loading skeleton with `aria-busy="true"`.
3. WHEN the Auth_Guard determines the user is not authenticated, THE Auth_Guard SHALL redirect the user to `/login`.
4. WHEN the Auth_Guard determines the user is authenticated, THE Auth_Guard SHALL render the admin layout with the PermissionsProvider configured with the user's role.
5. IF the Auth_Guard encounters a network error during authentication verification, THEN THE Auth_Guard SHALL display an error state with a retry action.

### Requirement 10: Self-Registration Form

**User Story:** As a new government employee, I want to register for an account, so that I can request access to the admin panel.

#### Acceptance Criteria

1. THE Registration_Page SHALL render a form with fields for: nome (full name), CPF, email, telefone (phone), cargoId (position select), lotacaoId (department select), and senha (password).
2. THE Registration_Page SHALL apply a CPF mask (XXX.XXX.XXX-XX) to the CPF input and a phone mask to the telefone input.
3. THE Registration_Page SHALL validate that all required fields are filled before allowing submission.
4. WHEN the user submits the registration form with valid data, THE Auth_Facade SHALL send a POST request to `/auth/register` with the form payload.
5. WHEN the API returns a 201 response, THE Registration_Page SHALL display a success message indicating that the registration is pending admin activation.
6. WHEN the API returns a 409 response (CPF already registered), THE Registration_Page SHALL display an inline error indicating the CPF is already in use.
7. IF the API returns a 422 validation error, THEN THE Registration_Page SHALL display inline errors on the corresponding fields using the `field` property from the error response.
8. THE Registration_Page SHALL include a link to navigate back to the Login_Page.
9. THE Registration_Page SHALL use the `auth` i18n namespace for all user-visible strings.
10. THE Registration_Page SHALL render without the admin shell using the `(auth)` route group layout.

### Requirement 11: Registration Form Validation

**User Story:** As a new user, I want immediate feedback on my registration form, so that I can correct errors before submitting.

#### Acceptance Criteria

1. WHEN the user submits the registration form with an empty nome field, THE Registration_Page SHALL display an inline validation error below the nome input.
2. WHEN the user submits the registration form with a CPF that does not match the 11-digit format, THE Registration_Page SHALL display an inline validation error indicating the CPF format is invalid.
3. WHEN the user submits the registration form with an invalid email format, THE Registration_Page SHALL display an inline validation error below the email input.
4. WHEN the user submits the registration form with a password shorter than 8 characters, THE Registration_Page SHALL display an inline validation error indicating the minimum password length.
5. THE Registration_Page SHALL include a password confirmation field and validate that it matches the password field.
6. WHEN the user submits the registration form without selecting a cargoId, THE Registration_Page SHALL display an inline validation error below the cargo select.
7. WHEN the user submits the registration form without selecting a lotacaoId, THE Registration_Page SHALL display an inline validation error below the lotação select.

### Requirement 12: Admin Activation of Pending Users

**User Story:** As an admin, I want to activate pending user registrations, so that approved employees can access the system.

#### Acceptance Criteria

1. WHEN an admin views the servidores list, THE Servidores_Page SHALL display pending registrations with a visual indicator distinguishing them from active servidores.
2. WHEN an admin clicks the activate action on a pending servidor, THE Auth_Facade SHALL send a POST request to `/auth/activate/{id}`.
3. WHEN the activation API returns a 200 response, THE Servidores_Page SHALL update the servidor status to active and display a success toast.
4. IF the activation API returns a 404 response, THEN THE Servidores_Page SHALL display an error toast indicating the servidor was not found.
5. IF the activation API returns a 403 response, THEN THE Servidores_Page SHALL display an error toast indicating insufficient permissions.
6. THE activate action SHALL only be visible within a `<Can perform={Permission.SERVIDOR_EDIT}>` permission gate.

### Requirement 13: Auth Facade API Layer

**User Story:** As a developer, I want a single facade for all auth API calls, so that the authentication logic is centralized and testable.

#### Acceptance Criteria

1. THE Auth_Facade SHALL expose methods for: `login(cpf, senha)`, `me()`, `refresh()`, `logout()`, `register(payload)`, and `activate(id)`.
2. THE Auth_Facade SHALL use `handleEnvelopedResponse<T>()` to unwrap the `{ success, data, timestamp }` API_Envelope for all auth endpoints.
3. THE Auth_Facade SHALL use the base URL from `process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000"`.
4. THE Auth_Facade SHALL include the `Authorization: Bearer <access_token>` header on requests to `/auth/me`, `/auth/refresh`, and `/auth/logout`.
5. IF a request to any auth endpoint fails with a network error, THEN THE Auth_Facade SHALL throw a typed `ApiError` with code `NETWORK_ERROR`.

### Requirement 14: Auth Hooks Layer

**User Story:** As a developer, I want TanStack Query hooks for auth operations, so that components follow the established data flow pattern.

#### Acceptance Criteria

1. THE `useLogin` hook SHALL use `useMutation` to call `authFacade.login()` and return `mutate`, `isPending`, and `isError`.
2. THE `useCurrentUser` hook SHALL use `useQuery` to call `authFacade.me()` and return the authenticated user profile with `isLoading`, `isError`, and `data`.
3. THE `useLogout` hook SHALL use `useMutation` to call `authFacade.logout()` and on success clear the TanStack Query cache and reset the Auth_Store.
4. THE `useRegister` hook SHALL use `useMutation` to call `authFacade.register()` and return `mutate`, `isPending`, `isError`, and `error`.
5. THE `useActivateServidor` hook SHALL use `useMutation` to call `authFacade.activate()` and on success invalidate the servidores query cache.

### Requirement 15: Accessibility Compliance

**User Story:** As a user with assistive technology, I want the authentication pages to be fully accessible, so that I can log in and register without barriers.

#### Acceptance Criteria

1. THE Login_Page SHALL be navigable entirely via keyboard, with a logical tab order: CPF input → password input → submit button.
2. THE Login_Page SHALL set `aria-invalid="true"` on inputs that have validation errors.
3. THE Login_Page SHALL link error messages to their inputs via `aria-describedby`.
4. WHEN the login form is submitting, THE Login_Page SHALL set `aria-busy="true"` on the submit button.
5. THE Registration_Page SHALL follow the same accessibility patterns as the Login_Page for all form inputs and error messages.
6. THE Login_Page and Registration_Page SHALL maintain a minimum color contrast ratio of 4.5:1 for all text elements, using design tokens only.
7. WHEN a session expiry message is displayed on the Login_Page, THE Login_Page SHALL render the message with `role="status"` so screen readers announce it.

### Requirement 16: Login Page Navigation Link to Registration

**User Story:** As a new user, I want to navigate from the login page to the registration page, so that I can create an account.

#### Acceptance Criteria

1. THE Login_Page SHALL display a link to the Registration_Page below the login form.
2. THE Login_Page SHALL use the `auth` i18n namespace for the registration link text.
3. THE Registration_Page SHALL display a link to the Login_Page below the registration form.

### Requirement 17: MSW Mock Handlers for Auth Endpoints

**User Story:** As a developer, I want MSW handlers for all auth endpoints, so that I can develop and test the authentication feature without a running backend.

#### Acceptance Criteria

1. THE MSW auth handlers SHALL simulate POST `/auth/login` with realistic latency (200–500ms), returning a Token_Pair on valid credentials and a 401 on invalid credentials.
2. THE MSW auth handlers SHALL simulate GET `/auth/me` returning the authenticated user profile.
3. THE MSW auth handlers SHALL simulate POST `/auth/refresh` returning a new Token_Pair.
4. THE MSW auth handlers SHALL simulate POST `/auth/logout` returning 204 No Content.
5. THE MSW auth handlers SHALL simulate POST `/auth/register` returning 201 on success and 409 on duplicate CPF.
6. THE MSW auth handlers SHALL simulate POST `/auth/activate/{id}` returning 200 on success and 404 on invalid ID.
7. THE MSW auth handlers SHALL wrap all success responses in the API_Envelope format `{ success: true, data: T, timestamp: string }`.
