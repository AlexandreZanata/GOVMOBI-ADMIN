"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldAlert, ChevronLeft, ChevronRight, Eye, Copy, Check } from "lucide-react";
import "@/i18n/config";

import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { useServidores } from "@/hooks/servidores/useServidores";
import { Permission, type AuditEntry } from "@/models";
import type { AuditFilters } from "@/types/audit";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Translates known aggregateType values, falls back to raw value. */
function getAggregateLabel(t: (key: string, opts?: Record<string, unknown>) => string, aggregateType: string): string {
  return t(`aggregateTypes.${aggregateType}`, { defaultValue: aggregateType });
}

const inputCls = [
  "h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900",
  "placeholder:text-neutral-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
].join(" ");

// ── Main component ────────────────────────────────────────────────────────────

export function AuditPageClient() {
  const { t } = useTranslation("audit");

  const [eventName, setEventName]         = useState("");
  const [aggregateType, setAggregateType] = useState("");
  const [aggregateId, setAggregateId]     = useState("");
  const [isCritico, setIsCritico]         = useState<boolean | undefined>();
  const [dataInicio, setDataInicio]       = useState("");
  const [dataFim, setDataFim]             = useState("");
  const [page, setPage]                   = useState(1);
  const [viewTarget, setViewTarget]       = useState<AuditEntry | undefined>();

  const filters: AuditFilters = useMemo(() => ({
    ...(eventName.trim()      ? { eventName: eventName.trim() }         : {}),
    ...(aggregateType.trim()  ? { aggregateType: aggregateType.trim() } : {}),
    ...(aggregateId.trim()    ? { aggregateId: aggregateId.trim() }     : {}),
    ...(isCritico !== undefined ? { isCritico }                         : {}),
    ...(dataInicio            ? { dataInicio }                          : {}),
    ...(dataFim               ? { dataFim }                             : {}),
    page,
    limit: 20,
  }), [eventName, aggregateType, aggregateId, isCritico, dataInicio, dataFim, page]);

  const { data, total, totalPages, isLoading, isError, refetch } = useAuditTrail(filters);

  const resetPage = () => setPage(1);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{t("page.title")}</h1>
            {!isLoading && total > 0 && (
              <p className="mt-0.5 text-sm text-neutral-500">
                {t("page.counter_other", { count: total })}
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <FilterField label={t("filters.eventName")} id="audit-filter-eventName">
              <input
                id="audit-filter-eventName"
                data-testid="audit-filter-eventName"
                type="text"
                value={eventName}
                onChange={(e) => { setEventName(e.target.value); resetPage(); }}
                placeholder={t("filters.placeholders.eventName")}
                className={inputCls}
              />
            </FilterField>

            <FilterField label={t("filters.aggregateType")} id="audit-filter-aggregateType">
              <input
                id="audit-filter-aggregateType"
                data-testid="audit-filter-aggregateType"
                type="text"
                value={aggregateType}
                onChange={(e) => { setAggregateType(e.target.value); resetPage(); }}
                placeholder={t("filters.placeholders.aggregateType")}
                className={inputCls}
              />
            </FilterField>

            <FilterField label={t("filters.aggregateId")} id="audit-filter-aggregateId">
              <input
                id="audit-filter-aggregateId"
                data-testid="audit-filter-aggregateId"
                type="text"
                value={aggregateId}
                onChange={(e) => { setAggregateId(e.target.value); resetPage(); }}
                placeholder={t("filters.placeholders.aggregateId")}
                className={inputCls}
              />
            </FilterField>

            <FilterField label={t("filters.isCritico")} id="audit-filter-isCritico">
              <select
                id="audit-filter-isCritico"
                data-testid="audit-filter-isCritico"
                value={isCritico === undefined ? "" : String(isCritico)}
                onChange={(e) => {
                  setIsCritico(e.target.value === "" ? undefined : e.target.value === "true");
                  resetPage();
                }}
                className={inputCls}
              >
                <option value="">{t("filters.placeholders.allEvents")}</option>
                <option value="true">{t("filters.placeholders.criticalOnly")}</option>
                <option value="false">{t("filters.placeholders.nonCritical")}</option>
              </select>
            </FilterField>

            <FilterField label={t("filters.dataInicio")} id="audit-filter-dataInicio">
              <input
                id="audit-filter-dataInicio"
                data-testid="audit-filter-dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => { setDataInicio(e.target.value); resetPage(); }}
                className={inputCls}
              />
            </FilterField>

            <FilterField label={t("filters.dataFim")} id="audit-filter-dataFim">
              <input
                id="audit-filter-dataFim"
                data-testid="audit-filter-dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => { setDataFim(e.target.value); resetPage(); }}
                className={inputCls}
              />
            </FilterField>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2" data-testid="audit-loading">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-neutral-100" />
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
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
              <table className="w-full text-sm" data-testid="audit-timeline">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.event")}</th>
                    <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 md:table-cell">{t("table.aggregate")}</th>
                    <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:table-cell">{t("table.occurredAt")}</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.critical")}</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {data.map((entry) => (
                    <AuditRow key={entry.id} entry={entry} onView={setViewTarget} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  {t("page.page", { page, total: totalPages })}
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

      {/* View modal */}
      <AuditViewModal
        entry={viewTarget}
        open={!!viewTarget}
        onClose={() => setViewTarget(undefined)}
      />
    </Can>
  );
}

// ── FilterField ───────────────────────────────────────────────────────────────

function FilterField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-neutral-500">{label}</label>
      {children}
    </div>
  );
}

