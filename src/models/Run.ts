/**
 * Run lifecycle status values.
 */
export enum RunStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

/**
 * Supported operation categories for a run.
 */
export enum RunType {
  TRANSPORT = "TRANSPORT",
  INSPECTION = "INSPECTION",
  EMERGENCY = "EMERGENCY",
  MAINTENANCE = "MAINTENANCE",
  ADMINISTRATIVE = "ADMINISTRATIVE",
}

/**
 * Operational urgency level for a run.
 */
export enum RunPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Geographic location metadata for a run.
 */
export interface RunLocation {
  /** Latitude coordinate in decimal degrees. */
  lat: number;
  /** Longitude coordinate in decimal degrees. */
  lng: number;
  /** Human-readable address for the run location. */
  address: string;
}

/**
 * Evidence artifact attached to a run.
 */
export interface RunProof {
  /** Unique proof identifier. */
  id: string;
  /** Public or signed URL of the uploaded file. */
  fileUrl: string;
  /** Type of proof attachment. */
  fileType: "photo" | "document";
  /** ISO timestamp when the proof was uploaded. */
  uploadedAt: string;
  /** Identifier of the user that uploaded the proof. */
  uploadedBy: string;
}

/**
 * Core operational run contract.
 */
export interface Run {
  /** Unique run identifier. */
  id: string;
  /** Operational category of the run. */
  type: RunType;
  /** Current lifecycle status of the run. */
  status: RunStatus;
  /** Urgency level used for planning and dispatching. */
  priority: RunPriority;
  /** Short run title displayed in listings. */
  title: string;
  /** Detailed mission context and objectives. */
  description: string;
  /** Geographical details for where the run takes place. */
  location: RunLocation;
  /** Assigned field agent identifier, if assigned. */
  assignedAgentId: string | null;
  /** Dispatcher identifier who created or manages the run. */
  dispatcherId: string;
  /** ISO timestamp when the run was created. */
  createdAt: string;
  /** ISO timestamp for the last update to the run. */
  updatedAt: string;
  /** ISO timestamp when the run was completed, if applicable. */
  completedAt: string | null;
  /** Free-form operational notes attached to the run. */
  notes: string | null;
  /** Collection of uploaded proofs related to the run. */
  proofs: RunProof[];
  /** Department that owns the run. */
  departmentId: string;
}

/**
 * Status transition audit record for a run.
 */
export interface RunTransition {
  /** Previous run status before the transition. */
  fromStatus: RunStatus;
  /** New run status after the transition. */
  toStatus: RunStatus;
  /** Identifier of the user who triggered the transition. */
  triggeredBy: string;
  /** ISO timestamp when the transition occurred. */
  timestamp: string;
  /** Human-readable reason for the status change. */
  reason: string;
}
