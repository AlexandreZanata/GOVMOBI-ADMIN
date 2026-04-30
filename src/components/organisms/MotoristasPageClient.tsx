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
import { MotoristaLocationModal } from "@/components/molecules/MotoristaLocationModal";
import { MotoristaVeiculoDialog } from "@/components/molecules/MotoristaVeiculoDialog";
import { MotoristaViewModal } from "@/components/molecules/MotoristaViewModal";
import { useMotoristas } from "@/hooks/motoristas/useMotoristas";
import { useServidores } from "@/hooks/servidores/useServidores";
import { filterByAtivo } from "@/lib/filterByAtivo";
import type { AtivoFilter } from "@/lib/filterByAtivo";
import { Permission } from "@/models";
import type { Motorista } from "@/models/Motorista";

const STATUS_CLASSES: Record<string, string> = {
  DISPONIVEL:  "bg-success/10 text-success",
  EM_CORRIDA:  "bg-brand-primary/10 text-brand-primary",
  OFFLINE:     "bg-neutral-100 text-neutral-500",
};

/**
 * Client-side motoristas page with search, status filter, icon buttons, and CRUD actions.
 */
export function MotoristasPageClient() {
  const { t } = useTranslation("motoristas");
  const { data, isLoading, isError, refetch } = useMotoristas();
  const { data: servidores = [] } = useServidores();

  // Build a fast id→nome lookup
  const servidorNomeMap = useMemo(() => {
    const map = new Map<string, string>();
    servidores.forEach((s) => map.set(s.id, s.nome));
    return map;
  }, [servidores]);

  const [filter, setFilter] = useState<AtivoFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Motorista | undefined>();
  const [desativarTarget, setDesativarTarget] = useState<Motorista | undefined>();
  const [veiculoTarget, setVeiculoTarget] = useState<Motorista | undefined>();
  const [viewTarget, setViewTarget] = useState<Motorista | undefined>();
  const [locationTarget, setLocationTarget] = useState<Motorista | undefined>();

  const byStatus = useMemo(() => filterByAtivo(data ?? [], filter), [data, filter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return byStatus;
    return byStatus.filter((m) =>
      m.cnhNumero.toLowerCase().includes(term) ||
      m.cnhCategoria.toLowerCase().includes(term) ||
      (servidorNomeMap.get(m.servidorId) ?? "").toLowerCase().includes(term)
    );
  }, [byStatus, search, servidorNomeMap]);

  const handleOpenCreate = () => { setEditTarget(undefined); setFormOpen(true); };
  const handleOpenEdit = (m: Motorista) => { setEditTarget(m); setFormOpen(true); };
  const handleCloseForm = () => { setFormOpen(false); setEditTarget(undefined); };

  let content: ReactNode;

  if (isLoading) {
    content = (
      <div data-testid="motoristas-loading" className="space-y-2">
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
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.servidor")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.cnhNumero")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.cnhCategoria")}</th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 md:table-cell">{t("table.statusOperacional")}</th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:table-cell">{t("table.veiculo")}</th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 xl:table-cell">{t("table.avaliacao")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.status")}</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.map((motorista) => (
              <MotoristaRow
                key={motorista.id}
                motorista={motorista}
                servidorNome={servidorNomeMap.get(motorista.servidorId)}
                onView={setViewTarget}
                onEdit={handleOpenEdit}
                onDesativar={setDesativarTarget}
                onVeiculo={setVeiculoTarget}
                onViewLocation={setLocationTarget}
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
        <div data-testid="motoristas-access-denied" className="rounded-xl border border-danger/20 bg-danger/5 p-6">
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
              {t("actions.create")}
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
              placeholder="Buscar por nome, CNH ou categoria..."
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

      {desativarTarget && (
        <MotoristaDesativarDialog
          data-testid="motorista-desativar-dialog"
          open={!!desativarTarget}
          onClose={() => setDesativarTarget(undefined)}
          motorista={desativarTarget}
        />
      )}

      {veiculoTarget && (
        <MotoristaVeiculoDialog
          data-testid="motorista-veiculo-dialog"
          open={!!veiculoTarget}
          onClose={() => setVeiculoTarget(undefined)}
          motorista={veiculoTarget}
        />
      )}

      <MotoristaViewModal
        data-testid="motorista-view-modal"
        open={!!viewTarget}
        onClose={() => setViewTarget(undefined)}
        motorista={viewTarget}
      />

      <MotoristaLocationModal
        data-testid="motorista-location-modal"
        open={!!locationTarget}
        onClose={() => setLocationTarget(undefined)}
        motorista={locationTarget}
      />
    </Can>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────

interface MotoristaRowProps {
  motorista: Motorista;
  servidorNome: string | undefined;
  onView: (m: Motorista) => void;
  onEdit: (m: Motorista) => void;
  onDesativar: (m: Motorista) => void;
  onVeiculo: (m: Motorista) => void;
  onViewLocation: (m: Motorista) => void;
}

function MotoristaRow({ motorista, servidorNome, onView, onEdit, onDesativar, onVeiculo, onViewLocation }: MotoristaRowProps) {
  const { t } = useTranslation("motoristas");
  const opStatusClass = STATUS_CLASSES[motorista.statusOperacional] ?? "bg-neutral-100 text-neutral-500";

  return (
    <tr data-testid={`motorista-row-${motorista.id}`} className="transition-colors hover:bg-neutral-50/60">
      {/* Servidor name — first column */}
      <td className="px-5 py-3.5">
        <p className="font-medium text-neutral-900">
          {servidorNome ?? <span className="text-neutral-400">—</span>}
        </p>
      </td>

      <td className="px-5 py-3.5 text-neutral-700">{motorista.cnhNumero}</td>

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

      {/* Vehicle column */}
      <td className="hidden px-5 py-3.5 lg:table-cell">
        {motorista.veiculoId ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            {t("table.veiculoAssociado")}
          </span>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        )}
      </td>

      {/* Rating column */}
      <td className="hidden px-5 py-3.5 xl:table-cell">
        {motorista.notaMedia != null ? (
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-neutral-900">{motorista.notaMedia.toFixed(1)}</span>
            <svg className="h-4 w-4 text-warning" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs text-neutral-500">({motorista.totalAvaliacoes})</span>
          </div>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        )}
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
        <div className="flex items-center justify-end gap-1">
          {/* View */}
          <button
            type="button"
            data-testid={`motorista-view-${motorista.id}`}
            aria-label={t("actions.view")}
            title={t("actions.view")}
            onClick={() => onView(motorista)}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* View Location */}
          <button
            type="button"
            data-testid={`motorista-location-${motorista.id}`}
            aria-label={t("actions.viewLocation")}
            title={t("actions.viewLocation")}
            onClick={() => onViewLocation(motorista)}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-info/10 hover:text-info focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </button>

          {/* Edit CNH */}
          <Can perform={Permission.MOTORISTA_EDIT}>
            <button
              type="button"
              data-testid={`motorista-edit-${motorista.id}`}
              aria-label={t("actions.edit")}
              title={t("actions.edit")}
              onClick={() => onEdit(motorista)}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          </Can>

          {/* Associate vehicle */}
          <Can perform={Permission.MOTORISTA_EDIT}>
            <button
              type="button"
              data-testid={`motorista-veiculo-btn-${motorista.id}`}
              aria-label={t("actions.gerenciarVeiculo")}
              title={t("actions.gerenciarVeiculo")}
              onClick={() => onVeiculo(motorista)}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </button>
          </Can>

          {/* Desativar / Reativar */}
          {motorista.ativo ? (
            <Can perform={Permission.MOTORISTA_DESATIVAR}>
              <button
                type="button"
                data-testid={`motorista-desativar-${motorista.id}`}
                aria-label={t("actions.desativar")}
                title={t("actions.desativar")}
                onClick={() => onDesativar(motorista)}
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </button>
            </Can>
          ) : (
            <Can perform={Permission.MOTORISTA_REATIVAR}>
              <button
                type="button"
                data-testid={`motorista-reativar-${motorista.id}`}
                aria-label={t("actions.reativar")}
                title={t("actions.reativar")}
                onClick={() => onDesativar(motorista)}
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
