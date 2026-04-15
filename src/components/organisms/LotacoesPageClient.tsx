"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { LotacaoDeleteDialog } from "@/components/molecules/LotacaoDeleteDialog";
import { LotacaoFormDialog } from "@/components/molecules/LotacaoFormDialog";
import { useReativarLotacao } from "@/hooks/lotacoes/useReativarLotacao";
import { useLotacoes } from "@/hooks/useLotacoes";
import { Permission, type Lotacao } from "@/models";

/** Active filter for the lotacoes list. */
type FilterValue = "all" | "active" | "inactive";

/**
 * Props for the lotacoes page client organism.
 */
export interface LotacoesPageClientProps {
  /** Optional test selector assigned to the root section. */
  "data-testid"?: string;
}

/**
 * Client-side lotações page renderer with query state handling and filtering.
 *
 * @param props - Optional root test selector
 * @returns Interactive lotações management content
 */
export function LotacoesPageClient({
  "data-testid": testId,
}: LotacoesPageClientProps) {
  const { t } = useTranslation("lotacoes");
  const { data, isLoading, isError, refetch } = useLotacoes();

  const [filter, setFilter] = useState<FilterValue>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Lotacao | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Lotacao | undefined>();

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (filter === "active") return list.filter((l) => l.ativo);
    if (filter === "inactive") return list.filter((l) => !l.ativo);
    return list;
  }, [data, filter]);

  const handleOpenCreate = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (lotacao: Lotacao) => {
    setEditTarget(lotacao);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditTarget(undefined);
  };

  let content: ReactNode;

  if (isLoading) {
    content = (
      <section data-testid="lotacoes-loading" className="space-y-3">
        <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200" />
        <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
        <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
        <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
      </section>
    );
  } else if (isError) {
    content = (
      <ErrorState
        data-testid="lotacoes-error"
        onRetry={() => void refetch()}
      />
    );
  } else if (!filtered.length) {
    content = (
      <section
        data-testid="lotacoes-empty"
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
        data-testid={testId ?? "lotacoes-table"}
        className="overflow-hidden rounded-md border border-neutral-200"
      >
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">{t("table.nome")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {filtered.map((lotacao) => (
              <LotacaoRow
                key={lotacao.id}
                lotacao={lotacao}
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
      perform={Permission.LOTACAO_VIEW}
      fallback={
        <section
          data-testid="lotacoes-access-denied"
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
          <Can perform={Permission.LOTACAO_CREATE}>
            <Button
              data-testid="lotacoes-create-btn"
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
          data-testid="lotacoes-filter"
          className="flex gap-2"
          role="group"
          aria-label={t("page.title")}
        >
          {(["all", "active", "inactive"] as FilterValue[]).map((f) => (
            <button
              key={f}
              type="button"
              data-testid={`lotacoes-filter-${f}`}
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
      <LotacaoFormDialog
        data-testid="lotacao-form-dialog"
        open={formOpen}
        onClose={handleCloseForm}
        mode={editTarget ? "edit" : "create"}
        lotacao={editTarget}
      />

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <LotacaoDeleteDialog
          data-testid="lotacao-delete-dialog"
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(undefined)}
          lotacao={deleteTarget}
        />
      )}
    </Can>
  );
}

// ── Row sub-component ────────────────────────────────────────────────────────

interface LotacaoRowProps {
  lotacao: Lotacao;
  onEdit: (lotacao: Lotacao) => void;
  onDelete: (lotacao: Lotacao) => void;
}

/**
 * Single table row for a lotação with edit and delete/reativar actions.
 *
 * @param props - Lotacao data and action callbacks
 * @returns Table row with permission-gated action buttons
 */
function LotacaoRow({ lotacao, onEdit, onDelete }: LotacaoRowProps) {
  const { t } = useTranslation("lotacoes");
  const reativarMutation = useReativarLotacao();

  const handleReativar = () => {
    void reativarMutation.mutateAsync({ id: lotacao.id });
  };

  return (
    <tr
      data-testid={`lotacao-row-${lotacao.id}`}
      className="transition-colors hover:bg-neutral-50"
    >
      <td className="px-4 py-3 font-medium text-neutral-900">{lotacao.nome}</td>

      <td className="px-4 py-3">
        <span
          data-testid={`lotacao-status-${lotacao.id}`}
          className={[
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            lotacao.ativo
              ? "bg-success/15 text-success"
              : "bg-neutral-200 text-neutral-700",
          ].join(" ")}
        >
          {lotacao.ativo ? t("status.active") : t("status.inactive")}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Can perform={Permission.LOTACAO_EDIT}>
            <Button
              data-testid={`lotacao-edit-${lotacao.id}`}
              size="sm"
              variant="secondary"
              onClick={() => onEdit(lotacao)}
            >
              {t("actions.edit")}
            </Button>
          </Can>

          <Can perform={Permission.LOTACAO_DELETE}>
            {lotacao.ativo ? (
              <Button
                data-testid={`lotacao-delete-${lotacao.id}`}
                size="sm"
                variant="destructive"
                onClick={() => onDelete(lotacao)}
              >
                {t("actions.delete")}
              </Button>
            ) : (
              <Button
                data-testid={`lotacao-reativar-${lotacao.id}`}
                size="sm"
                variant="success"
                isLoading={reativarMutation.isPending}
                onClick={handleReativar}
              >
                {t("actions.reativar")}
              </Button>
            )}
          </Can>
        </div>
      </td>
    </tr>
  );
}
