import { UserRole } from "@/models/User";

/**
 * Atomic capability keys enforced by the authorization layer.
 */
export enum Permission {
  VIEW_RUNS = "VIEW_RUNS",
  CREATE_RUN = "CREATE_RUN",
  ASSIGN_RUN = "ASSIGN_RUN",
  ACCEPT_RUN = "ACCEPT_RUN",
  UPDATE_STATUS = "UPDATE_STATUS",
  VIEW_REPORTS = "VIEW_REPORTS",
  OVERRIDE_ACTION = "OVERRIDE_ACTION",
  MANAGE_USERS = "MANAGE_USERS",
  CONFIGURE_SYSTEM = "CONFIGURE_SYSTEM",
  VIEW_AUDIT_LOG = "VIEW_AUDIT_LOG",
  // Navigation / domain gates
  CARGO_VIEW = "cargo:view",
  LOTACAO_VIEW = "lotacao:view",
  LOTACAO_CREATE = "lotacao:create",
  LOTACAO_EDIT = "lotacao:edit",
  LOTACAO_DELETE = "lotacao:delete",
  SERVIDOR_VIEW = "servidor:view",
  VEICULO_VIEW = "veiculo:view",
  USER_VIEW = "user:view",
  USER_CREATE = "user:create",
  USER_EDIT = "user:edit",
  USER_DEACTIVATE = "user:deactivate",
  DEPARTMENT_VIEW = "department:view",
  DEPARTMENT_CREATE = "department:create",
  AUDIT_VIEW = "audit:view",
}

/**
 * Permission matrix by role used as the source of truth for access checks.
 */
export const RolePermissionMap: Record<UserRole, Permission[]> = {
  [UserRole.AGENT]: [
    Permission.VIEW_RUNS,
    Permission.ACCEPT_RUN,
    Permission.UPDATE_STATUS,
  ],
  [UserRole.DISPATCHER]: [
    Permission.VIEW_RUNS,
    Permission.CREATE_RUN,
    Permission.ASSIGN_RUN,
    Permission.UPDATE_STATUS,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.SUPERVISOR]: [
    Permission.VIEW_RUNS,
    Permission.CREATE_RUN,
    Permission.ASSIGN_RUN,
    Permission.ACCEPT_RUN,
    Permission.UPDATE_STATUS,
    Permission.VIEW_REPORTS,
    Permission.OVERRIDE_ACTION,
    Permission.VIEW_AUDIT_LOG,
  ],
  [UserRole.ADMIN]: Object.values(Permission),
};
