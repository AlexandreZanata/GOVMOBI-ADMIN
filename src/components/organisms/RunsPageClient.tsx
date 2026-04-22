"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { RunCancelDialog } from "@/components/molecules/RunCancelDialog";
import { RunCreateAdminDialog } from "@/components/molecules/RunCreateAdminDialog";
import { useActiveRuns } from "@/hooks/runs/useActiveRuns";
import { useRuns } from "@/hooks/runs/useRuns";
import { Permission, RunStatus } from "@/models";
import type { Run } from "@/models/Run";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";

/** Status badge color mapping for corridas. */
const STATUS_CLASSES: Record<string, string> = {
  [RunStatus.SOLICITADA]:        "bg-warning/15 text-warning",
  [RunStatus.AGUARDANDO_ACEITE]: "bg-info/15 text-info",
  [RunStatus.ACEITA]:            "bg-info/15 text-info",
  [RunStatus.EM_ROTA]:           "bg-brand-primary/15 text-brand-primary",
  [RunStatus.CONCLUIDA]:         "bg-success/15 text-success",
  [RunStatus.AVALIADA]:          "bg-success/15 text-success",
  [RunStatus.CANCELADA]:         "bg-danger/15 text-danger",
  [RunStatus.EXPIRADA]:          "bg-neutral-200 text-neutral-700",
};

const ACTIVE_STATUSES = new Set([
  RunStatus.SOLICITADA,
  RunStatus.AGUARDANDO_ACEITE,
  RunStatus.ACEITA,
  RunStatus.EM_ROTA,
]);

const ALL_STATUSES = Object.values(RunStatus);

type Tab = "all" | "ativas";

/**
 * Client-side corridas page renderer.
 * Integrates GET /corridas, POST /corridas/{id}/cancelar,
 * POST /admin/corridas, and GET /admin/corridas/ativas.
 */
