"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import "@/i18n/config";

import { Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { VeiculoDesativarDialog } from "@/components/molecules/VeiculoDesativarDialog";
import { VeiculoFormDialog } from "@/components/molecules/VeiculoFormDialog";
import { VeiculoViewModal } from "@/components/molecules/VeiculoViewModal";
import { useVeiculos } from "@/hooks/veiculos/useVeiculos";
import { filterByAtivo } from "@/lib/filterByAtivo";
import type { AtivoFilter } from "@/lib/filterByAtivo";
import { Permission } from "@/models";
import type { Veiculo } from "@/models/Veiculo";

/**
 * Client-side vehicles page with search, filter pills, icon buttons,
 * view modal, form dialog, and deactivate/reactivate dialog.
 */
export function VeiculosPageClient() {
  const { t } = useTranslation("veiculos");
  const { data, isLoading, isError, refetch } = useVeiculos();

  const [filter, setFilter] = useState<AtivoFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Veiculo | undefined>();
  const [dialogTarget, setDialogTarget] = useState<Veiculo | undefined>();
  const [viewTarget, setViewTarget] = useState<Veiculo | undefined>();

  const byStatus = useMemo(() => filterByAtivo(data ?? [], filter), [data, filter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return byStatus;
    return byStatus.filter(
      (v) =>
        v.placa.toLowerCase().includes(term) ||
        v.modelo.toLowerCase().includes(term) ||
        String(v.ano).includes(term),
    );
  }, [byStatus, search]);

  const handleOpenCreate = () => { setEditTarget(undefined); setFormOpen(true); };
  const handleOpenEdit = (v: Veiculo) => { setEditTarget(v); setFormOpen(true); };
  const handleCloseForm = () => { setFormOpen(false); setEditTarget(undefined); };

  let content: ReactNode;

  if (isLoading) {
    content = (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
    );
  } else if (isError) {
    content = <ErrorState data-testid="veiculos-error" onRetry={() => void refetch()} />;
  } else if (!filtered.length) {
    content = (
      <div
        data-testid="veiculos-empty"
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center"
      >
        <p className="text-sm font-medium text-neutral-600">{t("page.empty.title")}</p>
        <p className="mt-1 text-xs text-neutral-400">{t("page.empty.message")}</p>
      </div>
    );
  } else {
    content = (
      <div
        data-testid="veiculos-table"
        className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {t("table.placa")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {t("table.modelo")}
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 sm:table-cell">
                {t("table.ano")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {t("table.status")}
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {filtered.map((veiculo) => (
              <VeiculoRow
                key={veiculo.id}
                veiculo={veiculo}
                onView={setViewTarget}
                onEdit={handleOpenEdit}
                onToggle={setDialogTarget}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Can
      perform={Permission.VEICULO_VIEW}
      fallback={
        <div
          data-testid="veiculos-access-denied"
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
                {filtered.length} {filtered.length === 1 ? "veículo" : "veículos"}
              </p>
            )}
          </div>
          <Can perform={Permission.VEICULO_CREATE}>
            <Button
              data-testid="veiculos-create-btn"
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
            >
              {t("actions.create")}
            </Button>
          </Can>
        </div>

        {/* Toolbar: search + filter pills */}
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="search"
              data-testid="veiculos-search"
              aria-label={t("page.searchPlaceholder")}
              placeholder={t("page.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div aria-hidden="true" className="hidden h-6 w-px bg-neutral-200 sm:block" />
          <div
            role="group"
            aria-label={t("page.title")}
            className="flex gap-1.5"
          >
            {(["all", "active", "inactive"] as AtivoFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                data-testid={`veiculos-filter-${f}`}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                  filter === f
                    ? "bg-brand-primary text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                ].join(" ")}
              >
                {t(`page.filters.${f}`)}
              </button>
            ))}
          </div>
        </div>

        {content}
      </div>

      {/* Dialogs */}
      <VeiculoFormDialog
        data-testid="veiculo-form-dialog"
        open={formOpen}
        onClose={handleCloseForm}
        mode={editTarget ? "edit" : "create"}
        veiculo={editTarget}
      />

      {dialogTarget && (
        <VeiculoDesativarDialog
          data-testid="veiculo-desativar-dialog"
          open={!!dialogTarget}
          onClose={() => setDialogTarget(undefined)}
          veiculoId={dialogTarget.id}
          veiculoPlaca={dialogTarget.placa}
          isActive={dialogTarget.ativo}
        />
      )}

      <VeiculoViewModal
        data-testid="veiculo-view-modal"
        open={!!viewTarget}
        onClose={() => setViewTarget(undefined)}
        veiculo={viewTarget}
      />
    </Can>
  );
}

interface VeiculoRowProps {
  veiculo: Veiculo;
  onView: (v: Veiculo) => void;
  onEdit: (v: Veiculo) => void;
  onToggle: (v: Veiculo) => void;
}

function VeiculoRow({ veiculo, onView, onEdit, onToggle }: VeiculoRowProps) {
  const { t } = useTranslation("veiculos");

  return (
    <tr
      data-testid={`veiculo-row-${veiculo.id}`}
      className="transition-colors hover:bg-neutral-50/60"
    >
      <td className="px-5 py-3.5 font-medium text-neutral-900">{veiculo.placa}</td>
      <td className="px-5 py-3.5 text-neutral-700">{veiculo.modelo}</td>
      <td className="hidden px-5 py-3.5 text-neutral-700 sm:table-cell">{veiculo.ano}</td>
      <td className="px-5 py-3.5">
        <span
          data-testid={`veiculo-status-${veiculo.id}`}
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
            veiculo.ativo
              ? "bg-success/10 text-success"
              : "bg-neutral-100 text-neutral-500",
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className={[
              "h-1.5 w-1.5 rounded-full",
              veiculo.ativo ? "bg-success" : "bg-neutral-400",
            ].join(" ")}
          />
          {veiculo.ativo ? t("status.active") : t("status.inactive")}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1">
          {/* View */}
          <Can perform={Permission.VEICULO_VIEW}>
            <button
              type="button"
              data-testid={`veiculo-view-${veiculo.id}`}
              aria-label={t("actions.view")}
              title={t("actions.view")}
              onClick={() => onView(veiculo)}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </Can>

          {/* Edit */}
          <Can perform={Permission.VEICULO_EDIT}>
            <button
              type="button"
              data-testid={`veiculo-edit-${veiculo.id}`}
              aria-label={t("actions.edit")}
              title={t("actions.edit")}
              onClick={() => onEdit(veiculo)}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          </Can>

          {/* Desativar / Reativar */}
          {veiculo.ativo ? (
            <Can perform={Permission.VEICULO_DESATIVAR}>
              <button
                type="button"
                data-testid={`veiculo-toggle-${veiculo.id}`}
                aria-label={t("actions.desativar")}
                title={t("actions.desativar")}
                onClick={() => onToggle(veiculo)}
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </button>
            </Can>
          ) : (
            <Can perform={Permission.VEICULO_REATIVAR}>
              <button
                type="button"
                data-testid={`veiculo-toggle-${veiculo.id}`}
                aria-label={t("actions.reativar")}
                title={t("actions.reativar")}
                onClick={() => onToggle(veiculo)}
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-success/10 hover:text-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </Can>
          )}
        </div>
      </td>
    </tr>
  );
}
