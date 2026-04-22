"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Modal } from "@/components/molecules/Modal";
import { useVeiculos } from "@/hooks/veiculos/useVeiculos";
import type { Motorista } from "@/models/Motorista";

export interface MotoristaViewModalProps {
  open: boolean;
  onClose: () => void;
  motorista: Motorista | undefined;
  "data-testid"?: string;
}

const STATUS_CLASSES: Record<string, string> = {
  DISPONIVEL:   "bg-success/10 text-success ring-1 ring-success/20",
  EM_SERVICO:   "bg-info/10 text-info ring-1 ring-info/20",
  INDISPONIVEL: "bg-warning/10 text-warning ring-1 ring-warning/20",
  AFASTADO:     "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200",
};

/**
 * Read-only detail modal for a motorista.
 * Displays CNH data, operational status, associated vehicle, and audit timestamps.
 */
export function MotoristaViewModal({
  open,
  onClose,
  motorista,
  "data-testid": testId,
}: MotoristaViewModalProps): React.ReactElement | null {
  const { t } = useTranslation("motoristas");
  const { data: veiculos = [] } = useVeiculos();

  if (!motorista) return null;

  const associatedVeiculo = motorista.veiculoId
    ? veiculos.find((v) => v.id === motorista.veiculoId)
    : null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const safeFormatDate = (iso: string | null): string => {
    if (!iso) return "—";
    try { return formatDate(iso); } catch { return iso; }
  };

  const opStatusClass =
    STATUS_CLASSES[motorista.statusOperacional] ?? "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={motorista.cnhNumero}
      subtitle={`CNH ${motorista.cnhCategoria}`}
      maxWidth="max-w-4xl"
      data-testid={testId}
    >
      <div className="space-y-6">

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ativo/Inativo */}
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
              motorista.ativo
                ? "bg-success/10 text-success ring-1 ring-success/20"
                : "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200",
            ].join(" ")}
          >
            <span
              className={["h-1.5 w-1.5 rounded-full", motorista.ativo ? "bg-success" : "bg-neutral-400"].join(" ")}
              aria-hidden="true"
            />
            {motorista.ativo ? t("status.active") : t("status.inactive")}
          </span>

          {/* Status operacional */}
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${opStatusClass}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {t(`status.${motorista.statusOperacional}`)}
          </span>

          {/* Desativado badge */}
          {motorista.deletedAt && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-xs font-medium text-danger ring-1 ring-danger/20">
              Desativado em {formatDate(motorista.deletedAt)}
            </span>
          )}
        </div>

        {/* CNH */}
        <Section title="Habilitação (CNH)">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Field label="Número da CNH" value={motorista.cnhNumero} />
            <Field label="Categoria" value={motorista.cnhCategoria} />
          </div>
        </Section>

        {/* Veículo associado */}
        <Section title="Veículo Associado">
          {associatedVeiculo ? (
            <div className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-3">
              <Field label="Placa" value={associatedVeiculo.placa} />
              <Field label="Modelo" value={associatedVeiculo.modelo} />
              <Field label="Ano" value={associatedVeiculo.ano.toString()} />
              <Field label="ID do Veículo" value={associatedVeiculo.id} />
            </div>
          ) : (
            <p className="text-sm text-neutral-400">Nenhum veículo associado.</p>
          )}
        </Section>

        {/* Identificação */}
        <Section title="Identificação do registro">
          <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
            <Field label="ID do Motorista" value={motorista.id} />
            <Field label="ID do Servidor" value={motorista.servidorId} />
          </div>
        </Section>

        {/* Auditoria */}
        <Section title="Auditoria">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-3">
            <Field label="Criado em" value={formatDate(motorista.createdAt)} />
            <Field label="Atualizado em" value={formatDate(motorista.updatedAt)} />
            <Field label="Excluído em" value={safeFormatDate(motorista.deletedAt)} />
          </div>
        </Section>

      </div>
    </Modal>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-neutral-900">{title}</h3>
      <div className="rounded-xl border border-neutral-100 bg-white p-5">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-semibold text-neutral-900">{label}</dt>
      <dd className="break-all text-sm text-neutral-400">{value || "—"}</dd>
    </div>
  );
}
