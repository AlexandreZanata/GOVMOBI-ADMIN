import type { User } from "@/models/User";
import { UserRole, UserStatus } from "@/models/User";

/**
 * Fixture dataset used by users MSW handlers and unit tests.
 * Contains a realistic mix of roles and statuses.
 */
export const mockUsers: User[] = [
  {
    id: "user-001",
    name: "Ana Lima",
    email: "ana.lima@gov.internal",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    departmentId: "dept-001",
    avatarUrl: null,
    createdAt: "2026-04-01T00:00:00.000Z",
    lastActiveAt: "2026-04-15T10:00:00.000Z",
  },
  {
    id: "user-002",
    name: "Carlos Melo",
    email: "carlos.melo@gov.internal",
    role: UserRole.DISPATCHER,
    status: UserStatus.ACTIVE,
    departmentId: "dept-001",
    avatarUrl: null,
    createdAt: "2026-04-01T00:00:00.000Z",
    lastActiveAt: "2026-04-15T09:00:00.000Z",
  },
  {
    id: "user-003",
    name: "Beatriz Nunes",
    email: "b.nunes@gov.internal",
    role: UserRole.SUPERVISOR,
    status: UserStatus.INACTIVE,
    departmentId: "dept-002",
    avatarUrl: null,
    createdAt: "2026-04-01T00:00:00.000Z",
    lastActiveAt: "2026-04-10T08:00:00.000Z",
  },
  {
    id: "user-004",
    name: "Diego Ferreira",
    email: "d.ferreira@gov.internal",
    role: UserRole.AGENT,
    status: UserStatus.ON_MISSION,
    departmentId: "dept-002",
    avatarUrl: null,
    createdAt: "2026-04-05T00:00:00.000Z",
    lastActiveAt: "2026-04-15T11:00:00.000Z",
  },
  {
    id: "user-005",
    name: "Fernanda Costa",
    email: "f.costa@gov.internal",
    role: UserRole.DISPATCHER,
    status: UserStatus.ACTIVE,
    departmentId: "dept-003",
    avatarUrl: null,
    createdAt: "2026-04-08T00:00:00.000Z",
    lastActiveAt: "2026-04-15T08:30:00.000Z",
  },
];
