/**
 * Input contract for loading a single run by identifier.
 */
export interface GetRunByIdInput {
  /** Unique run identifier. */
  runId: string;
}

/**
 * Input payload for run override confirmation.
 */
export interface OverrideRunInput {
  /** Target run identifier. */
  runId: string;
  /** Mandatory reason used for audit traceability. */
  reason: string;
  /** Audit event name attached to the operation. */
  auditEvent: "RUN_OVERRIDE_CONFIRMED";
}
