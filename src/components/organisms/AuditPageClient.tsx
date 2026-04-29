"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import "@/i18n/config";

import { Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { Permission, type AuditEntry } from "@/models";
import type { AuditFilters } from "@/types/audit";

export function AuditPageClient() {
  const { t } = useTranslation("audit");

  const [eventName, setEventName]         = useState("");
  const [aggregateType, setAggregateType] = useState("");
  const [aggregateId, setAggregateId]     = useState("");
  const [isCritico, setIsCritico]         = useState<boolean | undefined>();
  const [dataInicio, setDataInicio]       = useState("");
  const [dataFim, setDataFim]             = useState("");
  const [page, setPage]                   = useState(1);

  const filters: AuditFilters = useMemo(() => ({
    ...(eventName.trim()     ? { eventName: eventName.trim() }         : {}),
    ...(aggregateType.trim() ? { aggregateType: aggregateType.trim() } : {}),
    ...(aggregateId.trim()   ? { aggregateId: aggregateId.trim() }     : {}),
    ...(isCritico !== undefined ? { isCritico }                        : {}),
    ...(dataInicio           ? { dataInicio }                          : {}),
    ...(dataFim              ? { dataFim }                             : {}),
    page,
    limit: 20,
  }), [eventName, aggregateType, aggregateId, isCritico, dataInicio, dataFim, page]);

  const { data, total, totalPages, isLoading, isError, refetch } = useAuditTrail(filters);

  const handleFilterChange = () => setPage(1);

  return (
    <Can
      perform={Permission.AUDIT_VIEW}
      fallback={
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6">
          <p className="text-sm font-medium text-danger">{t("page.accessDenied")}</p>
        </div>
      }
    >
      <div className="space-y-5" data-testid="audit-page-client">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{t("page.title")}</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{t("page.subtitle")}</p>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <FilterField label={t("filters.eventName")} testId="audit-filter-eventName">
              <input
                data-testid="audit-filter-eventName"
                type="text"
                value={eventName}
                onChange={(e) => { setEventName(e.target.value); handleFilterChange(); }}
                placeholder={t("filters.placeholders.eventName")}
                className={inputCls}
              />
            </FilterField>

            <FilterField label={t("filters.aggregateType")} testId="audit-filter-aggregateType">
              <input
                data-testid="audit-filter-aggregateType"
                type="text"
                value={aggregateType}
                onChange={(e) => { setAggregateType(e.target.value); handleFilterChange(); }}
                placeholder={t("filters.placeholders.aggregateType")}
                className={inputCls}
              />
            </FilterField>

            <FilterField label={t("filters.aggregateId")} testId="audit-filter-aggregateId">
              <input
                data-testid="audit-filter-aggregateId"
                type="text"
                value={aggregateId}
                onChange={(e) => { setAggregateId(e.target.value); handleFilterChange(); }}
                placeholder="UUID do aggregate"
                className={inputCls}
              />
            </FilterField>

            <FilterField label={t("filters.isCritico")} testId="audit-filter-isCritico">
              <select
                data-testid="audit-filter-isCritico"
                value={isCritico === undefined ? "" : String(isCritico)}
                onChange={(e) => {
                  setIsCritico(e.target.value === "" ? undefined : e.target.value === "true");
                  handleFilterChange();
                }}
                className={inputCls}
              >
                <option value="">{t("filters.placeholders.allEvents")}</option>
                <option value="true">{t("filters.placeholders.criticalOnly")}</option>
                <option value="false">{t("filters.placeholders.nonCritical")}</option>
              </select>
            </FilterField>

            <FilterField label={t("filters.dataInicio")} testId="audit-filter-dataInicio">
              <input
                data-testid="audit-filter-dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => { setDataInicio(e.target.value); handleFilterChange(); }}
                className={inputCls}
              />
            </FilterField>

            <FilterField label={t("filters.dataFim")} testId="audit-filter-dataFim">
              <input
                data-testid="audit-filter-dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => { setDataFim(e.target.value); handleFilterChange(); }}
                className={inputCls}
              />
            </FilterField>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2" data-testid="audit-loading">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-neutral-100" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState data-testid="audit-error" onRetry={() => void refetch()} />
        ) : data.length === 0 ? (
          <div data-testid="audit-empty" className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm font-medium text-neutral-600">{t("page.empty.title")}</p>
            <p className="mt-1 text-xs text-neutral-400">{t("page.empty.message")}</p>
          </div>
        ) : (
          <>
            {/* Counter */}
            <p className="text-sm text-neutral-500">
              {total} {total === 1 ? "evento" : "eventos"}
            </p>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
              <table className="w-full text-sm" data-testid="audit-timeline">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.event")}</th>
                    <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 md:table-cell">{t("table.aggregate")}</th>
                    <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:table-cell">{t("table.occurredAt")}</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.critical")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {data.map((entry) => (
                    <AuditRow key={entry.id} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-md border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-md border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Can>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const inputCls = [
  "h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900",
  "placeholder:text-neutral-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
].join(" ");

function FilterField({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={testId} className="text-xs font-medium text-neutral-500">{label}</label>
      {children}
    </div>
  );
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  return (
    <tr data-testid={`audit-entry-${entry.id}`} className="transition-colors hover:bg-neutral-50/60">
      <td className="px-5 py-3.5">
        <p className="font-medium text-neutral-900">{entry.eventName}</p>
        {entry.ipAddress && (
          <p className="mt-0.5 text-xs text-neutral-400">{entry.ipAddress}</p>
        )}
      </td>
      <td className="hidden px-5 py-3.5 md:table-cell">
        <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
          {entry.aggregateType}
        </span>
        <p className="mt-0.5 truncate text-xs text-neutral-400 max-w-[180px]" title={entry.aggregateId}>
          {entry.aggregateId}
        </p>
      </td>
      <td className="hidden px-5 py-3.5 text-sm text-neutral-600 lg:table-cell">
        {new Date(entry.occurredAt).toLocaleString()}
      </td>
      <td className="px-5 py-3.5">
        {entry.isCritico ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">
            <ShieldAlert className="h-3 w-3" aria-hidden="true" />
            Crítico
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
            Normal
          </span>
        )}
      </td>
    </tr>
  );
}
