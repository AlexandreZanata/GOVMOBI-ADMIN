"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { VeiculoDesativarDialog } from "@/components/molecules/VeiculoDesativarDialog";
import { VeiculoFormDialog } from "@/components/molecules/VeiculoFormDialog";
import { useVeiculos } from "@/hooks/veiculos/useVeiculos";
import { filterByAtivo } from "@/lib/filterByAtivo";
import type { AtivoFilter } from "@/lib/filterByAtivo";
import { Permission } from "@/models";
import type { Veiculo } from "@/models/Veiculo";

/**
 * Client-side vehicles page renderer with table, filter, loading/error/empty states,
 * and permission-gated CRUD action buttons.
 */
export function VeiculosPageClient() {
  const { t } = useTranslation("veiculos");
  const { data, isLoading, isError, refetch } = useVeiculos();

  const [filter, setFilter] = useState<AtivoFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Veiculo | undefined>();
  const [dialogTarget, setDialogTarget] = useState<Veiculo | undefined>();

  const filtered = useMemo(() => filterByAtivo(data ?? [], filter), [data, filter]);

  const handleOpenCreate = () => { setEditTarget(undefined); setFormOpen(true); };
  const handleOpenEdit = (v: Veiculo) => { setEditTarget(v); setFormOpen(true); };
  const handleCloseForm = () => { setFormOpen(false); setEditTarget(undefined); };

  let content: ReactNode;

  if (isLoading) {
    content = (
      <section data-testid="veiculos-loading" className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
        ))}
      </section>
    );
  } else if (isError) {
    content = <ErrorState data-testid="veiculos-error" onRetry={() => void refetch()} />;
  } else if (!filtered.length) {
    content = (
      <section data-testid="veiculos-empty" className="rounded-md border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-base font-semibold text-neutral-900">{t("page.empty.title")}</h2>
        <p className="mt-1 text-sm text-neutral-700">{t("page.empty.message")}</p>
      </section>
    );
  } else {
    content = (
      <div data-testid="veiculos-table" className="overflow-hidden rounded-md border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">{t("table.placa")}</th>
              <th className="px-4 py-3">{t("table.modelo")}</th>
              <th className="px-4 py-3">{t("table.ano")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {filtered.map((veiculo) => (
              <VeiculoRow key={veiculo.id} veiculo={veiculo}
                onEdit={handleOpenEdit} onToggle={setDialogTarget} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Can perform={Permission.VEICULO_VIEW}
      fallback={
        <section data-testid="veiculos-access-denied" className="rounded-md border border-danger/30 bg-danger/10 p-4">
          <p className="text-sm font-medium text-danger">{t("page.accessDenied")}</p>
        </section>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">{t("page.title")}</h1>
          <Can perform={Permission.VEICULO_CREATE}>
            <Button data-testid="veiculos-create-btn" variant="primary" size="sm" onClick={handleOpenCreate}>
              {t("actions.create")}
            </Button>
          </Can>
        </div>

        <div data-testid="veiculos-filter" className="flex gap-2" role="group" aria-label={t("page.title")}>
          {(["all", "active", "inactive"] as AtivoFilter[]).map((f) => (
            <button key={f} type="button" data-testid={`veiculos-filter-${f}`}
              aria-pressed={filter === f} onClick={() => setFilter(f)}
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-opacity",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                filter === f ? "bg-brand-primary text-white" : "bg-neutral-200 text-neutral-700 hover:opacity-80",
              ].join(" ")}
            >
              {t(`page.filters.${f}`)}
            </button>
          ))}
        </div>

        {content}
      </div>

      <VeiculoFormDialog data-testid="veiculo-form-dialog" open={formOpen}
        onClose={handleCloseForm} mode={editTarget ? "edit" : "create"} veiculo={editTarget} />

      {dialogTarget && (
        <VeiculoDesativarDialog data-testid="veiculo-desativar-dialog"
          open={!!dialogTarget} onClose={() => setDialogTarget(undefined)}
          veiculoId={dialogTarget.id} veiculoPlaca={dialogTarget.placa}
          isActive={dialogTarget.ativo} />
      )}
    </Can>
  );
}

interface VeiculoRowProps {
  veiculo: Veiculo;
  onEdit: (v: Veiculo) => void;
  onToggle: (v: Veiculo) => void;
}

function VeiculoRow({ veiculo, onEdit, onToggle }: VeiculoRowProps) {
  const { t } = useTranslation("veiculos");

  return (
    <tr data-testid={`veiculo-row-${veiculo.id}`} className="transition-colors hover:bg-neutral-50">
      <td className="px-4 py-3 font-medium text-neutral-900">{veiculo.placa}</td>
      <td className="px-4 py-3 text-neutral-700">{veiculo.modelo}</td>
      <td className="px-4 py-3 text-neutral-700">{veiculo.ano}</td>
      <td className="px-4 py-3">
        <span data-testid={`veiculo-status-${veiculo.id}`}
          className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            veiculo.ativo ? "bg-success/15 text-success" : "bg-neutral-200 text-neutral-700"].join(" ")}>
          {veiculo.ativo ? t("status.active") : t("status.inactive")}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Can perform={Permission.VEICULO_EDIT}>
            <Button data-testid={`veiculo-edit-${veiculo.id}`} size="sm" variant="secondary" onClick={() => onEdit(veiculo)}>
              {t("actions.edit")}
            </Button>
          </Can>
          <Can perform={veiculo.ativo ? Permission.VEICULO_DESATIVAR : Permission.VEICULO_REATIVAR}>
            <Button
              data-testid={`veiculo-toggle-${veiculo.id}`}
              size="sm"
              variant={veiculo.ativo ? "destructive" : "primary"}
              onClick={() => onToggle(veiculo)}
            >
              {veiculo.ativo ? t("actions.desativar") : t("actions.reativar")}
            </Button>
          </Can>
        </div>
      </td>
    </tr>
  );
}
