"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Modal } from "@/components/molecules/Modal";
import type { Cargo } from "@/models";

export interface CargoViewModalProps {
  open: boolean;
  onClose: () => void;
  cargo: Cargo | undefined;
  "data-testid"?: string;
}

export function CargoViewModal({
  open,
  onClose,
  cargo,
  "data-testid": testId,
}: CargoViewModalProps): React.ReactElement | null {
  const { t } = useTranslation("cargos");

  if (!cargo) return null;

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
    try {
      return formatDate(iso);
    } catch {
      return iso;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cargo.nome}
      maxWidth="max-w-4xl"
      data-testid={testId}
    >
      <div className="space-y-6">

        {/* Status */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
              cargo.ativo
                ? "bg-success/10 text-success ring-1 ring-success/20"
                : "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200",
            ].join(" ")}
          >
            <span className={["h-1.5 w-1.5 rounded-full", cargo.ativo ? "bg-success" : "bg-neutral-400"].join(" ")} aria-hidden="true" />
            {cargo.ativo ? t("status.active") : t("status.inactive")}
          </span>
          {cargo.deletedAt && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-xs font-medium text-danger ring-1 ring-danger/20">
              Desativado em {formatDate(cargo.deletedAt)}
            </span>
          )}
        </div>

        {/* Dados Básicos */}
        <Section title="Dados Básicos">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Field label={t("form.nome")} value={cargo.nome} />
            <Field label={t("form.pesoPrioridade")} value={cargo.pesoPrioridade.toString()} />
            <Field label={t("form.nivelHierarquia")} value={cargo.nivelHierarquia?.toString() ?? "—"} />
          </div>
        </Section>

        {/* Identificação do registro */}
        <Section title="Identificação do registro">
          <Field label="ID" value={cargo.id} />
        </Section>

        {/* Auditoria */}
        <Section title="Auditoria">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-3">
            <Field label="Criado em" value={formatDate(cargo.createdAt)} />
            <Field label="Atualizado em" value={formatDate(cargo.updatedAt)} />
            <Field label="Excluído em" value={safeFormatDate(cargo.deletedAt)} />
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
