"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Modal } from "@/components/molecules/Modal";
import { useReverseGeocoding } from "@/hooks/pesquisa/useReverseGeocoding";
import type { Run } from "@/models/Run";
import { RunStatus } from "@/models/Run";

export interface RunViewModalProps {
  open: boolean;
  onClose: () => void;
  run: Run | undefined;
  "data-testid"?: string;
}

const STATUS_CLASSES: Record<string, string> = {
  [RunStatus.SOLICITADA]:        "bg-warning/10 text-warning ring-warning/20",
  [RunStatus.AGUARDANDO_ACEITE]: "bg-info/10 text-info ring-info/20",
  [RunStatus.ACEITA]:            "bg-info/10 text-info ring-info/20",
  [RunStatus.EM_ROTA]:           "bg-brand-primary/10 text-brand-primary ring-brand-primary/20",
  [RunStatus.CONCLUIDA]:         "bg-success/10 text-success ring-success/20",
  [RunStatus.AVALIADA]:          "bg-success/10 text-success ring-success/20",
  [RunStatus.CANCELADA]:         "bg-danger/10 text-danger ring-danger/20",
  [RunStatus.EXPIRADA]:          "bg-neutral-100 text-neutral-500 ring-neutral-200",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-neutral-900">{title}</h3>
      <div className="rounded-xl border border-neutral-100 bg-white p-5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-semibold text-neutral-900">{label}</dt>
      <dd className="break-all text-sm text-neutral-400">{value || "—"}</dd>
    </div>
  );
}

function AddressField({ label, lat, lng }: { label: string; lat: number; lng: number }) {
  const { data, isLoading } = useReverseGeocoding(lat, lng);
  const coordFallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  return (
    <Field
      label={label}
      value={
        isLoading ? (
          <span className="inline-block h-4 w-48 animate-pulse rounded bg-neutral-100" />
        ) : (
          <span title={coordFallback}>
            {data?.place_name ?? coordFallback}
          </span>
        )
      }
    />
  );
}

export function RunViewModal({
  open,
  onClose,
  run,
  "data-testid": testId,
}: RunViewModalProps): React.ReactElement | null {
  const { t } = useTranslation("runs");

  if (!run) return null;

  const statusClass = STATUS_CLASSES[run.status] ?? "bg-neutral-100 text-neutral-500 ring-neutral-200";

  const safeDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    } catch { return iso; }
  };

  const formatDuration = (s: number | null) => {
    if (s == null) return "—";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}min ${sec}s` : `${sec}s`;
  };

  const formatDistance = (m: number | null) =>
    m == null ? "—" : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${t("view.title")} ${run.id.slice(0, 8)}…`}
      maxWidth="max-w-4xl"
      data-testid={testId}
    >
      <div className="space-y-6">
        {/* Status badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1",
              statusClass,
            ].join(" ")}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {t(`status.${run.status}`)}
          </span>
        </div>

        {/* Rota */}
        <Section title={t("view.rota")}>
          <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
            <AddressField label={t("view.origem")} lat={run.origem.lat} lng={run.origem.lng} />
            <AddressField label={t("view.destino")} lat={run.destino.lat} lng={run.destino.lng} />
            <Field label={t("view.distancia")} value={formatDistance(run.distanciaMetros)} />
            <Field label={t("view.duracao")} value={formatDuration(run.duracaoSegundos)} />
          </div>
        </Section>

        {/* Participantes */}
        <Section title={t("view.participantes")}>
          <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
            <Field label={t("view.passageiroId")} value={run.passageiroId} />
            <Field label={t("view.motoristaId")} value={run.motoristaId ?? "—"} />
            <Field label={t("view.veiculoId")} value={run.veiculoId ?? "—"} />
          </div>
        </Section>

        {/* Serviço (only if present) */}
        {(run.motivoServico || run.observacoes) && (
          <Section title={t("view.servico")}>
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
              {run.motivoServico && (
                <Field label={t("view.motivoServico")} value={run.motivoServico} />
              )}
              {run.observacoes && (
                <Field label={t("view.observacoes")} value={run.observacoes} />
              )}
            </div>
          </Section>
        )}

        {/* Cancelamento (only if cancelled) */}
        {run.cancelamento && (
          <Section title={t("view.cancelamento")}>
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
              <Field label={t("view.cancelMotivo")} value={run.cancelamento.motivo} />
              <Field label={t("view.cancelTipo")} value={run.cancelamento.tipoSolicitante} />
              <Field label={t("view.cancelSolicitante")} value={run.cancelamento.solicitanteId} />
            </div>
          </Section>
        )}

        {/* Posição motorista (active runs) */}
        {run.motoristaPosition && (
          <Section title={t("view.posicaoMotorista")}>
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
              <AddressField
                label={t("view.posicaoAtual")}
                lat={run.motoristaPosition.lat}
                lng={run.motoristaPosition.lng}
              />
              <Field label={t("view.posicaoAtualizada")} value={safeDate(run.motoristaPosition.updatedAt)} />
            </div>
          </Section>
        )}

        {/* Identificação */}
        <Section title={t("view.identificacao")}>
          <Field label="ID" value={run.id} />
        </Section>

        {/* Auditoria */}
        <Section title={t("view.auditoria")}>
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-3">
            <Field label={t("view.criadoEm")} value={safeDate(run.createdAt)} />
            <Field label={t("view.atualizadoEm")} value={safeDate(run.updatedAt)} />
          </div>
        </Section>
      </div>
    </Modal>
  );
}