// ── AuditRow ──────────────────────────────────────────────────────────────────

function AuditRow({ entry, onView }: { entry: AuditEntry; onView: (e: AuditEntry) => void }) {
  const { t } = useTranslation("audit");
  const aggregateLabel = getAggregateLabel(t, entry.aggregateType);

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
          {aggregateLabel}
        </span>
        <p className="mt-0.5 max-w-[180px] truncate text-xs text-neutral-400" title={entry.aggregateId}>
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
            {t("criticality.critical")}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
            {t("criticality.normal")}
          </span>
        )}
      </td>
      <td className="px-5 py-3.5 text-right">
        <button
          type="button"
          aria-label={t("modal.title")}
          onClick={() => onView(entry)}
          className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}

// ── AuditViewModal ────────────────────────────────────────────────────────────

/** UUID-like values get a copy button; plain strings are shown as-is. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Human-readable labels for known payload keys. */
const PAYLOAD_KEY_LABELS: Record<string, string> = {
  adminId:      "Admin",
  corridaId:    "ID da corrida",
  passageiroId: "Passageiro",
  motoristaId:  "Motorista",
  veiculoId:    "Veículo",
  servidorId:   "Servidor",
  observacoes:  "Observações",
  status:       "Status",
  userId:       "Usuário",
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="ml-1 inline-flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-xs text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
    >
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function AuditViewModal({ entry, open, onClose }: { entry: AuditEntry | undefined; open: boolean; onClose: () => void }) {
  const { t } = useTranslation("audit");
  const { data: servidores = [] } = useServidores();

  // All hooks before early return
  const aggregateLabel = entry ? getAggregateLabel(t, entry.aggregateType) : "";

  // Resolve servidor name from ID
  const servidorNome = entry?.servidorId
    ? (servidores.find((s) => s.id === entry.servidorId)?.nome ?? null)
    : null;

  if (!entry) return null;

  const payloadEntries = Object.entries(entry.payload);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("modal.title")}
      subtitle={entry.eventName}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("modal.close")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Critical badge */}
        {entry.isCritico && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
            <p className="text-sm font-medium text-danger">{t("criticality.critical")}</p>
          </div>
        )}

        {/* Main info grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCell label={t("modal.eventName")}    value={entry.eventName} />
          <InfoCell label={t("modal.aggregateType")} value={aggregateLabel} />
          <InfoCell label={t("modal.occurredAt")}   value={new Date(entry.occurredAt).toLocaleString()} />
          <InfoCell label={t("modal.createdAt")}    value={new Date(entry.createdAt).toLocaleString()} />
          <InfoCell label={t("modal.ipAddress")}    value={entry.ipAddress ?? "—"} />
          <InfoCell label={t("modal.isCritico")}    value={entry.isCritico ? t("modal.yes") : t("modal.no")} />
        </div>

        {/* IDs */}
        <div className="space-y-2">
          <InfoCell label={t("modal.aggregateId")} value={entry.aggregateId} mono copyable />

          {/* Servidor — show name + copy ID button */}
          {entry.servidorId && (
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
              <p className="text-xs font-semibold text-neutral-900">{t("modal.servidorId")}</p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="text-sm text-neutral-400">
                  {servidorNome ?? entry.servidorId}
                </span>
                <CopyButton value={entry.servidorId} />
              </div>
            </div>
          )}

          <InfoCell label={t("modal.id")} value={entry.id} mono copyable />
        </div>

        {/* Hash */}
        <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-neutral-900">{t("modal.hash")}</p>
            <CopyButton value={entry.hash} />
          </div>
          <p className="mt-1 break-all font-mono text-xs text-neutral-400">{entry.hash}</p>
        </div>

        {/* Payload */}
        <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
          <p className="mb-3 text-xs font-semibold text-neutral-900">{t("modal.payload")}</p>
          {payloadEntries.length === 0 ? (
            <p className="text-xs text-neutral-400">{t("modal.payloadEmpty")}</p>
          ) : (
            <div className="space-y-2">
              {payloadEntries.map(([key, value]) => {
                const isUuid = typeof value === "string" && UUID_RE.test(value);
                const label = PAYLOAD_KEY_LABELS[key] ?? key;
                const displayValue = typeof value === "string" ? value : JSON.stringify(value);

                return (
                  <div key={key} className="rounded-md border border-neutral-100 bg-neutral-50 px-2.5 py-2">
                    <p className="text-xs font-semibold text-neutral-900">{label}</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <span className={["text-xs text-neutral-400 break-all", isUuid ? "font-mono" : ""].join(" ")}>
                        {displayValue}
                      </span>
                      {isUuid && <CopyButton value={displayValue} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── InfoCell ──────────────────────────────────────────────────────────────────

function InfoCell({ label, value, mono, copyable }: { label: string; value: string; mono?: boolean; copyable?: boolean }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
      <p className="text-xs font-semibold text-neutral-900">{label}</p>
      <div className="mt-0.5 flex items-center gap-1">
        <span className={["text-sm text-neutral-400 break-all", mono ? "font-mono text-xs" : ""].join(" ")}>
          {value}
        </span>
        {copyable && <CopyButton value={value} />}
      </div>
    </div>
  );
}

