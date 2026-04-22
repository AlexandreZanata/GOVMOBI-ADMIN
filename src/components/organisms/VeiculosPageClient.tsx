"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CircleSlash, Eye, Pencil, RotateCw, Search } from "lucide-react";
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
          </div>
          <Can perform={Permission.VEICULO_CREATE}>
            <Button
              data-testid="veiculos-create-btn"
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
            >
              + {t("actions.create")}
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

  const iconBtn =
    "rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-40";

  return (
    <tr
      data-testid={`veiculo-row-${veiculo.id}`}
      className="transition-colors hover:bg-neutral-50"
    >
      <td className="px-5 py-3 font-medium text-neutral-900">{veiculo.placa}</td>
      <td className="px-5 py-3 text-neutral-700">{veiculo.modelo}</td>
      <td className="hidden px-5 py-3 text-neutral-700 sm:table-cell">{veiculo.ano}</td>
      <td className="px-5 py-3">
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
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-1">
          {/* View */}
          <Can perform={Permission.VEICULO_VIEW}>
            <button
              type="button"
              aria-label={t("actions.view")}
              data-testid={`veiculo-view-${veiculo.id}`}
              className={iconBtn}
              onClick={() => onView(veiculo)}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </button>
          </Can>

          {/* Edit */}
          <Can perform={Permission.VEICULO_EDIT}>
            <button
              type="button"
              aria-label={t("actions.edit")}
              data-testid={`veiculo-edit-${veiculo.id}`}
              className={iconBtn}
              onClick={() => onEdit(veiculo)}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
          </Can>

          {/* Deactivate / Reactivate */}
          <Can perform={veiculo.ativo ? Permission.VEICULO_DESATIVAR : Permission.VEICULO_REATIVAR}>
            <button
              type="button"
              aria-label={veiculo.ativo ? t("actions.desativar") : t("actions.reativar")}
              data-testid={`veiculo-toggle-${veiculo.id}`}
              className={[
                iconBtn,
                veiculo.ativo
                  ? "hover:text-danger hover:bg-danger/10"
                  : "hover:text-success hover:bg-success/10",
              ].join(" ")}
              onClick={() => onToggle(veiculo)}
            >
              {veiculo.ativo ? (
                <CircleSlash className="h-4 w-4" aria-hidden="true" />
              ) : (
                <RotateCw className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </Can>
        </div>
      </td>
    </tr>
  );
}
