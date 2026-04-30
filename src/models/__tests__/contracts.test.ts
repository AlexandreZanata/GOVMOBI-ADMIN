import { describe, expect, it } from "vitest";

import { Permission, RolePermissionMap } from "@/models/Permission";
import { RunStatus } from "@/models/Run";
import { UserRole } from "@/models/User";

describe("Domain model contracts", () => {
  it("RunStatus enum contains the expected corrida status values", () => {
    expect(Object.values(RunStatus)).toEqual([
      "solicitada",
      "aguardando_aceite",
      "aceita",
      "em_rota",
      "passageiro_a_bordo",
      "concluida",
      "avaliada",
      "cancelada",
      "expirada",
    ]);
  });

  it("UserRole enum contains exactly the four roles", () => {
    expect(Object.values(UserRole)).toEqual([
      "AGENT",
      "DISPATCHER",
      "SUPERVISOR",
      "ADMIN",
    ]);
  });

  it("RolePermissionMap covers all UserRole values", () => {
    expect(Object.keys(RolePermissionMap).sort()).toEqual(
      Object.values(UserRole).sort()
    );
  });

  it("RolePermissionMap AGENT does not contain CREATE_RUN or MANAGE_USERS", () => {
    expect(RolePermissionMap[UserRole.AGENT]).not.toContain(Permission.CREATE_RUN);
    expect(RolePermissionMap[UserRole.AGENT]).not.toContain(Permission.MANAGE_USERS);
  });

  it("RolePermissionMap ADMIN contains all Permission values", () => {
    const adminPermissions = new Set(RolePermissionMap[UserRole.ADMIN]);
    for (const permission of Object.values(Permission)) {
      expect(adminPermissions.has(permission)).toBe(true);
    }
  });

  it("RolePermissionMap SUPERVISOR contains OVERRIDE_ACTION but not CONFIGURE_SYSTEM", () => {
    expect(RolePermissionMap[UserRole.SUPERVISOR]).toContain(Permission.OVERRIDE_ACTION);
    expect(RolePermissionMap[UserRole.SUPERVISOR]).not.toContain(Permission.CONFIGURE_SYSTEM);
  });
});
