"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

import { Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { MotoristaDesativarDialog } from "@/components/molecules/MotoristaDesativarDialog";
import { MotoristaFormDialog } from "@/components/molecules/MotoristaFormDialog";
import { MotoristaStatusDialog } from "@/components/molecules/MotoristaStatusDialog";
import { useMotoristas } from "@/hooks/motoristas/useMotoristas";
import { filterByAtivo } from "@/lib/filterByAtivo";
import type { AtivoFilter } from "@/lib/filterByAtivo";
import { Permission } from "@/models";
import type { Motorista } from "@/models/Motorista";

const STATUS_CLASSES: Record<string, string> = {
  DISPONIVEL:   "bg-success/10 text-success",
  EM_SERVICO:   "bg-info/10 text-info",
  INDISPONIVEL: "bg-warning/10 text-warning",
  AFASTADO:     "bg-neutral-100 text-neutral-500",
};

/**
 * Client-side motoristas page with search, status filter, and CRUD actions.
 */
export function MotoristasPageClient() {
  const { t } = useTranslation("motoristas");
  const { data, isLoading, isError, refetch } = useMotoristas();

  const [filter, setFilter] = useState<AtivoFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Motorista | undefined>();
  const [statusTarget, setStatusTarget] = useState<Motorista | undefined>();
  const [desativarTarget, setDesativarTarget] = useState<Motorista | undefined>();

  const byStatus = useMemo(() => filterByAtivo(data ?? [], filter), [data, filter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return byStatus;
    return byStatus.filter((m) =>
      m.cnhNumero.toLowerCase().includes(term) ||
      m.cnhCategoria.toLowerCase().includes(term) ||
      m.servidorId.toLowerCase().includes(term)
    );
  }, [byStatus, search]);

  const handleOpenCreate = () => { setEditTarget(undefined); setFormOpen(true); };
  const handleOpenEdit = (m: Motorista) => { setEditTarget(m); setFormOpen(true); };
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
    content = <ErrorState data-testid="motoristas-error" onRetry={() => void refetch()} />;
  } else if (!filtered.length) {
    content = (
      <div data-testid="motoristas-empty" className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
        <p className="text-sm font-medium text-neutral-600">{t("page.empty.title")}</p>
        <p className="mt-1 text-xs text-neutral-400">{t("page.empty.message")}</p>
      </div>
    );
  } else {
    content = (
      <div data-testid="motoristas-table" className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.cnhNumero")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.cnhCategoria")}</th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 md:table-cell">{t("table.statusOperacional")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.status")}</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
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
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6">
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
                {filtered.length} {filtered.length === 1 ? "motorista" : "motoristas"}
              </p>
            )}
          </div>
          <Can perform={Permission.MOTORISTA_CREATE}>
            <Button data-testid="motoristas-create-btn" variant="primary" size="sm" onClick={handleOpenCreate}>
              + {t("actions.create")}
            </Button>
          </Can>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
            <input
              data-testid="motoristas-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por CNH ou categoria..."
              aria-label="Buscar motoristas"
              className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div className="hidden h-6 w-px bg-neutral-200 sm:block" aria-hidden="true" />
          <div className="flex gap-1.5" role="group" aria-label="Filtrar por status">
            {(["all", "active", "inactive"] as AtivoFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                data-testid={`motoristas-filter-${f}`}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                  filter === f ? "bg-brand-primary text-white shadow-sm" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                ].join(" ")}
              >
                {t(`page.filters.${f}`)}
              </button>
            ))}
          </div>
        </div>

        {content}
      </div>

      <MotoristaFormDialog
        data-testid="motorista-form-dialog"
        open={formOpen}
        onClose={handleCloseForm}
        mode={editTarget ? "edit" : "create"}
        motorista={editTarget}
      />

      {statusTarget && (
        <MotoristaStatusDialog
          data-testid="motorista-status-dialog"
          open={!!statusTarget}
          onClose={() => setStatusTarget(undefined)}
          motorista={statusTarget}
        />
      )}

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

// ── Row ──────────────────────────────────────────────────────────────────────

interface MotoristaRowProps {
  motorista: Motorista;
  onEdit: (m: Motorista) => void;
  onUpdateStatus: (m: Motorista) => void;
  onDesativar: (m: Motorista) => void;
}

function MotoristaRow({ motorista, onEdit, onUpdateStatus, onDesativar }: MotoristaRowProps) {
  const { t } = useTranslation("motoristas");
  const opStatusClass = STATUS_CLASSES[motorista.statusOperacional] ?? "bg-neutral-100 text-neutral-500";

  return (
    <tr data-testid={`motorista-row-${motorista.id}`} className="group transition-colors hover:bg-neutral-50/60">
      <td className="px-5 py-3.5 font-medium text-neutral-900">{motorista.cnhNumero}</td>

      <td className="px-5 py-3.5">
        <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">
          {motorista.cnhCategoria}
        </span>
      </td>

      <td className="hidden px-5 py-3.5 md:table-cell">
        <span data-testid={`motorista-op-status-${motorista.id}`}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${opStatusClass}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {t(`status.${motorista.statusOperacional}`)}
        </span>
      </td>

      <td className="px-5 py-3.5">
        <span data-testid={`motorista-status-${motorista.id}`}
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
            motorista.ativo ? "bg-success/10 text-success" : "bg-neutral-100 text-neutral-500",
          ].join(" ")}>
          <span className={["h-1.5 w-1.5 rounded-full", motorista.ativo ? "bg-success" : "bg-neutral-400"].join(" ")} aria-hidden="true" />
          {motorista.ativo ? t("status.active") : t("status.inactive")}
        </span>
      </td>

      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Can perform={Permission.MOTORISTA_EDIT}>
            <Button data-testid={`motorista-edit-${motorista.id}`} size="sm" variant="secondary" onClick={() => onEdit(motorista)}>
              {t("actions.edit")}
            </Button>
          </Can>
          <Can perform={Permission.MOTORISTA_STATUS}>
            <Button data-testid={`motorista-status-btn-${motorista.id}`} size="sm" variant="ghost" onClick={() => onUpdateStatus(motorista)}>
              {t("actions.updateStatus")}
            </Button>
          </Can>
          <Can perform={Permission.MOTORISTA_DESATIVAR}>
            <Button
              data-testid={`motorista-desativar-${motorista.id}`}
              size="sm"
              variant={motorista.ativo ? "destructive" : "primary"}
              onClick={() => onDesativar(motorista)}
            >
              {motorista.ativo ? t("actions.desativar") : t("actions.reativar")}
            </Button>
          </Can>
        </div>
      </td>
    </tr>
  );
}
