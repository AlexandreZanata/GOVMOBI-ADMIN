import { create } from "zustand";
import type { AuthUser } from "@/models/Auth";

/**
 * Synchronous session state managed by the auth store.
 *
 * - `user` holds the authenticated user profile (or `null` when logged out).
 * - `isAuthenticated` mirrors whether a valid session exists.
 * - `isHydrated` becomes `true` after the first `/auth/me` attempt completes,
 *   allowing the AuthGuard to distinguish "still loading" from "not authenticated".
 * - `redirectUrl` stores a URL for post-login redirect (e.g. after session expiry).
 */
export interface AuthState {
  /** The currently authenticated user, or `null` when no session exists. */
  user: AuthUser | null;
  /** Whether the user has an active authenticated session. */
  isAuthenticated: boolean;
  /** Whether the initial session verification has completed. */
  isHydrated: boolean;
  /** URL to redirect to after a successful login (e.g. after session expiry). */
  redirectUrl: string | null;
}

/**
 * Actions available on the auth store for mutating session state.
 */
export interface AuthActions {
  /**
   * Sets the authenticated user and marks the session as authenticated.
   * @param user - The authenticated user profile from `/auth/me`.
   */
  setUser: (user: AuthUser) => void;

  /**
   * Explicitly sets the authentication flag without changing the user object.
   * @param value - Whether the user is authenticated.
   */
  setAuthenticated: (value: boolean) => void;

  /**
   * Marks the store as hydrated after the initial session verification attempt.
   * @param value - Whether hydration is complete.
   */
  setHydrated: (value: boolean) => void;

  /**
   * Stores a URL to redirect to after the next successful login.
   * @param url - The target URL, or `null` to clear.
   */
  setRedirectUrl: (url: string | null) => void;

  /**
   * Resets the session state: clears the user and sets `isAuthenticated` to `false`.
   * Called on logout and when a token refresh fails.
   */
  clearSession: () => void;

  /**
   * Updates the profile photo URL of the authenticated user without replacing the full user object.
   * @param url - The new public URL of the profile photo.
   */
  updateFotoPerfilUrl: (url: string) => void;
}

/**
 * Zustand store for client-side authentication session state.
 *
 * Holds the current user, authentication status, hydration flag, and
 * post-login redirect URL. Mutations are performed by auth hooks
 * (`useLogin`, `useLogout`, `useCurrentUser`) after facade calls complete.
 *
 * This store is intentionally synchronous — all async API interactions
 * happen in TanStack Query hooks, following the project's two-layer
 * state model (ADR-003).
 */
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  redirectUrl: null,

  /** Sets the user and marks the session as authenticated. */
  setUser: (user) => set({ user, isAuthenticated: true }),

  /** Explicitly sets the authentication flag. */
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  /** Marks the store as hydrated after initial session verification. */
  setHydrated: (isHydrated) => set({ isHydrated }),

  /** Stores or clears the post-login redirect URL. */
  setRedirectUrl: (redirectUrl) => set({ redirectUrl }),

  /** Resets user and authentication status (e.g. on logout or refresh failure). */
  clearSession: () => set({ user: null, isAuthenticated: false }),

  /** Updates the profile photo URL of the authenticated user. */
  updateFotoPerfilUrl: (url) =>
    set((state) => ({
      user: state.user ? { ...state.user, fotoPerfilUrl: url } : state.user,
    })),
}));
