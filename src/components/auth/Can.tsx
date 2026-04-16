"use client";

import type { ReactNode } from "react";

import { usePermissions } from "@/hooks/auth/usePermissions";
import { type Permission } from "@/models";

/**
 * Props for permission-based rendering gate.
 */
export interface CanProps {
  /** Permission required to render child content. */
  perform: Permission;
  /** Content rendered when access is allowed. */
  children: ReactNode;
  /** Optional content rendered when access is denied. */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children when current role has the required permission.
 *
 * @param props - Gate configuration with required permission and child content
 * @returns Authorized children or fallback content
 */
export function Can({ perform, children, fallback = null }: CanProps) {
  const { can } = usePermissions();

  if (!can(perform)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
