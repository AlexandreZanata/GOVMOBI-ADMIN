"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { useCreateServidor } from "@/hooks/servidores/useCreateServidor";
import { useUpdateServidor } from "@/hooks/servidores/useUpdateServidor";
import { buildServidorUpdatePayload } from "@/lib/buildServidorUpdatePayload";
import { formatCpf } from "@/lib/formatCpf";
import { useCargos } from "@/hooks/cargos/useCargos";
import { useLotacoes } from "@/hooks/useLotacoes";
import type { Papel, Servidor } from "@/models/Servidor";
import { ApiError } from "@/types";

/** Dialog mode — controls which mutation is called on submit. */
export type ServidorFormMode = "create" | "edit";

/** All available papel options. */
const PAPEL_OPTIONS: Papel[] = ["USUARIO", "ADMIN", "MOTORISTA"];

/**
 * Props for the servidor create/edit form dialog.
 */
export interface ServidorFormDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Dialog mode — "create" or "edit". */
  mode: ServidorFormMode;
  /** Existing servidor data pre-populated when mode is "edit". */
  servidor?: Servidor;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/**
 * Modal form dialog for creating or editing a servidor.
 * In "create" mode: collects all fields including CPF and email.
 * In "edit" mode: CPF and email are read-only; only nome, telefone,
 * cargoId, lotacaoId, and papeis can be changed.
 * Shows inline errors for 409 (duplicate), 400 (invalid data), 404 (dependency).
 *
 * @param props - Dialog state, mode, optional servidor data, and test selector
 * @returns Accessible modal form dialog
 */