export function RunsPageClient() {
  const { t } = useTranslation("runs");
  const { data: currentUser } = useCurrentUser();

  const [tab, setTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Run | undefined>();

  // All corridas (paginated)
  const { data, isLoading, isError, refetch } = useRuns({
    page,
    limit: 25,
    status: statusFilter || undefined,
  });

  // Active corridas (admin tab, polled every 15s)
  const {
    data: activeRuns,
    isLoading: isLoadingAtivas,
    isError: isErrorAtivas,
    refetch: refetchAtivas,
  } = useActiveRuns();

  const runs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  // ── Content: "Todas" tab ──────────────────────────────────────────────────

  let allContent: ReactNode;

  if (isLoading) {
    allContent = (
      <section data-testid="runs-loading" className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-md bg-neutral-200" />
        ))}
      </section>
    );
  } else if (isError) {
    allContent = <ErrorState data-testid="runs-error" onRetry={() => void refetch()} />;
  } else if (!runs.length) {
    allContent = (
      <section data-testid="runs-empty" className="rounded-md border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-base font-semibold text-neutral-900">{t("page.empty.title")}</h2>
        <p className="mt-1 text-sm text-neutral-700">{t("page.empty.message")}</p>
      </section>
    );
  } else {
    allContent = (
      <>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">{t("table.id")}</th>
                <th className="px-4 py-3">{t("table.status")}</th>
                <th className="hidden px-4 py-3 md:table-cell">{t("table.origem")}</th>
                <th className="hidden px-4 py-3 md:table-cell">{t("table.destino")}</th>
                <th className="hidden px-4 py-3 lg:table-cell">{t("table.distancia")}</th>
                <th className="px-4 py-3">{t("table.createdAt")}</th>
                <th className="px-4 py-3 text-right">{t("page.filters.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {runs.map((run) => (
                <RunRow
                  key={run.id}
                  run={run}
                  onCancel={ACTIVE_STATUSES.has(run.status) ? setCancelTarget : undefined}
                />
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 pt-2">
            <span className="text-xs text-neutral-500">
              {data?.total ?? 0} corridas
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

  // ── Content: "Ativas" tab ─────────────────────────────────────────────────

  let ativasContent: ReactNode;

  if (isLoadingAtivas) {
    ativasContent = (
      <section data-testid="runs-ativas-loading" className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-md bg-neutral-200" />
        ))}
      </section>
    );
  } else if (isErrorAtivas) {
    ativasContent = <ErrorState data-testid="runs-ativas-error" onRetry={() => void refetchAtivas()} />;
  } else if (!activeRuns?.length) {
    ativasContent = (
      <section data-testid="runs-ativas-empty" className="rounded-md border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-base font-semibold text-neutral-900">{t("page.emptyAtivas.title")}</h2>
        <p className="mt-1 text-sm text-neutral-700">{t("page.emptyAtivas.message")}</p>
      </section>
    );
  } else {
    ativasContent = (
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">{t("table.id")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="hidden px-4 py-3 md:table-cell">{t("table.origem")}</th>
              <th className="hidden px-4 py-3 md:table-cell">{t("table.destino")}</th>
              <th className="hidden px-4 py-3 lg:table-cell">{t("table.posicao")}</th>
              <th className="px-4 py-3 text-right">{t("page.filters.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {activeRuns.map((run) => (
              <RunRow
                key={run.id}
                run={run}
                showPosition
                onCancel={setCancelTarget}
              />
            ))}
          </tbody>
        </table>
      </div>
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
          <Can perform={Permission.CREATE_RUN}>
            <Button
              data-testid="runs-create-btn"
              variant="primary"
              size="sm"
              onClick={() => setCreateOpen(true)}
            >
              {t("page.actions.createRun")}
            </Button>
          </Can>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-neutral-200">
          {(["all", "ativas"] as Tab[]).map((t_) => (
            <button
              key={t_}
              type="button"
              data-testid={`runs-tab-${t_}`}
              onClick={() => setTab(t_)}
              className={[
                "px-4 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
                tab === t_
                  ? "border-b-2 border-brand-primary text-brand-primary"
                  : "text-neutral-500 hover:text-neutral-700",
              ].join(" ")}
            >
              {t(`page.tabs.${t_}`)}
            </button>
          ))}
        </div>

        {/* Status filter (only on "all" tab) */}
        {tab === "all" && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={statusFilter === ""}
              onClick={() => { setStatusFilter(""); setPage(1); }}
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                statusFilter === "" ? "bg-brand-primary text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
              ].join(" ")}
            >
              {t("page.filters.all")}
            </button>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                data-testid={`runs-filter-${s}`}
                aria-pressed={statusFilter === s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={[
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                  statusFilter === s ? "bg-brand-primary text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                ].join(" ")}
              >
                {t(`status.${s}`)}
              </button>
            ))}
          </div>
        )}

        {tab === "all" ? allContent : ativasContent}
      </div>

      {/* Create admin run dialog */}
      <RunCreateAdminDialog
        data-testid="run-create-admin-dialog"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Cancel dialog */}
      {cancelTarget && (
        <RunCancelDialog
          data-testid="run-cancel-dialog"
          open={!!cancelTarget}
          onClose={() => setCancelTarget(undefined)}
          runId={cancelTarget.id}
          solicitanteId={currentUser?.id ?? ""}
        />
      )}
    </Can>
  );
}

// ── Row sub-component ─────────────────────────────────────────────────────────

interface RunRowProps {
  run: Run;
  showPosition?: boolean;
  onCancel?: (run: Run) => void;
}

function RunRow({ run, showPosition, onCancel }: RunRowProps) {
  const { t } = useTranslation("runs");
  const statusClass = STATUS_CLASSES[run.status] ?? "bg-neutral-200 text-neutral-700";

  const formatCoord = (c: { lat: number; lng: number }) =>
    `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });

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
      {showPosition ? (
        <td className="hidden px-4 py-3 text-xs text-neutral-600 lg:table-cell">
          {run.motoristaPosition
            ? formatCoord(run.motoristaPosition)
            : "—"}
        </td>
      ) : (
        <td className="hidden px-4 py-3 text-xs text-neutral-600 lg:table-cell">
          {formatDistance(run.distanciaMetros)}
        </td>
      )}
      <td className="px-4 py-3 text-xs text-neutral-500">
        {formatDate(run.createdAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {onCancel && (
            <Can perform={Permission.OVERRIDE_ACTION}>
              <button
                type="button"
                data-testid={`run-cancel-${run.id}`}
                aria-label={t("page.actions.cancel")}
                title={t("page.actions.cancel")}
                onClick={() => onCancel(run)}
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </button>
            </Can>
          )}
        </div>
      </td>
    </tr>
  );
}
