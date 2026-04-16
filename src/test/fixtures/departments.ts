import type { Department } from "@/models/Department";

/**
 * Fixture dataset used by departments MSW handlers and unit tests.
 */
export const mockDepartments: Department[] = [
  {
    id: "dept-001",
    name: "Zone 3 Operations",
    description: "Handles all Zone 3 field operations",
    userCount: 12,
    activeRunCount: 4,
    createdAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "dept-002",
    name: "Zone 1 Inspections",
    description: null,
    userCount: 8,
    activeRunCount: 2,
    createdAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "dept-003",
    name: "Central Dispatch",
    description: "Main dispatch hub for all operational coordination",
    userCount: 5,
    activeRunCount: 0,
    createdAt: "2026-04-01T00:00:00.000Z",
  },
];
