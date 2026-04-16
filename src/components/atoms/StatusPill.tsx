"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";
import { RunStatus } from "@/models/Run";

export interface StatusPillProps {
  /** Run lifecycle status */
  status: RunStatus;
  /** Test selector */
  "data-testid"?: string;
}

const statusClass: Record<RunStatus, string> = {
  [RunStatus.PENDING]: "status-pending",
  [RunStatus.ASSIGNED]: "status-assigned",
  [RunStatus.IN_PROGRESS]: "status-in-progress",
  [RunStatus.COMPLETED]: "status-completed",
  [RunStatus.CANCELLED]: "status-cancelled",
};

/**
 * Color-coded pill that reflects a Run's lifecycle status.
 * Label is resolved via i18n key `runs:status.<STATUS>`.
 *
 * @param status - RunStatus enum value
 * @param testId
 * @returns Accessible status badge
 */
export function StatusPill({ status, "data-testid": testId }: StatusPillProps) {
  const { t } = useTranslation("runs");

  return (
    <span
      data-testid={testId}
      aria-label={t(`status.${status}`)}
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusClass[status],
      ].join(" ")}
    >
      {t(`status.${status}`)}
    </span>
  );
}
