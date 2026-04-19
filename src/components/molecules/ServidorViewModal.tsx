"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Badge } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { formatCpf } from "@/lib/formatCpf";
import type { Papel, Servidor } from "@/models/Servidor";

const papelVariant: Record<Papel, "danger" | "info" | "neutral"> = {
  ADMIN: "danger",
  MOTORISTA: "info",
  USUARIO: "neutral",
};

export interface ServidorViewModalProps {
  open: boolean;
  onClose: () => void;
  servidor: Servidor | undefined;
  "data-testid"?: string;
}

/**
 * Read-only detail modal for a servidor record.
 * Uses the shared Modal base component.
 */
export function ServidorViewModal({
  open,
  onClose,
  servidor,
  "data-testid": testId,
}: ServidorViewModalProps): React.ReactElement | null {
  const { t } = useTranslation("servidores");

  if (!servidor) return null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={servidor.nome}
      subtitle={formatCpf(servidor.cpf)}
      maxWidth="max-w-xl"
      data-testid={testId}
    >
      <div className="space-y-5">

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              servidor.ativo ? "bg-success/10 text-success" : "bg-neutral-100 text-neutral-500",
            ].join(" ")}
          >
            <span className={["h-2 w-2 rounded-full", servidor.ativo ? "bg-success" : "bg-neutral-400"].join(" ")} aria-hidden="true" />
            {servidor.ativo ? t("status.active") : t("status.inactive")}
          </span>
        </div>

        {/* Info grid */}
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoField label={t("table.nome")} value={servidor.nome} />
          <InfoField label={t("table.cpf")} value={formatCpf(servidor.cpf)} />
          <InfoField label={t("table.email")} value={servidor.email} />
          <InfoField label={t("form.telefone")} value={servidor.telefone} />
          <InfoField label={t("form.cargoId")} value={servidor.cargoId} />
          <InfoField label={t("form.lotacaoId")} value={servidor.lotacaoId} />
        </dl>

        {/* Papéis */}
        <div>
          <dt className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {t("table.papeis")}
          </dt>
          <div className="flex flex-wrap gap-2">
            {servidor.papeis.map((papel) => (
              <Badge key={papel} variant={papelVariant[papel]}>
                {t(`papeis.${papel}`)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4">
          <InfoField label="Criado em" value={formatDate(servidor.createdAt)} muted />
          <InfoField label="Atualizado em" value={formatDate(servidor.updatedAt)} muted />
        </div>
      </div>
    </Modal>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────

function InfoField({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </dt>
      <dd className={["text-sm", muted ? "text-neutral-400" : "text-neutral-800"].join(" ")}>
        {value || "—"}
      </dd>
    </div>
  );
}
