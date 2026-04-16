/**
 * Offset-based paginated response contract used by list endpoints.
 */
export interface PaginatedResponse<TItem> {
  /** Items returned for current page. */
  items: TItem[];
  /** Total number of matching items. */
  total: number;
  /** Current page number (1-indexed). */
  page: number;
  /** Number of items requested per page. */
  pageSize: number;
  /** Indicates whether a next page exists. */
  hasMore: boolean;
}

/**
 * Run summary item shape from `GET /v1/runs`.
 */
export interface RunListItem {
  /** Unique run identifier. */
  id: string;
  /** Display title for the run. */
  title: string;
  /** Operational description. */
  description: string;
  /** Lifecycle status. */
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  /** Priority level. */
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** Department owner identifier. */
  departmentId: string;
  /** Assigned agent identifier. */
  agentId: string | null;
  /** User id who created the run. */
  createdBy: string;
  /** Creation timestamp in ISO UTC format. */
  createdAt: string;
  /** Last update timestamp in ISO UTC format. */
  updatedAt: string;
  /** Optional scheduled execution timestamp. */
  scheduledAt: string | null;
}

/**
 * Status history record for a run.
 */
export interface RunHistoryItem {
  /** Status recorded for the transition. */
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  /** Event timestamp in ISO UTC format. */
  timestamp: string;
  /** Actor identifier responsible for the event. */
  actorId: string;
  /** Role of the actor when event occurred. */
  actorRole: "AGENT" | "DISPATCHER" | "SUPERVISOR" | "ADMIN";
  /** Optional note attached to the event. */
  note: string | null;
  /** Optional override flag when transition was elevated. */
  isOverride?: boolean;
}

/**
 * Full run detail response shape from `GET /v1/runs/:id`.
 */
export interface RunDetail {
  /** Unique run identifier. */
  id: string;
  /** Display title for the run. */
  title: string;
  /** Lifecycle status. */
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  /** Department owner identifier. */
  departmentId: string;
  /** Assigned agent identifier. */
  agentId: string | null;
  /** Full status transition history. */
  history: RunHistoryItem[];
}

/**
 * Fixture dataset used by run MSW handlers.
 */
export const runsFixture: RunListItem[] = [
  {
    id: "run-001",
    title: "Inspection Route A",
    description: "Weekly inspection of Zone 3",
    status: "PENDING",
    priority: "HIGH",
    departmentId: "dept-001",
    agentId: null,
    createdBy: "user-001",
    createdAt: "2026-04-15T08:00:00Z",
    updatedAt: "2026-04-15T08:00:00Z",
    scheduledAt: null,
  },
  {
    id: "run-002",
    title: "Emergency Transfer",
    description: "Immediate transport to medical facility",
    status: "ASSIGNED",
    priority: "CRITICAL",
    departmentId: "dept-002",
    agentId: "agent-002",
    createdBy: "user-002",
    createdAt: "2026-04-15T09:10:00Z",
    updatedAt: "2026-04-15T09:20:00Z",
    scheduledAt: "2026-04-15T10:00:00Z",
  },
  {
    id: "run-003",
    title: "Vehicle Maintenance Check",
    description: "Preventive maintenance verification",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    departmentId: "dept-001",
    agentId: "agent-003",
    createdBy: "user-003",
    createdAt: "2026-04-14T16:00:00Z",
    updatedAt: "2026-04-15T07:30:00Z",
    scheduledAt: null,
  },
];

/**
 * Builds a detail fixture for a specific run id.
 *
 * @param runId - Target run identifier
 * @returns Run detail payload
 */
export function makeRunDetail(runId: string): RunDetail {
  const base = runsFixture.find((item) => item.id === runId) ?? runsFixture[0];

  return {
    id: runId,
    title: base.title,
    status: base.status,
    departmentId: base.departmentId,
    agentId: base.agentId,
    history: [
      {
        status: "PENDING",
        timestamp: "2026-04-15T08:00:00Z",
        actorId: base.createdBy,
        actorRole: "DISPATCHER",
        note: null,
      },
      {
        status: base.status,
        timestamp: base.updatedAt,
        actorId: "user-supervisor",
        actorRole: "SUPERVISOR",
        note: null,
        isOverride: false,
      },
    ],
  };
}
