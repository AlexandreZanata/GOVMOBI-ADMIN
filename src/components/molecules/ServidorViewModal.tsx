"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Badge } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { formatCpf } from "@/lib/formatCpf";
import type { Servidor } from "@/models/Servidor";
import type { Cargo } from "@/models/Cargo";
import type { Lotacao } from "@/models/Lotacao";
import { Papel } from "@/models";

const papelVariant: Record<Papel, "danger" | "info" | "neutral"> = {
  [Papel.ADMIN]: "danger",
  [Papel.MOTORISTA]: "info",
  [Papel.USUARIO]: "neutral",
};

export interface ServidorViewModalProps {
  open: boolean;
  onClose: () => void;
  servidor: Servidor | undefined;
  cargos?: Cargo[];
  lotacoes?: Lotacao[];
  "data-testid"?: string;
}

/**
 * Read-only detail modal for a servidor record.
 * Uses the shared Modal base component.
 * Resolves cargo and lotacao IDs to human-readable names.
 */
export function ServidorViewModal({
  open,
  onClose,
  servidor,
  cargos,
  lotacoes,
  "data-testid": testId,
}: ServidorViewModalProps): React.ReactElement | null {
  const { t } = useTranslation("servidores");

  // Build lookup maps for O(1) name resolution
  const cargoMap = useMemo(() => {
    if (!cargos) return new Map<string, string>();
    return new Map(cargos.map((c) => [c.id, c.nome]));
  }, [cargos]);

  const lotacaoMap = useMemo(() => {
    if (!lotacoes) return new Map<string, string>();
    return new Map(lotacoes.map((l) => [l.id, l.nome]));
  }, [lotacoes]);

  if (!servidor) return null;

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

  const cargoNome = cargoMap.get(servidor.cargoId) || servidor.cargoId;
  const lotacaoNome = lotacaoMap.get(servidor.lotacaoId) || servidor.lotacaoId;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={servidor.nome}
      subtitle={formatCpf(servidor.cpf)}
      maxWidth="max-w-4xl"
      data-testid={testId}
    >
      <div className="space-y-6">

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
              servidor.ativo
                ? "bg-success/10 text-success ring-1 ring-success/20"
                : "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200",
            ].join(" ")}
          >
            <span
              className={["h-1.5 w-1.5 rounded-full", servidor.ativo ? "bg-success" : "bg-neutral-400"].join(" ")}
              aria-hidden="true"
            />
            {servidor.ativo ? t("status.active") : t("status.inactive")}
          </span>

          {servidor.deletedAt && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-xs font-medium text-danger ring-1 ring-danger/20">
              Desativado em {formatDate(servidor.deletedAt)}
            </span>
          )}
        </div>

        {/* Informações Pessoais */}
        <Section title="Informações Pessoais">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Field label={t("table.nome")} value={servidor.nome} />
            <Field label={t("table.cpf")} value={formatCpf(servidor.cpf)} />
            <Field label={t("table.email")} value={servidor.email} />
            <Field label={t("form.telefone")} value={servidor.telefone} />
          </div>
        </Section>

        {/* Vínculo Institucional */}
        <Section title="Vínculo Institucional">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Field label={t("form.cargoId")} value={cargoNome} />
            <Field label={t("form.lotacaoId")} value={lotacaoNome} />
          </div>
        </Section>

        {/* Papéis e Permissões */}
        <Section title="Papéis e Permissões">
          <div>
            <dt className="mb-2 text-xs font-semibold text-neutral-900">
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
        </Section>

        {/* Identificação do registro */}
        <Section title="Identificação do registro">
          <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
            <Field label="ID do Servidor" value={servidor.id} />
            <Field label="ID do Cargo" value={servidor.cargoId} />
            <Field label="ID da Lotação" value={servidor.lotacaoId} />
          </div>
        </Section>

        {/* Auditoria */}
        <Section title="Auditoria">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-3">
            <Field label={t("timestamps.createdAt")} value={formatDate(servidor.createdAt)} />
            <Field label={t("timestamps.updatedAt")} value={formatDate(servidor.updatedAt)} />
            <Field label="Excluído em" value={safeFormatDate(servidor.deletedAt)} />
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


