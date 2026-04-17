"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { ErrorState } from "@/components/molecules/ErrorState";
import { UserRole } from "@/models";
import type { ApiError } from "@/types";

/**
 * Props for the AuthGuard wrapper component.
 */
export interface AuthGuardProps {
  /** Protected content rendered after successful authentication. */
  children: ReactNode;
}

/**
 * Session verification wrapper for protected routes.
 *
 * On mount, calls `useCurrentUser` to verify the session via `/auth/me`.
 * - While loading: renders a full-page skeleton with `aria-busy="true"`.
 * - On success: renders `<PermissionsProvider>` wrapping children.
 * - On auth failure (401): saves current URL and redirects to `/login?reason=session_expired`.
 * - On network error: renders an error state with a retry button.
 *
 * @param props - Children to render when authenticated
 * @returns Guarded content or loading/error state
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isError, data: user, error, refetch } = useCurrentUser();

  const isAuthError =
    isError && error && (error as ApiError).status === 401;
  const isNetworkError =
    isError && error && (error as ApiError).code === "NETWORK_ERROR";

  // Redirect to login on auth failure (401 after refresh fails)
  useEffect(() => {
    if (isAuthError) {
      try {
        sessionStorage.setItem("govmobile.redirect_url", pathname);
      } catch {
        // sessionStorage may be unavailable in some environments
      }
      router.replace("/login?reason=session_expired");
    }
  }, [isAuthError, pathname, router]);

  // Loading state — full-page skeleton
  if (isLoading) {
    return (
      <div
        data-testid="auth-guard"
        aria-busy="true"
        className="flex h-screen w-full items-center justify-center bg-neutral-50"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Skeleton bars */}
          <div className="h-8 w-48 animate-pulse rounded-md bg-neutral-200" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-neutral-200" />
          <div className="h-4 w-56 animate-pulse rounded-md bg-neutral-200" />
        </div>
      </div>
    );
  }

  // Network error — show retry
  if (isNetworkError) {
    return (
      <div
        data-testid="auth-guard"
        className="flex h-screen w-full items-center justify-center bg-neutral-50"
      >
        <ErrorState
          onRetry={() => refetch()}
          data-testid="auth-guard-error"
        />
      </div>
    );
  }

  // Auth error — redirect is handled by the effect above; render nothing while redirecting
  if (isAuthError) {
    return null;
  }

  // Generic error (non-401, non-network) — show retry
  if (isError) {
    return (
      <div
        data-testid="auth-guard"
        className="flex h-screen w-full items-center justify-center bg-neutral-50"
      >
        <ErrorState
          onRetry={() => refetch()}
          data-testid="auth-guard-error"
        />
      </div>
    );
  }

  // Authenticated — wrap children with PermissionsProvider
  if (user) {
    // Normalize role to match UserRole enum values (API may return lowercase or different casing)
    const normalizedRole = (
      Object.values(UserRole).find(
        (r) => r.toUpperCase() === String(user.role).toUpperCase()
      ) ?? UserRole.DISPATCHER
    ) as UserRole;

    return (
      <div data-testid="auth-guard">
        <PermissionsProvider role={normalizedRole}>
          {children}
        </PermissionsProvider>
      </div>
    );
  }

  // Fallback — should not reach here, but render nothing
  return null;
}
