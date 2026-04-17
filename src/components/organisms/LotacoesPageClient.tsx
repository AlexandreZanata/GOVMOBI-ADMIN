"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

import { Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { LotacaoDeleteDialog } from "@/components/molecules/LotacaoDeleteDialog";
import { LotacaoFormDialog } from "@/components/molecules/LotacaoFormDialog";
import { LotacaoViewModal } from "@/components/molecules/LotacaoViewModal";
import { useReativarLotacao } from "@/hooks/lotacoes/useReativarLotacao";
import { useLotacoes } from "@/hooks/useLotacoes";
import { filterByAtivo } from "@/lib/filterByAtivo";
import type { AtivoFilter } from "@/lib/filterByAtivo";
import { Permission, type Lotacao } from "@/models";

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

  const [filter, setFilter] = useState<AtivoFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Lotacao | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Lotacao | undefined>();
  const [viewTarget, setViewTarget] = useState<Lotacao | undefined>();

  const byStatus = useMemo(
    () => filterByAtivo(data ?? [], filter),
    [data, filter],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return byStatus;
    return byStatus.filter((l) => l.nome.toLowerCase().includes(term));
  }, [byStatus, search]);

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
        className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
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
                onView={setViewTarget}
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

        {/* Toolbar */}
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
            <input
              data-testid="lotacoes-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              aria-label="Buscar lotações"
              className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div className="hidden h-6 w-px bg-neutral-200 sm:block" aria-hidden="true" />
          <div className="flex gap-1.5" role="group" aria-label={t("page.title")}>
            {(["all", "active", "inactive"] as AtivoFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                data-testid={`lotacoes-filter-${f}`}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                  filter === f
                    ? "bg-brand-primary text-white"
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
          lotacaoId={deleteTarget.id}
          lotacaoNome={deleteTarget.nome}
        />
      )}

      {/* View modal */}
      <LotacaoViewModal
        data-testid="lotacao-view-modal"
        open={!!viewTarget}
        onClose={() => setViewTarget(undefined)}
        lotacao={viewTarget}
      />
    </Can>
  );
}

// ── Row sub-component ────────────────────────────────────────────────────────

interface LotacaoRowProps {
  lotacao: Lotacao;
  onView: (lotacao: Lotacao) => void;
  onEdit: (lotacao: Lotacao) => void;
  onDelete: (lotacao: Lotacao) => void;
}

/**
 * Single table row for a lotação with icon button actions.
 *
 * @param props - Lotacao data and action callbacks
 * @returns Table row with permission-gated action buttons
 */
function LotacaoRow({ lotacao, onView, onEdit, onDelete }: LotacaoRowProps) {
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
        <div className="flex items-center justify-end gap-1">
          {/* View */}
          <button
            type="button"
            data-testid={`lotacao-view-${lotacao.id}`}
            aria-label={t("actions.view")}
            title={t("actions.view")}
            onClick={() => onView(lotacao)}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Edit */}
          <Can perform={Permission.LOTACAO_EDIT}>
            <button
              type="button"
              data-testid={`lotacao-edit-${lotacao.id}`}
              aria-label={t("actions.edit")}
              title={t("actions.edit")}
              onClick={() => onEdit(lotacao)}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          </Can>

          {/* Desativar / Reativar */}
          {lotacao.ativo ? (
            <Can perform={Permission.LOTACAO_DELETE}>
              <button
                type="button"
                data-testid={`lotacao-delete-${lotacao.id}`}
                aria-label={t("actions.delete")}
                title={t("actions.delete")}
                onClick={() => onDelete(lotacao)}
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </button>
            </Can>
          ) : (
            <Can perform={Permission.LOTACAO_REATIVAR}>
              <button
                type="button"
                data-testid={`lotacao-reativar-${lotacao.id}`}
                aria-label={t("actions.reativar")}
                title={t("actions.reativar")}
                onClick={handleReativar}
                disabled={reativarMutation.isPending}
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-success/10 hover:text-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success disabled:opacity-50"
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
