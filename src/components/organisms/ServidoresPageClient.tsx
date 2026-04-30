"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

import { Badge, Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { ServidorDeleteDialog } from "@/components/molecules/ServidorDeleteDialog";
import { ServidorFormDialog } from "@/components/molecules/ServidorFormDialog";
import { ServidorViewModal } from "@/components/molecules/ServidorViewModal";
import { formatCpf } from "@/lib/formatCpf";
import { unformatCpf } from "@/lib/cpfUtils";
import { useReativarServidor } from "@/hooks/servidores/useReativarServidor";
import { useServidores } from "@/hooks/servidores/useServidores";
import { useCargos } from "@/hooks/cargos/useCargos";
import { useLotacoes } from "@/hooks/useLotacoes";
import { filterByAtivo } from "@/lib/filterByAtivo";
import type { AtivoFilter } from "@/lib/filterByAtivo";
import { Permission, Papel } from "@/models";
import type { Servidor } from "@/models/Servidor";

const papelVariant: Record<Papel, "danger" | "info" | "neutral"> = {
  [Papel.ADMIN]: "danger",
  [Papel.MOTORISTA]: "info",
  [Papel.USUARIO]: "neutral",
};

/**
 * Client-side servidores page with search, status filter, and CRUD actions.
 */
export function ServidoresPageClient() {
  const { t } = useTranslation("servidores");
  const { data, isLoading, isError, refetch } = useServidores();

  // Pre-load cargos and lotacoes for name resolution in ServidorViewModal
  const { data: cargosData } = useCargos();
  const { data: lotacoesData } = useLotacoes();

  const [filter, setFilter] = useState<AtivoFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Servidor | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Servidor | undefined>();
  const [viewTarget, setViewTarget] = useState<Servidor | undefined>();

  const byStatus = useMemo(() => filterByAtivo(data ?? [], filter), [data, filter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return byStatus;
    const digits = unformatCpf(term);
    return byStatus.filter((s) =>
      s.nome.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      (digits.length >= 3 && s.cpf.includes(digits))
    );
  }, [byStatus, search]);

  const handleOpenCreate = () => { setEditTarget(undefined); setFormOpen(true); };
  const handleOpenEdit = (s: Servidor) => { setEditTarget(s); setFormOpen(true); };
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
    content = <ErrorState data-testid="servidores-error" onRetry={() => void refetch()} />;
  } else if (!filtered.length) {
    content = (
      <div data-testid="servidores-empty" className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
        <p className="text-sm font-medium text-neutral-600">{t("page.empty.title")}</p>
        <p className="mt-1 text-xs text-neutral-400">{t("page.empty.message")}</p>
      </div>
    );
  } else {
    content = (
      <div data-testid="servidores-table" className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.nome")}</th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 md:table-cell">{t("table.cpf")}</th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:table-cell">{t("table.email")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.papeis")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.status")}</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.map((servidor) => (
              <ServidorRow key={servidor.id} servidor={servidor} onView={setViewTarget} onEdit={handleOpenEdit} onDelete={setDeleteTarget} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Can
      perform={Permission.SERVIDOR_VIEW}
      fallback={
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6">
          <p className="text-sm font-medium text-danger">{t("page.accessDenied")}</p>
        </div>
      }
    >
      <div className="space-y-5">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{t("page.title")}</h1>
            {data && (
              <p className="mt-0.5 text-sm text-neutral-500">
                {filtered.length} {filtered.length === 1 ? "servidor" : "servidores"}
                {search && ` encontrado${filtered.length !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>
          <Can perform={Permission.SERVIDOR_CREATE}>
            <Button data-testid="servidores-create-btn" variant="primary" size="sm" onClick={handleOpenCreate}>
              {t("actions.create")}
            </Button>
          </Can>
        </div>

        {/* ── Toolbar: search + filters ── */}
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
            <input
              data-testid="servidores-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, CPF ou email..."
              aria-label="Buscar servidores"
              className={[
                "h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm",
                "text-neutral-900 placeholder:text-neutral-400",
                "focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
              ].join(" ")}
            />
          </div>

          {/* Divider */}
          <div className="hidden h-6 w-px bg-neutral-200 sm:block" aria-hidden="true" />

          {/* Status pills */}
          <div className="flex gap-1.5" role="group" aria-label="Filtrar por status">
            {(["all", "active", "inactive"] as AtivoFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                data-testid={`servidores-filter-${f}`}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
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

      <ServidorFormDialog
        data-testid="servidor-form-dialog"
        open={formOpen}
        onClose={handleCloseForm}
        mode={editTarget ? "edit" : "create"}
        servidor={editTarget}
      />

      {deleteTarget && (
        <ServidorDeleteDialog
          data-testid="servidor-delete-dialog"
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(undefined)}
          servidorId={deleteTarget.id}
          servidorNome={deleteTarget.nome}
        />
      )}

      <ServidorViewModal
        data-testid="servidor-view-modal"
        open={!!viewTarget}
        onClose={() => setViewTarget(undefined)}
        servidor={viewTarget}
        cargos={cargosData}
        lotacoes={lotacoesData}
      />
    </Can>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────

interface ServidorRowProps {
  servidor: Servidor;
  onView: (s: Servidor) => void;
  onEdit: (s: Servidor) => void;
  onDelete: (s: Servidor) => void;
}

function ServidorRow({ servidor, onView, onEdit, onDelete }: ServidorRowProps) {
  const { t } = useTranslation("servidores");
  const reativarMutation = useReativarServidor();

  return (
    <tr data-testid={`servidor-row-${servidor.id}`} className="transition-colors hover:bg-neutral-50/60">
      <td className="px-5 py-3.5">
        <span className="font-medium text-neutral-900">{servidor.nome}</span>
      </td>

      <td className="hidden px-5 py-3.5 text-neutral-500 md:table-cell">
        {formatCpf(servidor.cpf)}
      </td>

      <td className="hidden px-5 py-3.5 text-neutral-500 lg:table-cell">
        {servidor.email}
      </td>

      <td className="px-5 py-3.5">
        <div className="flex flex-wrap gap-1">
          {servidor.papeis.map((papel) => (
            <Badge key={papel} variant={papelVariant[papel]} data-testid={`servidor-papel-${servidor.id}-${papel}`}>
              {t(`papeis.${papel}`)}
            </Badge>
          ))}
        </div>
      </td>

      <td className="px-5 py-3.5">
        <span
          data-testid={`servidor-status-${servidor.id}`}
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
            servidor.ativo ? "bg-success/10 text-success" : "bg-neutral-100 text-neutral-500",
          ].join(" ")}
        >
          <span className={["h-1.5 w-1.5 rounded-full", servidor.ativo ? "bg-success" : "bg-neutral-400"].join(" ")} aria-hidden="true" />
          {servidor.ativo ? t("status.active") : t("status.inactive")}
        </span>
      </td>

      {/* ── Icon-only action buttons (always visible) ── */}
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1">

          {/* View */}
          <button
            type="button"
            data-testid={`servidor-view-${servidor.id}`}
            aria-label={t("actions.view")}
            title={t("actions.view")}
            onClick={() => onView(servidor)}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Edit */}
          <Can perform={Permission.SERVIDOR_EDIT}>
            <button
              type="button"
              data-testid={`servidor-edit-${servidor.id}`}
              aria-label={t("actions.edit")}
              title={t("actions.edit")}
              onClick={() => onEdit(servidor)}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          </Can>

          {/* Deactivate / Reactivate */}
          {servidor.ativo ? (
            <Can perform={Permission.SERVIDOR_DELETE}>
              <button
                type="button"
                data-testid={`servidor-delete-${servidor.id}`}
                aria-label={t("actions.delete")}
                title={t("actions.delete")}
                onClick={() => onDelete(servidor)}
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </button>
            </Can>
          ) : (
            <Can perform={Permission.SERVIDOR_REATIVAR}>
              <button
                type="button"
                data-testid={`servidor-reativar-${servidor.id}`}
                aria-label={t("actions.reativar")}
                title={t("actions.reativar")}
                disabled={reativarMutation.isPending}
                onClick={() => void reativarMutation.mutateAsync({ id: servidor.id })}
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
