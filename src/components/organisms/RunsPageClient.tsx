"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import "@/i18n/config";

import { Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { RunCancelDialog } from "@/components/molecules/RunCancelDialog";
import { RunCreateAdminDialog } from "@/components/molecules/RunCreateAdminDialog";
import { RunViewModal } from "@/components/molecules/RunViewModal";
import { useActiveRuns } from "@/hooks/runs/useActiveRuns";
import { useRuns } from "@/hooks/runs/useRuns";
import { useReverseGeocoding } from "@/hooks/pesquisa/useReverseGeocoding";
import { Permission, RunStatus } from "@/models";
import type { Run } from "@/models/Run";

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

export function RunsPageClient() {
  const { t } = useTranslation("runs");

  const [tab, setTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Run | undefined>();
  const [viewTarget, setViewTarget] = useState<Run | undefined>();

  // All corridas (paginated, server-side filtered by status)
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

  // Client-side search filter (by ID prefix)
  const filteredRuns = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return runs;
    return runs.filter((r) => r.id.toLowerCase().includes(term));
  }, [runs, search]);

  const filteredAtivas = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return activeRuns ?? [];
    return (activeRuns ?? []).filter((r) => r.id.toLowerCase().includes(term));
  }, [activeRuns, search]);

  // ── Content: "Todas" tab ──────────────────────────────────────────────────

  let allContent: ReactNode;

  if (isLoading) {
    allContent = (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
    );
  } else if (isError) {
    allContent = <ErrorState data-testid="runs-error" onRetry={() => void refetch()} />;
  } else if (!filteredRuns.length) {
    allContent = (
      <div
        data-testid="runs-empty"
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center"
      >
        <p className="text-sm font-medium text-neutral-600">{t("page.empty.title")}</p>
        <p className="mt-1 text-xs text-neutral-400">{t("page.empty.message")}</p>
      </div>
    );
  } else {
    allContent = (
      <>
        <div
          data-testid="runs-table"
          className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.id")}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.status")}</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 md:table-cell">{t("table.origem")}</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 md:table-cell">{t("table.destino")}</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:table-cell">{t("table.distancia")}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.createdAt")}</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredRuns.map((run) => (
                <RunRow
                  key={run.id}
                  run={run}
                  onView={setViewTarget}
                  onCancel={ACTIVE_STATUSES.has(run.status) ? setCancelTarget : undefined}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs text-neutral-500">
              {data?.total ?? 0} {t("page.totalRuns")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40"
              >
                ←
              </button>
              <span className="text-xs text-neutral-700">{page} / {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40"
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
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
    );
  } else if (isErrorAtivas) {
    ativasContent = <ErrorState data-testid="runs-ativas-error" onRetry={() => void refetchAtivas()} />;
  } else if (!filteredAtivas.length) {
    ativasContent = (
      <div
        data-testid="runs-ativas-empty"
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center"
      >
        <p className="text-sm font-medium text-neutral-600">{t("page.emptyAtivas.title")}</p>
        <p className="mt-1 text-xs text-neutral-400">{t("page.emptyAtivas.message")}</p>
      </div>
    );
  } else {
    ativasContent = (
      <div
        data-testid="runs-ativas-table"
        className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.id")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.status")}</th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 md:table-cell">{t("table.origem")}</th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 md:table-cell">{t("table.destino")}</th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:table-cell">{t("table.posicao")}</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filteredAtivas.map((run) => (
              <RunRow
                key={run.id}
                run={run}
                showPosition
                onView={setViewTarget}
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
        <div
          data-testid="runs-access-denied"
          className="rounded-xl border border-danger/20 bg-danger/5 p-6"
        >
          <p className="text-sm font-medium text-danger">{t("page.accessDenied")}</p>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{t("page.title")}</h1>
            {data && (
              <p className="mt-0.5 text-sm text-neutral-500">
                {data.total} {t("page.totalRuns")}
              </p>
            )}
          </div>
          <Can perform={Permission.CREATE_RUN}>
            <Button
              data-testid="runs-create-btn"
              variant="primary"
              size="sm"
              onClick={() => setCreateOpen(true)}
            >
              + {t("page.actions.createRun")}
            </Button>
          </Can>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-neutral-200">
          {(["all", "ativas"] as Tab[]).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              data-testid={`runs-tab-${tabKey}`}
              onClick={() => setTab(tabKey)}
              className={[
                "px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
                tab === tabKey
                  ? "border-b-2 border-brand-primary text-brand-primary"
                  : "text-neutral-500 hover:text-neutral-700",
              ].join(" ")}
            >
              {t(`page.tabs.${tabKey}`)}
            </button>
          ))}
        </div>

        {/* Toolbar: search + status filter pills */}
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="search"
              data-testid="runs-search"
              aria-label={t("page.searchPlaceholder")}
              placeholder={t("page.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {/* Status filter pills — only on "all" tab */}
          {tab === "all" && (
            <>
              <div aria-hidden="true" className="hidden h-6 w-px bg-neutral-200 sm:block" />
              <div
                role="group"
                aria-label={t("page.filters.status")}
                className="flex flex-wrap gap-1.5"
              >
                <button
                  type="button"
                  aria-pressed={statusFilter === ""}
                  onClick={() => { setStatusFilter(""); setPage(1); }}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                    statusFilter === ""
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
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
                      "rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                      statusFilter === s
                        ? "bg-brand-primary text-white shadow-sm"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                    ].join(" ")}
                  >
                    {t(`status.${s}`)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

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
        />
      )}

      {/* View modal */}
      <RunViewModal
        data-testid="run-view-modal"
        open={!!viewTarget}
        onClose={() => setViewTarget(undefined)}
        run={viewTarget}
      />
    </Can>
  );
}

