"use client";

import { createContext, useContext } from "react";

import { Permission, RolePermissionMap, UserRole } from "@/models";

/**
 * Permission context value used to resolve capability checks in UI.
 */
interface PermissionsContextValue {
  /** Active user role used for authorization checks. */
  role: UserRole;
}

const PermissionsContext = createContext<PermissionsContextValue>({
  role: UserRole.AGENT,
});

/**
 * Provides role permissions to descendant components.
 */
export const PermissionsContextProvider = PermissionsContext.Provider;

/**
 * Resolves permission checks for the active role.
 *
 * @returns Permission helpers and active role metadata
 */
export function usePermissions(): {
  role: UserRole;
  can: (permission: Permission) => boolean;
} {
  const { role } = useContext(PermissionsContext);

  return {
    role,
    can: (permission: Permission) => RolePermissionMap[role].includes(permission),
  };
}