export function ServidorFormDialog({
  open,
  onClose,
  mode,
  servidor,
  "data-testid": testId,
}: ServidorFormDialogProps) {
  const { t } = useTranslation("servidores");
  const headingId = useId();

  const [nome, setNome] = useState(servidor?.nome ?? "");
  const [cpf, setCpf] = useState(servidor?.cpf ?? "");
  const [email, setEmail] = useState(servidor?.email ?? "");
  const [telefone, setTelefone] = useState(servidor?.telefone ?? "");
  const [cargoId, setCargoId] = useState(servidor?.cargoId ?? "");
  const [lotacaoId, setLotacaoId] = useState(servidor?.lotacaoId ?? "");
  const [papeis, setPapeis] = useState<Papel[]>(servidor?.papeis ?? ["USUARIO"]);
  const [senha, setSenha] = useState("");
  const [inlineError, setInlineError] = useState<string | undefined>();

  const createMutation = useCreateServidor();
  const updateMutation = useUpdateServidor();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: cargos } = useCargos();
  const { data: lotacoes } = useLotacoes();

  const activeCargos = cargos?.filter((c) => c.ativo) ?? [];
  const activeLotacoes = lotacoes?.filter((l) => l.ativo) ?? [];

  // Sync fields when servidor prop changes
  const prevId = useRef(servidor?.id);
  if (servidor?.id !== prevId.current) {
    prevId.current = servidor?.id;
    setNome(servidor?.nome ?? "");
    setCpf(servidor?.cpf ?? "");
    setEmail(servidor?.email ?? "");
    setTelefone(servidor?.telefone ?? "");
    setCargoId(servidor?.cargoId ?? "");
    setLotacaoId(servidor?.lotacaoId ?? "");
    setPapeis(servidor?.papeis ?? ["USUARIO"]);
    setSenha("");
    setInlineError(undefined);
  }

  // Escape key closes dialog
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const togglePapel = (papel: Papel) => {
    setPapeis((prev) =>
      prev.includes(papel) ? prev.filter((p) => p !== papel) : [...prev, papel]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(undefined);

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(
          {
            nome: nome.trim(),
            cpf: cpf.replace(/\D/g, ""),
            email: email.trim(),
            telefone: telefone.trim(),
            cargoId,
            lotacaoId,
            papeis,
            senha,
          },
          { onSuccess: onClose }
        );
      } else if (servidor) {
        const changedFields = buildServidorUpdatePayload(servidor, {
          nome: nome.trim(),
          telefone: telefone.trim(),
          cargoId,
          lotacaoId,
          papeis,
        });
        await updateMutation.mutateAsync(
          { id: servidor.id, ...changedFields },
          { onSuccess: onClose }
        );
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setInlineError(t("toast.duplicate"));
        else if (err.status === 400) setInlineError(t("toast.invalidData"));
        else if (err.status === 404) setInlineError(t("toast.dependencyNotFound"));
        return;
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      data-testid={testId}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 id={headingId} className="text-base font-semibold text-neutral-900">
            {mode === "create" ? t("actions.create") : t("actions.edit")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("form.cancel")}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {inlineError && (
          <div className="mx-6 mt-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3">
            <p role="alert" className="text-sm text-danger">{inlineError}</p>
          </div>
        )}

        <form
          data-testid={testId ? `${testId}-form` : "servidor-form"}
          onSubmit={(e) => void handleSubmit(e)}
          className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-4"
          noValidate
        >
          <Input
            data-testid={testId ? `${testId}-nome` : "servidor-form-nome"}
            label={t("form.nome")}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            aria-required="true"
            autoFocus
          />

          {/* CPF — editable on create, read-only on edit */}
          {mode === "create" ? (
            <Input
              data-testid={testId ? `${testId}-cpf` : "servidor-form-cpf"}
              label={t("form.cpf")}
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              aria-required="true"
            />
          ) : (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-700">
                {t("form.cpf")}
              </label>
              <p className="h-10 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
                {formatCpf(servidor?.cpf ?? "")}
              </p>
              <p className="text-xs text-neutral-500">{t("form.cpfReadOnly")}</p>
            </div>
          )}

          {/* Email — editable on create, read-only on edit */}
          {mode === "create" ? (
            <Input
              data-testid={testId ? `${testId}-email` : "servidor-form-email"}
              label={t("form.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-required="true"
            />
          ) : (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-700">
                {t("form.email")}
              </label>
              <p className="h-10 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
                {servidor?.email}
              </p>
              <p className="text-xs text-neutral-500">{t("form.emailReadOnly")}</p>
            </div>
          )}

          {/* Senha — only on create */}
          {mode === "create" && (
            <Input
              data-testid={testId ? `${testId}-senha` : "servidor-form-senha"}
              label={t("form.senha")}
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-required="true"
              autoComplete="new-password"
              helperText={t("form.senhaHelper")}
            />
          )}

          <Input
            data-testid={testId ? `${testId}-telefone` : "servidor-form-telefone"}
            label={t("form.telefone")}
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            aria-required="true"
          />

          {/* Cargo select — active only */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="servidor-form-cargoId"
              className="text-sm font-medium text-neutral-700"
            >
              {t("form.cargoId")}
            </label>
            <select
              id="servidor-form-cargoId"
              data-testid={testId ? `${testId}-cargoId` : "servidor-form-cargoId"}
              value={cargoId}
              onChange={(e) => setCargoId(e.target.value)}
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
            >
              <option value="">—</option>
              {activeCargos.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Lotação select — active only */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="servidor-form-lotacaoId"
              className="text-sm font-medium text-neutral-700"
            >
              {t("form.lotacaoId")}
            </label>
            <select
              id="servidor-form-lotacaoId"
              data-testid={testId ? `${testId}-lotacaoId` : "servidor-form-lotacaoId"}
              value={lotacaoId}
              onChange={(e) => setLotacaoId(e.target.value)}
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
            >
              <option value="">—</option>
              {activeLotacoes.map((l) => (
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
            </select>
          </div>

          {/* Papeis multi-checkbox */}
          <fieldset>
            <legend className="text-sm font-medium text-neutral-700">
              {t("form.papeis")}
            </legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {PAPEL_OPTIONS.map((papel) => (
                <label
                  key={papel}
                  className="flex items-center gap-2 text-sm text-neutral-700"
                >
                  <input
                    type="checkbox"
                    data-testid={`servidor-form-papel-${papel}`}
                    checked={papeis.includes(papel)}
                    onChange={() => togglePapel(papel)}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                  />
                  {t(`papeis.${papel}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button
              type="button"
              data-testid={testId ? `${testId}-cancel` : "servidor-form-cancel"}
              variant="ghost"
              onClick={onClose}
            >
              {t("form.cancel")}
            </Button>
            <Button
              type="submit"
              data-testid={testId ? `${testId}-submit` : "servidor-form-submit"}
              variant="primary"
              isLoading={isPending}
              disabled={isPending}
            >
              {t("form.submit")}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}


