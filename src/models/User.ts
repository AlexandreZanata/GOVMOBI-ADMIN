/**
 * Supported user roles in GovMobile operations.
 */
export enum UserRole {
  AGENT = "AGENT",
  DISPATCHER = "DISPATCHER",
  SUPERVISOR = "SUPERVISOR",
  ADMIN = "ADMIN",
}

/**
 * Presence and assignment status for a user.
 */
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ON_MISSION = "ON_MISSION",
}

/**
 * Core user profile contract.
 */
export interface User {
  /** Unique user identifier. */
  id: string;
  /** Full display name used in UI and logs. */
  name: string;
  /** Unique user email address. */
  email: string;
  /** Role that defines permission scope. */
  role: UserRole;
  /** Real-time operational status of the user. */
  status: UserStatus;
  /** Department that the user belongs to. */
  departmentId: string;
  /** Optional avatar URL for profile rendering. */
  avatarUrl: string | null;
  /** ISO timestamp when the user account was created. */
  createdAt: string;
  /** ISO timestamp for the user's latest known activity. */
  lastActiveAt: string;
}
