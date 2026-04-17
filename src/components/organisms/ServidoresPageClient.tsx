"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Badge, Button, Input } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { ServidorDeleteDialog } from "@/components/molecules/ServidorDeleteDialog";
import { ServidorFormDialog } from "@/components/molecules/ServidorFormDialog";
import { formatCpf } from "@/lib/formatCpf";
import { unformatCpf } from "@/lib/cpfUtils";
import { useReativarServidor } from "@/hooks/servidores/useReativarServidor";
import { useServidores } from "@/hooks/servidores/useServidores";
import { filterByAtivo } from "@/lib/filterByAtivo";
import type { AtivoFilter } from "@/lib/filterByAtivo";
import { Permission } from "@/models";
import type { Papel, Servidor } from "@/models/Servidor";

/** Maps Papel to a Badge variant. */
const papelVariant: Record<Papel, "danger" | "info" | "neutral"> = {
  ADMIN: "danger",
  MOTORISTA: "info",
  USUARIO: "neutral",
};

/**
 * Client-side servidores page renderer with text search, status filter,
 * loading/error/empty states, and permission-gated CRUD actions.
 */
export function ServidoresPageClient() {
  const { t } = useTranslation("servidores");
  const { data, isLoading, isError, refetch } = useServidores();

  const [filter, setFilter] = useState<AtivoFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Servidor | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Servidor | undefined>();

  // 1. Filter by ativo status
  const byStatus = useMemo(
    () => filterByAtivo(data ?? [], filter),
    [data, filter],
  );

  // 2. Filter by search term (nome, CPF digits, email)
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return byStatus;
    const digits = unformatCpf(term);
    return byStatus.filter((s) =>
      s.nome.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      (digits && s.cpf.includes(digits))
    );
  }, [byStatus, search]);

  const handleOpenCreate = () => { setEditTarget(undefined); setFormOpen(true); };
  const handleOpenEdit = (servidor: Servidor) => { setEditTarget(servidor); setFormOpen(true); };
  const handleCloseForm = () => { setFormOpen(false); setEditTarget(undefined); };

  let content: ReactNode;

  if (isLoading) {
    content = (
      <section data-testid="servidores-loading" className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
        ))}
      </section>
    );
  } else if (isError) {
    content = <ErrorState data-testid="servidores-error" onRetry={() => void refetch()} />;
  } else if (!filtered.length) {
    content = (
      <section data-testid="servidores-empty" className="rounded-md border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-base font-semibold text-neutral-900">{t("page.empty.title")}</h2>
        <p className="mt-1 text-sm text-neutral-700">{t("page.empty.message")}</p>
      </section>
    );
  } else {
    content = (
      <div data-testid="servidores-table" className="overflow-hidden rounded-md border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">{t("table.nome")}</th>
              <th className="hidden px-4 py-3 md:table-cell">{t("table.cpf")}</th>
              <th className="hidden px-4 py-3 lg:table-cell">{t("table.email")}</th>
              <th className="px-4 py-3">{t("table.papeis")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {filtered.map((servidor) => (
              <ServidorRow
                key={servidor.id}
                servidor={servidor}
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
      perform={Permission.SERVIDOR_VIEW}
      fallback={
        <section data-testid="servidores-access-denied" className="rounded-md border border-danger/30 bg-danger/10 p-4">
          <p className="text-sm font-medium text-danger">{t("page.accessDenied")}</p>
        </section>
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">{t("page.title")}</h1>
          <Can perform={Permission.SERVIDOR_CREATE}>
            <Button data-testid="servidores-create-btn" variant="primary" size="sm" onClick={handleOpenCreate}>
              {t("actions.create")}
            </Button>
          </Can>
        </div>

        {/* Search + status filters row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Text search */}
          <div className="flex-1">
            <Input
              data-testid="servidores-search"
              placeholder={t("page.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t("page.searchPlaceholder")}
            />
          </div>

          {/* Status filter pills */}
          <div data-testid="servidores-filter" className="flex gap-2" role="group" aria-label={t("page.title")}>
            {(["all", "active", "inactive"] as AtivoFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                data-testid={`servidores-filter-${f}`}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
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
        </div>

        {content}
      </div>

      {/* Create / Edit dialog */}
      <ServidorFormDialog
        data-testid="servidor-form-dialog"
        open={formOpen}
        onClose={handleCloseForm}
        mode={editTarget ? "edit" : "create"}
        servidor={editTarget}
      />

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <ServidorDeleteDialog
          data-testid="servidor-delete-dialog"
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(undefined)}
          servidorId={deleteTarget.id}
          servidorNome={deleteTarget.nome}
        />
      )}
    </Can>
  );
}

// ── Row sub-component ────────────────────────────────────────────────────────

interface ServidorRowProps {
  servidor: Servidor;
  onEdit: (servidor: Servidor) => void;
  onDelete: (servidor: Servidor) => void;
}

/**
 * Single table row for a servidor with edit, delete, and reativar actions.
 *
 * @param props - Servidor data and action callbacks
 * @returns Table row with permission-gated action buttons
 */
function ServidorRow({ servidor, onEdit, onDelete }: ServidorRowProps) {
  const { t } = useTranslation("servidores");
  const reativarMutation = useReativarServidor();

  return (
    <tr
      data-testid={`servidor-row-${servidor.id}`}
      className="transition-colors hover:bg-neutral-50"
    >
      <td className="px-4 py-3 font-medium text-neutral-900">{servidor.nome}</td>

      <td className="hidden px-4 py-3 text-neutral-600 md:table-cell">
        {formatCpf(servidor.cpf)}
      </td>

      <td className="hidden px-4 py-3 text-neutral-600 lg:table-cell">
        {servidor.email}
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {servidor.papeis.map((papel) => (
            <Badge
              key={papel}
              data-testid={`servidor-papel-${servidor.id}-${papel}`}
              variant={papelVariant[papel]}
            >
              {t(`papeis.${papel}`)}
            </Badge>
          ))}
        </div>
      </td>

      <td className="px-4 py-3">
        <span
          data-testid={`servidor-status-${servidor.id}`}
          className={[
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            servidor.ativo
              ? "bg-success/15 text-success"
              : "bg-neutral-200 text-neutral-700",
          ].join(" ")}
        >
          {servidor.ativo ? t("status.active") : t("status.inactive")}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Can perform={Permission.SERVIDOR_EDIT}>
            <Button
              data-testid={`servidor-edit-${servidor.id}`}
              size="sm"
              variant="secondary"
              onClick={() => onEdit(servidor)}
            >
              {t("actions.edit")}
            </Button>
          </Can>

          {servidor.ativo ? (
            <Can perform={Permission.SERVIDOR_DELETE}>
              <Button
                data-testid={`servidor-delete-${servidor.id}`}
                size="sm"
                variant="destructive"
                onClick={() => onDelete(servidor)}
              >
                {t("actions.delete")}
              </Button>
            </Can>
          ) : (
            <Can perform={Permission.SERVIDOR_REATIVAR}>
              <Button
                data-testid={`servidor-reativar-${servidor.id}`}
                size="sm"
                variant="success"
                isLoading={reativarMutation.isPending}
                onClick={() =>
                  void reativarMutation.mutateAsync({ id: servidor.id })
                }
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
