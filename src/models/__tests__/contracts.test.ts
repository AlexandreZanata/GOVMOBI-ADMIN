import { describe, expect, it } from "vitest";

import { Permission, RolePermissionMap } from "@/models/Permission";
import { RunStatus, RunType } from "@/models/Run";
import { UserRole } from "@/models/User";

describe("Domain model contracts", () => {
  it("RunStatus enum contains exactly the five expected values", () => {
    expect(Object.values(RunStatus)).toEqual([
      "PENDING",
      "ASSIGNED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ]);
  });

  it("RunType enum contains exactly the five expected types", () => {
    expect(Object.values(RunType)).toEqual([
      "TRANSPORT",
      "INSPECTION",
      "EMERGENCY",
      "MAINTENANCE",
      "ADMINISTRATIVE",
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
    expect(RolePermissionMap[UserRole.AGENT]).not.toContain(
      Permission.CREATE_RUN
    );
    expect(RolePermissionMap[UserRole.AGENT]).not.toContain(
      Permission.MANAGE_USERS
    );
  });

  it("RolePermissionMap ADMIN contains all Permission values", () => {
    const adminPermissions = new Set(RolePermissionMap[UserRole.ADMIN]);

    for (const permission of Object.values(Permission)) {
      expect(adminPermissions.has(permission)).toBe(true);
    }
  });

  it("RolePermissionMap SUPERVISOR contains OVERRIDE_ACTION but not CONFIGURE_SYSTEM", () => {
    expect(RolePermissionMap[UserRole.SUPERVISOR]).toContain(
      Permission.OVERRIDE_ACTION
    );
    expect(RolePermissionMap[UserRole.SUPERVISOR]).not.toContain(
      Permission.CONFIGURE_SYSTEM
    );
  });
});
