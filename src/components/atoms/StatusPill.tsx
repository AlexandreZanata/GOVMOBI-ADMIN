"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";
import { RunStatus } from "@/models/Run";

export interface StatusPillProps {
  /** Run lifecycle status */
  status: RunStatus | string;
  /** Test selector */
  "data-testid"?: string;
}

const statusClass: Record<string, string> = {
  [RunStatus.SOLICITADA]:        "bg-warning/15 text-warning",
  [RunStatus.AGUARDANDO_ACEITE]: "bg-info/15 text-info",
  [RunStatus.ACEITA]:            "bg-info/15 text-info",
  [RunStatus.EM_ROTA]:           "bg-brand-primary/15 text-brand-primary",
  [RunStatus.CONCLUIDA]:         "bg-success/15 text-success",
  [RunStatus.CANCELADA]:         "bg-danger/15 text-danger",
  [RunStatus.EXPIRADA]:          "bg-neutral-200 text-neutral-700",
};

/**
 * Color-coded pill that reflects a corrida's lifecycle status.
 * Label is resolved via i18n key `runs:status.<STATUS>`.
 *
 * @param status - RunStatus enum value or raw string
 * @param testId - Optional test selector
 * @returns Accessible status badge
 */
export function StatusPill({ status, "data-testid": testId }: StatusPillProps) {
  const { t } = useTranslation("runs");
  const cls = statusClass[status] ?? "bg-neutral-200 text-neutral-700";

  return (
    <span
      data-testid={testId}
      aria-label={t(`status.${status}`, { defaultValue: String(status) })}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {t(`status.${status}`, { defaultValue: String(status) })}
    </span>
  );
}
