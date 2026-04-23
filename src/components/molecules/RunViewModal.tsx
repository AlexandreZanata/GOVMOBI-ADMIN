"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Modal } from "@/components/molecules/Modal";
import type { Run } from "@/models/Run";
import { RunStatus } from "@/models/Run";
import type { Servidor } from "@/models/Servidor";
import type { Motorista } from "@/models/Motorista";
import { useMemo } from "react";

export interface RunViewModalProps {
  open: boolean;
  onClose: () => void;
  run: Run | undefined;
  servidores?: Servidor[];
  motoristas?: Motorista[];
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

export function RunViewModal({
  open,
  onClose,
  run,
  servidores,
  motoristas,
  "data-testid": testId,
}: RunViewModalProps): React.ReactElement | null {
  const { t } = useTranslation("runs");

  // Build lookup maps for O(1) name resolution
  const servidoresMap = useMemo(() => {
    if (!servidores) return new Map();
    return new Map(servidores.map((s) => [s.id, s.nome]));
  }, [servidores]);

  const motoristasMap = useMemo(() => {
    if (!motoristas) return new Map();
    return new Map(motoristas.map((m) => [m.id, m.servidorId]));
  }, [motoristas]);

  if (!run) return null;

  const statusClass = STATUS_CLASSES[run.status] ?? "bg-neutral-100 text-neutral-500 ring-neutral-200";

  // Resolve passageiro name
  const passageiroNome = servidoresMap.get(run.passageiroId);
  const passageiroDisplay = passageiroNome || run.passageiroId.slice(0, 8) + "…";

  // Resolve motorista name (motoristaId → servidorId → servidor.nome)
  const motoristaNome = run.motoristaId
    ? (() => {
        const servidorId = motoristasMap.get(run.motoristaId);
        if (servidorId) {
          const nome = servidoresMap.get(servidorId);
          return nome || run.motoristaId.slice(0, 8) + "…";
        }
        return run.motoristaId.slice(0, 8) + "…";
      })()
    : "—";

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
            <Field
              label={t("view.origem")}
              value={
                <span title={`${run.origem.lat.toFixed(6)}, ${run.origem.lng.toFixed(6)}`}>
                  {run.origem.endereco ?? `${run.origem.lat.toFixed(6)}, ${run.origem.lng.toFixed(6)}`}
                </span>
              }
            />
            <Field
              label={t("view.destino")}
              value={
                <span title={`${run.destino.lat.toFixed(6)}, ${run.destino.lng.toFixed(6)}`}>
                  {run.destino.endereco ?? `${run.destino.lat.toFixed(6)}, ${run.destino.lng.toFixed(6)}`}
                </span>
              }
            />
            <Field label={t("view.distancia")} value={formatDistance(run.distanciaMetros)} />
            <Field label={t("view.duracao")} value={formatDuration(run.duracaoSegundos)} />
          </div>
        </Section>

        {/* Participantes */}
        <Section title={t("view.participantes")}>
          <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
            <Field label={t("view.passageiro")} value={passageiroDisplay} />
            <Field label={t("view.motorista")} value={motoristaNome} />
            {run.veiculo && (
              <Field
                label={t("view.veiculo")}
                value={`${run.veiculo.modelo} ${run.veiculo.ano} — ${run.veiculo.placa}`}
              />
            )}
            {run.motorista && (
              <Field
                label={t("view.notaMotorista")}
                value={run.motorista.notaMedia != null ? `${run.motorista.notaMedia.toFixed(1)} ★ (${run.motorista.totalAvaliacoes})` : "—"}
              />
            )}
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

        {/* Avaliação */}
        {run.avaliacao && (
          <Section title={t("view.avaliacao")}>
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
              <Field label={t("view.nota")} value={`${run.avaliacao.nota} ★`} />
              {run.avaliacao.comentario && (
                <Field label={t("view.comentario")} value={run.avaliacao.comentario} />
              )}
            </div>
          </Section>
        )}

        {/* Cancelamento */}
        {(run.cancelamento || run.motivoCancelamento) && (
          <Section title={t("view.cancelamento")}>
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
              <Field
                label={t("view.cancelMotivo")}
                value={run.cancelamento?.motivo ?? run.motivoCancelamento ?? "—"}
              />
              {run.cancelamento?.tipoSolicitante && (
                <Field label={t("view.cancelTipo")} value={run.cancelamento.tipoSolicitante} />
              )}
              {(run.cancelamento?.solicitanteId ?? run.canceladoPor) && (
                <Field
                  label={t("view.cancelSolicitante")}
                  value={run.cancelamento?.solicitanteId ?? run.canceladoPor ?? "—"}
                />
              )}
            </div>
          </Section>
        )}

        {/* Posição motorista (active runs) */}
        {run.motoristaPosition && (
          <Section title={t("view.posicaoMotorista")}>
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
              <Field
                label={t("view.posicaoAtual")}
                value={`${run.motoristaPosition.lat.toFixed(6)}, ${run.motoristaPosition.lng.toFixed(6)}`}
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
