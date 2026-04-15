"use client";

import type { ReactNode } from "react";

import { UserRole } from "@/models";
import { PermissionsContextProvider } from "@/hooks/auth/usePermissions";

/**
 * Props for the permissions provider.
 */
export interface PermissionsProviderProps {
  /** Authenticated user role used by authorization gates. */
  role: UserRole;
  /** Child component tree consuming permission checks. */
  children: ReactNode;
}

/**
 * Wraps a subtree with permission context based on the current user role.
 *
 * @param props - Provider role and child content
 * @returns Context provider configured for permission checks
 */
export function PermissionsProvider({
  role,
  children,
}: PermissionsProviderProps) {
  return (
    <PermissionsContextProvider value={{ role }}>
      {children}
    </PermissionsContextProvider>
  );
}
