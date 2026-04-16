"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { CargoDeleteDialog } from "@/components/molecules/CargoDeleteDialog";
import { CargoFormDialog } from "@/components/molecules/CargoFormDialog";
import { ErrorState } from "@/components/molecules/ErrorState";
import { useCargos } from "@/hooks/cargos/useCargos";
import { useReativarCargo } from "@/hooks/cargos/useReativarCargo";
import { filterByAtivo } from "@/lib/filterByAtivo";
import type { AtivoFilter } from "@/lib/filterByAtivo";
import { Permission } from "@/models";
import type { Cargo } from "@/models/Cargo";

/**
 * Client-side cargos page renderer with table, filter, loading/error/empty states,
 * and permission-gated CRUD action buttons.
 *
 * @returns Interactive cargos management content
 */
export function CargosPageClient() {
  const { t } = useTranslation("cargos");
  const { data, isLoading, isError, refetch } = useCargos();

  const [filter, setFilter] = useState<AtivoFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Cargo | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Cargo | undefined>();

  const filtered = useMemo(
    () => filterByAtivo(data ?? [], filter),
    [data, filter],
  );

  const handleOpenCreate = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (cargo: Cargo) => {
    setEditTarget(cargo);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditTarget(undefined);
  };

  let content: ReactNode;

  if (isLoading) {
    content = (
      <section data-testid="cargos-loading" className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
        ))}
      </section>
    );
  } else if (isError) {
    content = (
      <ErrorState data-testid="cargos-error" onRetry={() => void refetch()} />
    );
  } else if (!filtered.length) {
    content = (
      <section
        data-testid="cargos-empty"
        className="rounded-md border border-neutral-200 bg-neutral-50 p-6"
      >
        <h2 className="text-base font-semibold text-neutral-900">
          {t("page.empty.title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-700">{t("page.empty.message")}</p>
      </section>
    );
  } else {
    content = (
      <div className="overflow-hidden rounded-md border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">{t("table.nome")}</th>
              <th className="px-4 py-3">{t("table.pesoPrioridade")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {filtered.map((cargo) => (
              <CargoRow
                key={cargo.id}
                cargo={cargo}
                onEdit={handleOpenEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Can
      perform={Permission.CARGO_VIEW}
      fallback={
        <section className="rounded-md border border-danger/30 bg-danger/10 p-4">
          <p className="text-sm font-medium text-danger">{t("page.accessDenied")}</p>
        </section>
      }
    >
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">{t("page.title")}</h1>
          <Can perform={Permission.CARGO_CREATE}>
            <Button
              data-testid="cargos-create-btn"
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
            >
              {t("actions.create")}
            </Button>
          </Can>
        </div>

        {/* Filter toggle */}
        <div className="flex gap-2" role="group" aria-label={t("page.title")}>
          {(["all", "active", "inactive"] as AtivoFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              data-testid={`cargos-filter-${f}`}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-opacity",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                filter === f
                  ? "bg-brand-primary text-white"
                  : "bg-neutral-200 text-neutral-700 hover:opacity-80",
              ].join(" ")}
            >
              {t(`page.filters.${f}`)}
            </button>
          ))}
        </div>

        {content}
      </div>

      {/* Form dialog — create / edit */}
      <CargoFormDialog
        data-testid="cargo-form-dialog"
        open={formOpen}
        onClose={handleCloseForm}
        mode={editTarget ? "edit" : "create"}
        cargo={editTarget}
      />

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <CargoDeleteDialog
          data-testid="cargo-delete-dialog"
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(undefined)}
          cargoId={deleteTarget.id}
          cargoNome={deleteTarget.nome}
        />
      )}
    </Can>
  );
}

// ── Row sub-component ────────────────────────────────────────────────────────

interface CargoRowProps {
  cargo: Cargo;
  onEdit: (cargo: Cargo) => void;
  onDelete: (cargo: Cargo) => void;
}

/**
 * Single table row for a cargo with edit and delete/reativar actions.
 *
 * @param props - Cargo data and action callbacks
 * @returns Table row with permission-gated action buttons
 */
function CargoRow({ cargo, onEdit, onDelete }: CargoRowProps) {
  const { t } = useTranslation("cargos");
  const reativarMutation = useReativarCargo();

  const handleReativar = () => {
    void reativarMutation.mutateAsync({ id: cargo.id });
  };

  return (
    <tr
      data-testid={`cargo-row-${cargo.id}`}
      className="transition-colors hover:bg-neutral-50"
    >
      <td className="px-4 py-3 font-medium text-neutral-900">{cargo.nome}</td>
      <td className="px-4 py-3 text-neutral-700">{cargo.pesoPrioridade}</td>
      <td className="px-4 py-3">
        <span
          data-testid={`cargo-status-${cargo.id}`}
          className={[
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            cargo.ativo
              ? "bg-success/15 text-success"
              : "bg-neutral-200 text-neutral-700",
          ].join(" ")}
        >
          {cargo.ativo ? t("status.active") : t("status.inactive")}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Can perform={Permission.CARGO_EDIT}>
            <Button
              data-testid={`cargo-edit-${cargo.id}`}
              size="sm"
              variant="secondary"
              onClick={() => onEdit(cargo)}
            >
              {t("actions.edit")}
            </Button>
          </Can>

          {cargo.ativo ? (
            <Can perform={Permission.CARGO_DELETE}>
              <Button
                data-testid={`cargo-delete-${cargo.id}`}
                size="sm"
                variant="destructive"
                onClick={() => onDelete(cargo)}
              >
                {t("actions.delete")}
              </Button>
            </Can>
          ) : (
            <Can perform={Permission.CARGO_REATIVAR}>
              <Button
                data-testid={`cargo-reativar-${cargo.id}`}
                size="sm"
                variant="success"
                isLoading={reativarMutation.isPending}
                onClick={handleReativar}
              >
                {t("actions.reativar")}
              </Button>
            </Can>
          )}
        </div>
      </td>
    </tr>
  );
}