// ── Row sub-component ─────────────────────────────────────────────────────────

interface RunRowProps {
  run: Run;
  showPosition?: boolean;
  onView: (run: Run) => void;
  onCancel?: (run: Run) => void;
}

function RunRow({ run, showPosition, onView, onCancel }: RunRowProps) {
  const { t } = useTranslation("runs");
  const statusClass = STATUS_CLASSES[run.status] ?? "bg-neutral-200 text-neutral-700";

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });

  const formatDistance = (m: number | null) =>
    m == null ? "—" : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;

  return (
    <tr
      data-testid={`run-row-${run.id}`}
      className="transition-colors hover:bg-neutral-50/60"
    >
      <td className="px-5 py-3.5 font-mono text-xs text-neutral-500">
        {run.id.slice(0, 8)}…
      </td>
      <td className="px-5 py-3.5">
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusClass,
          ].join(" ")}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {t(`status.${run.status}`)}
        </span>
      </td>
      <td className="hidden px-5 py-3.5 text-xs text-neutral-600 md:table-cell">
        <AddressCell lat={run.origem.lat} lng={run.origem.lng} />
      </td>
      <td className="hidden px-5 py-3.5 text-xs text-neutral-600 md:table-cell">
        <AddressCell lat={run.destino.lat} lng={run.destino.lng} />
      </td>
      {showPosition ? (
        <td className="hidden px-5 py-3.5 text-xs text-neutral-600 lg:table-cell">
          {run.motoristaPosition
            ? `${run.motoristaPosition.lat.toFixed(4)}, ${run.motoristaPosition.lng.toFixed(4)}`
            : "—"}
        </td>
      ) : (
        <td className="hidden px-5 py-3.5 text-xs text-neutral-600 lg:table-cell">
          {formatDistance(run.distanciaMetros)}
        </td>
      )}
      {!showPosition && (
        <td className="px-5 py-3.5 text-xs text-neutral-500">
          {formatDate(run.createdAt)}
        </td>
      )}
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1">
          {/* View */}
          <button
            type="button"
            data-testid={`run-view-${run.id}`}
            aria-label={t("page.actions.view")}
            title={t("page.actions.view")}
            onClick={() => onView(run)}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Cancel (active runs only) */}
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

// ── AddressCell ───────────────────────────────────────────────────────────────

/**
 * Resolves lat/lng to a human-readable address via reverse-geocoding.
 * Falls back to truncated coordinates while loading or on error.
 */
function AddressCell({ lat, lng }: { lat: number; lng: number }) {
  const { data, isLoading } = useReverseGeocoding(lat, lng);
  const coordFallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  if (isLoading) {
    return <span className="inline-block h-3 w-32 animate-pulse rounded bg-neutral-100" />;
  }

  return (
    <span title={coordFallback} className="line-clamp-1 max-w-[180px]">
      {data ?? coordFallback}
    </span>
  );
}
