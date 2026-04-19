"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { useRuns } from "@/hooks/runs/useRuns";
import { Permission, RunStatus } from "@/models";
import type { Run } from "@/models/Run";

/** Status badge color mapping for corridas. */
const STATUS_CLASSES: Record<string, string> = {
  [RunStatus.SOLICITADA]:       "bg-warning/15 text-warning",
  [RunStatus.AGUARDANDO_ACEITE]:"bg-info/15 text-info",
  [RunStatus.ACEITA]:           "bg-info/15 text-info",
  [RunStatus.EM_ROTA]:          "bg-brand-primary/15 text-brand-primary",
  [RunStatus.CONCLUIDA]:        "bg-success/15 text-success",
  [RunStatus.CANCELADA]:        "bg-danger/15 text-danger",
  [RunStatus.EXPIRADA]:         "bg-neutral-200 text-neutral-700",
};

const ALL_STATUSES = Object.values(RunStatus);

/**
 * Client-side corridas page renderer.
 * Consumes GET /corridas with pagination and status filter.
 */
export function RunsPageClient() {
  const { t } = useTranslation("runs");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useRuns({
    page,
    limit: 25,
    status: statusFilter || undefined,
  });

  const runs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  let content: ReactNode;

  if (isLoading) {
    content = (
      <section data-testid="runs-loading" className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-md bg-neutral-200" />
        ))}
      </section>
    );
  } else if (isError) {
    content = <ErrorState data-testid="runs-error" onRetry={() => void refetch()} />;
  } else if (!runs.length) {
    content = (
      <section data-testid="runs-empty" className="rounded-md border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-base font-semibold text-neutral-900">{t("page.empty.title")}</h2>
        <p className="mt-1 text-sm text-neutral-700">{t("page.empty.message")}</p>
      </section>
    );
  } else {
    content = (
      <>
        <div className="overflow-hidden rounded-md border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">{t("table.id")}</th>
                <th className="px-4 py-3">{t("table.status")}</th>
                <th className="hidden px-4 py-3 md:table-cell">{t("table.origem")}</th>
                <th className="hidden px-4 py-3 md:table-cell">{t("table.destino")}</th>
                <th className="hidden px-4 py-3 lg:table-cell">{t("table.distancia")}</th>
                <th className="px-4 py-3">{t("table.createdAt")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {runs.map((run) => (
                <RunRow key={run.id} run={run} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 pt-2">
            <span className="text-xs text-neutral-500">
              {t("page.filters.all")} {data?.total ?? 0}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-neutral-300 px-3 py-1 text-xs disabled:opacity-40"
              >
                ←
              </button>
              <span className="px-2 py-1 text-xs text-neutral-700">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-neutral-300 px-3 py-1 text-xs disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Can
      perform={Permission.VIEW_RUNS}
      fallback={
        <section data-testid="runs-access-denied" className="rounded-md border border-danger/30 bg-danger/10 p-4">
          <p className="text-sm font-medium text-danger">{t("page.accessDenied")}</p>
        </section>
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">{t("page.title")}</h1>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={statusFilter === ""}
            onClick={() => { setStatusFilter(""); setPage(1); }}
            className={[
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-opacity",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
              statusFilter === "" ? "bg-brand-primary text-white" : "bg-neutral-200 text-neutral-700 hover:opacity-80",
            ].join(" ")}
          >
            {t("page.filters.all")}
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={statusFilter === s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-opacity",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                statusFilter === s ? "bg-brand-primary text-white" : "bg-neutral-200 text-neutral-700 hover:opacity-80",
              ].join(" ")}
            >
              {t(`status.${s}`)}
            </button>
          ))}
        </div>

        {content}
      </div>
    </Can>
  );
}

function RunRow({ run }: { run: Run }) {
  const { t } = useTranslation("runs");
  const statusClass = STATUS_CLASSES[run.status] ?? "bg-neutral-200 text-neutral-700";

  const formatCoord = (c: { lat: number; lng: number }) =>
    `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  const formatDistance = (m: number | null) =>
    m == null ? "—" : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;

  return (
    <tr data-testid={`run-row-${run.id}`} className="transition-colors hover:bg-neutral-50">
      <td className="px-4 py-3 font-mono text-xs text-neutral-500">
        {run.id.slice(0, 8)}…
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
          {t(`status.${run.status}`)}
        </span>
      </td>
      <td className="hidden px-4 py-3 text-xs text-neutral-600 md:table-cell">
        {formatCoord(run.origem)}
      </td>
      <td className="hidden px-4 py-3 text-xs text-neutral-600 md:table-cell">
        {formatCoord(run.destino)}
      </td>
      <td className="hidden px-4 py-3 text-xs text-neutral-600 lg:table-cell">
        {formatDistance(run.distanciaMetros)}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500">
        {formatDate(run.createdAt)}
      </td>
    </tr>
  );
}
