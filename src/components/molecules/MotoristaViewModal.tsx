"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Modal } from "@/components/molecules/Modal";
import { useVeiculoDoMotorista } from "@/hooks/motoristas/useVeiculoDoMotorista";
import type { Motorista } from "@/models/Motorista";

export interface MotoristaViewModalProps {
  open: boolean;
  onClose: () => void;
  motorista: Motorista | undefined;
  "data-testid"?: string;
}

const OP_STATUS_CLASSES: Record<string, string> = {
  DISPONIVEL:  "bg-success/10 text-success ring-1 ring-success/20",
  EM_CORRIDA:  "bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20",
  OFFLINE:     "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200",
};

/**
 * Read-only detail modal for a motorista.
 * Fetches the associated vehicle via GET /frota/motoristas/{id}/veiculo
 * so it works even when the list response doesn't include veiculoId.
 */
export function MotoristaViewModal({
  open,
  onClose,
  motorista,
  "data-testid": testId,
}: MotoristaViewModalProps): React.ReactElement | null {
  const { t } = useTranslation("motoristas");

  // Fetch the associated vehicle directly — the list endpoint may not return veiculoId
  const { data: associatedVeiculo, isLoading: veiculoLoading } =
    useVeiculoDoMotorista(open ? motorista?.id : null);

  if (!motorista) return null;

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

  // Safe status label — fall back to raw value if not in i18n
  const opStatusKey = `status.${motorista.statusOperacional}`;
  const opStatusLabel = t(opStatusKey) === opStatusKey
    ? motorista.statusOperacional
    : t(opStatusKey);

  const opStatusClass =
    OP_STATUS_CLASSES[motorista.statusOperacional] ??
    "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200";

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

          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${opStatusClass}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {opStatusLabel}
          </span>

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

        {/* Veículo associado — fetched from dedicated endpoint */}
        <Section title="Veículo Associado">
          {veiculoLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
            </div>
          ) : associatedVeiculo ? (
            <div className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-3">
              <Field label="Placa" value={associatedVeiculo.placa} />
              <Field label="Modelo" value={associatedVeiculo.modelo} />
              <Field label="Ano" value={associatedVeiculo.ano.toString()} />
              <Field label="ID do Veículo" value={associatedVeiculo.id} />
              <Field
                label="Status"
                value={associatedVeiculo.ativo ? "Ativo" : "Inativo"}
              />
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
