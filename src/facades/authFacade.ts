import { getApiBase } from "@/lib/apiBase";
import { handleApiResponse, handleEnvelopedResponse } from "@/lib/handleApiResponse";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  TokenPair,
} from "@/models/Auth";
import type { Servidor } from "@/models/Servidor";
import { ApiError } from "@/types";

function baseUrl(): string {
  return getApiBase();
}

// ---------------------------------------------------------------------------
// Module-scoped token state (never exported directly)
// ---------------------------------------------------------------------------
let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<TokenPair> | null = null;

// ---------------------------------------------------------------------------
// Token persistence helpers (sessionStorage — survives page refresh, cleared on tab close)
// ---------------------------------------------------------------------------

const TOKEN_KEY = "govmobile.access_token";
const REFRESH_KEY = "govmobile.refresh_token";

function loadTokens(): void {
  if (typeof window === "undefined") return;
  accessToken = sessionStorage.getItem(TOKEN_KEY);
  refreshToken = sessionStorage.getItem(REFRESH_KEY);
}

function saveTokens(pair: TokenPair): void {
  accessToken = pair.accessToken;
  refreshToken = pair.refreshToken;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(TOKEN_KEY, pair.accessToken);
    sessionStorage.setItem(REFRESH_KEY, pair.refreshToken);
  }
}

/**
 * Clears all in-memory token state.
 * Called on logout and when a refresh attempt fails.
 */
function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  refreshPromise = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  }
}

// Load persisted tokens on module initialisation (browser only)
loadTokens();

// ---------------------------------------------------------------------------
// Authenticated fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Authenticated fetch wrapper used by all facades for protected endpoints.
 *
 * - Attaches `Authorization: Bearer <accessToken>` header on every request.
 * - On a 401 response, attempts a silent token refresh and retries the
 *   original request exactly once with the new access token.
 * - Uses a shared `refreshPromise` to prevent concurrent refresh calls.
 * - On refresh failure, clears tokens and throws an error.
 *
 * @param url - Fully-qualified URL to fetch
 * @param options - Standard `RequestInit` options
 * @returns The raw `Response` object from the (possibly retried) request
 * @throws ApiError with code `NETWORK_ERROR` on fetch failures
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Network request failed");
  }

  if (response.status === 401 && refreshToken) {
    // Attempt a silent refresh, then retry exactly once
    try {
      const tokens = await authFacade.refresh();
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set("Authorization", `Bearer ${tokens.accessToken}`);

      try {
        response = await fetch(url, { ...options, headers: retryHeaders });
      } catch {
        throw new ApiError(0, "NETWORK_ERROR", "Network request failed");
      }
    } catch (error) {
      // If the error is already an ApiError from the retry fetch, re-throw it
      if (error instanceof ApiError && error.code === "NETWORK_ERROR") {
        throw error;
      }
      // Refresh failed — clear tokens and throw
      clearTokens();
      throw error;
    }
  }

  return response;
}

// ---------------------------------------------------------------------------
// Auth facade
// ---------------------------------------------------------------------------

/**
 * Facade for authentication-related API calls and in-memory token management.
 *
 * All responses use the `{ success, data, timestamp }` envelope — unwrapped
 * transparently by `handleEnvelopedResponse`.
 */
export const authFacade = {
  /**
   * Authenticates a user with CPF and password.
   *
   * Sends a POST to `/auth/login`, stores the returned token pair in memory,
   * then immediately calls `me()` to retrieve the full user profile.
   *
   * @param cpf - 11 unformatted digits
   * @param senha - User password
   * @returns The authenticated user profile
   * @throws ApiError on invalid credentials (401), rate limiting (429), or server errors
   */
  async login(cpf: string, senha: string): Promise<AuthUser> {
    let response: Response;
    try {
      response = await fetch(`${baseUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, senha } satisfies LoginInput),
      });
    } catch {
      throw new ApiError(0, "NETWORK_ERROR", "Network request failed");
    }

    const raw = await handleApiResponse<TokenPair & { success?: boolean; data?: TokenPair }>(response);

    // Handle both direct { accessToken, refreshToken } and enveloped { success, data: { accessToken, refreshToken } }
    const tokens: TokenPair = raw.data && raw.data.accessToken
      ? raw.data
      : { accessToken: raw.accessToken, refreshToken: raw.refreshToken };

    saveTokens(tokens);

    return authFacade.me();
  },

  /**
   * Retrieves the authenticated user's profile.
   *
   * @returns The current user profile
   * @throws ApiError on 401 (triggers refresh via `fetchWithAuth`) or network errors
   */
  async me(): Promise<AuthUser> {
    const response = await fetchWithAuth(`${baseUrl()}/auth/me`);
    const raw = await handleApiResponse<AuthUser & { success?: boolean; data?: AuthUser }>(response);

    // Handle both direct AuthUser and enveloped { success, data: AuthUser }
    return raw.data && raw.data.id ? raw.data : raw as AuthUser;
  },

  /**
   * Refreshes the token pair using the current refresh token.
   *
   * Uses a mutex pattern: if a refresh is already in progress, subsequent
   * callers await the same promise instead of issuing duplicate requests.
   *
   * @returns The new token pair
   * @throws ApiError on refresh failure
   */
  async refresh(): Promise<TokenPair> {
    // Mutex: reuse an in-flight refresh promise
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      let response: Response;
      try {
        response = await fetch(`${baseUrl()}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {}),
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        clearTokens();
        throw new ApiError(0, "NETWORK_ERROR", "Network request failed");
      }

      const raw = await handleApiResponse<TokenPair & { success?: boolean; data?: TokenPair }>(response);
      const tokens: TokenPair = raw.data && raw.data.accessToken
        ? raw.data
        : { accessToken: raw.accessToken, refreshToken: raw.refreshToken };

      saveTokens(tokens);
      return tokens;
    })();

    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  },

  /**
   * Logs the current user out.
   *
   * Sends a POST to `/auth/logout` and clears all in-memory tokens
   * regardless of whether the server request succeeds.
   *
   * @throws ApiError with code `NETWORK_ERROR` on fetch failures
   */
  async logout(): Promise<void> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      let response: Response;
      try {
        response = await fetch(`${baseUrl()}/auth/logout`, {
          method: "POST",
          headers,
        });
      } catch {
        throw new ApiError(0, "NETWORK_ERROR", "Network request failed");
      }

      // For 204 No Content there is no body to parse
      if (!response.ok && response.status !== 204) {
        await handleEnvelopedResponse<never>(response);
      }
    } finally {
      clearTokens();
    }
  },

  /**
   * Registers a new servidor (government employee).
   *
   * @param payload - Registration form data
   * @returns The created servidor record (pending activation)
   * @throws ApiError 409 on duplicate CPF, 422 on validation errors
   */
  async register(payload: RegisterInput): Promise<Servidor> {
    let response: Response;
    try {
      response = await fetch(`${baseUrl()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new ApiError(0, "NETWORK_ERROR", "Network request failed");
    }

    return handleEnvelopedResponse<Servidor>(response);
  },

  /**
   * Activates a pending servidor registration (admin-only).
   *
   * @param id - The servidor identifier to activate
   * @returns The updated servidor record
   * @throws ApiError 404 when the servidor is not found, 403 on insufficient permissions
   */
  async activate(id: string): Promise<Servidor> {
    const response = await fetchWithAuth(`${baseUrl()}/auth/activate/${id}`, {
      method: "POST",
    });
    return handleEnvelopedResponse<Servidor>(response);
  },
};
