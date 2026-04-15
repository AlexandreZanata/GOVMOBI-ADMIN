"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { MotoristaDesativarDialog } from "@/components/molecules/MotoristaDesativarDialog";
import { MotoristaFormDialog } from "@/components/molecules/MotoristaFormDialog";
import { MotoristaStatusDialog } from "@/components/molecules/MotoristaStatusDialog";
import { useMotoristas } from "@/hooks/motoristas/useMotoristas";
import { Permission } from "@/models";
import type { Motorista } from "@/models/Motorista";

/** Active filter for the motoristas list. */
type FilterValue = "all" | "active" | "inactive";

/**
 * Props for the motoristas page client organism.
 */
export interface MotoristasPageClientProps {
  /** Optional test selector assigned to the root section. */
  "data-testid"?: string;
}

/**
 * Client-side motoristas page renderer with query state handling and filtering.
 * Manages create, edit, status update, desativar, and reativar actions.
 *
 * @param props - Optional root test selector
 * @returns Interactive motoristas management content
 */
export function MotoristasPageClient({
  "data-testid": testId,
}: MotoristasPageClientProps) {
  const { t } = useTranslation("motoristas");
  const { data, isLoading, isError, refetch } = useMotoristas();

  const [filter, setFilter] = useState<FilterValue>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Motorista | undefined>();
  const [statusTarget, setStatusTarget] = useState<Motorista | undefined>();
  const [desativarTarget, setDesativarTarget] = useState<Motorista | undefined>();

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (filter === "active") return list.filter((m) => m.ativo);
    if (filter === "inactive") return list.filter((m) => !m.ativo);
    return list;
  }, [data, filter]);

  const handleOpenCreate = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (motorista: Motorista) => {
    setEditTarget(motorista);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditTarget(undefined);
  };

  let content: ReactNode;

  if (isLoading) {
    content = (
      <section data-testid="motoristas-loading" className="space-y-3">
        <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200" />
        <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
        <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
        <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
      </section>
    );
  } else if (isError) {
    content = (
      <ErrorState
        data-testid="motoristas-error"
        onRetry={() => void refetch()}
      />
    );
  } else if (!filtered.length) {
    content = (
      <section
        data-testid="motoristas-empty"
        className="rounded-md border border-neutral-200 bg-neutral-50 p-6"
      >
        <h2 className="text-base font-semibold text-neutral-900">
          {t("page.empty.title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-700">
          {t("page.empty.message")}
        </p>
      </section>
    );
  } else {
    content = (
      <div
        data-testid={testId ?? "motoristas-table"}
        className="overflow-hidden rounded-md border border-neutral-200"
      >
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">{t("table.cnhNumero")}</th>
              <th className="px-4 py-3">{t("table.cnhCategoria")}</th>
              <th className="px-4 py-3">{t("table.statusOperacional")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {filtered.map((motorista) => (
              <MotoristaRow
                key={motorista.id}
                motorista={motorista}
                onEdit={handleOpenEdit}
                onUpdateStatus={setStatusTarget}
                onDesativar={setDesativarTarget}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Can
      perform={Permission.MOTORISTA_VIEW}
      fallback={
        <section
          data-testid="motoristas-access-denied"
          className="rounded-md border border-danger/30 bg-danger/10 p-4"
        >
          <p className="text-sm font-medium text-danger">
            {t("page.accessDenied")}
          </p>
        </section>
      }
    >
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">
            {t("page.title")}
          </h1>
          <Can perform={Permission.MOTORISTA_CREATE}>
            <Button
              data-testid="motoristas-create-btn"
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
            >
              {t("actions.create")}
            </Button>
          </Can>
        </div>

        {/* Filter toggle */}
        <div
          data-testid="motoristas-filter"
          className="flex gap-2"
          role="group"
          aria-label={t("page.title")}
        >
          {(["all", "active", "inactive"] as FilterValue[]).map((f) => (
            <button
              key={f}
              type="button"
              data-testid={`motoristas-filter-${f}`}
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

      {/* Create / Edit dialog */}
      <MotoristaFormDialog
        data-testid="motorista-form-dialog"
        open={formOpen}
        onClose={handleCloseForm}
        mode={editTarget ? "edit" : "create"}
        motorista={editTarget}
      />

      {/* Status update dialog */}
      {statusTarget && (
        <MotoristaStatusDialog
          data-testid="motorista-status-dialog"
          open={!!statusTarget}
          onClose={() => setStatusTarget(undefined)}
          motorista={statusTarget}
        />
      )}

      {/* Desativar / Reativar dialog */}
      {desativarTarget && (
        <MotoristaDesativarDialog
          data-testid="motorista-desativar-dialog"
          open={!!desativarTarget}
          onClose={() => setDesativarTarget(undefined)}
          motorista={desativarTarget}
        />
      )}
    </Can>
  );
}

// ── Row sub-component ────────────────────────────────────────────────────────

interface MotoristaRowProps {
  motorista: Motorista;
  onEdit: (motorista: Motorista) => void;
  onUpdateStatus: (motorista: Motorista) => void;
  onDesativar: (motorista: Motorista) => void;
}

/**
 * Single table row for a motorista with edit, status, and desativar/reativar actions.
 *
 * @param props - Motorista data and action callbacks
 * @returns Table row with permission-gated action buttons
 */
function MotoristaRow({
  motorista,
  onEdit,
  onUpdateStatus,
  onDesativar,
}: MotoristaRowProps) {
  const { t } = useTranslation("motoristas");

  return (
    <tr
      data-testid={`motorista-row-${motorista.id}`}
      className="transition-colors hover:bg-neutral-50"
    >
      <td className="px-4 py-3 font-medium text-neutral-900">
        {motorista.cnhNumero}
      </td>

      <td className="px-4 py-3 text-neutral-700">{motorista.cnhCategoria}</td>

      <td className="px-4 py-3">
        <span
          data-testid={`motorista-op-status-${motorista.id}`}
          className={[
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            motorista.statusOperacional === "DISPONIVEL"
              ? "bg-success/15 text-success"
              : motorista.statusOperacional === "EM_SERVICO"
                ? "bg-info/15 text-info"
                : "bg-neutral-200 text-neutral-700",
          ].join(" ")}
        >
          {t(`status.${motorista.statusOperacional}`)}
        </span>
      </td>

      <td className="px-4 py-3">
        <span
          data-testid={`motorista-status-${motorista.id}`}
          className={[
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            motorista.ativo
              ? "bg-success/15 text-success"
              : "bg-neutral-200 text-neutral-700",
          ].join(" ")}
        >
          {motorista.ativo ? t("status.active") : t("status.inactive")}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Can perform={Permission.MOTORISTA_EDIT}>
            <Button
              data-testid={`motorista-edit-${motorista.id}`}
              size="sm"
              variant="secondary"
              onClick={() => onEdit(motorista)}
            >
              {t("actions.edit")}
            </Button>
          </Can>

          <Can perform={Permission.MOTORISTA_STATUS}>
            <Button
              data-testid={`motorista-status-btn-${motorista.id}`}
              size="sm"
              variant="ghost"
              onClick={() => onUpdateStatus(motorista)}
            >
              {t("actions.updateStatus")}
            </Button>
          </Can>

          <Can perform={Permission.MOTORISTA_DESATIVAR}>
            <Button
              data-testid={`motorista-desativar-${motorista.id}`}
              size="sm"
              variant={motorista.ativo ? "destructive" : "ghost"}
              onClick={() => onDesativar(motorista)}
            >
              {motorista.ativo
                ? t("actions.desativar")
                : t("actions.reativar")}
            </Button>
          </Can>
        </div>
      </td>
    </tr>
  );
}
