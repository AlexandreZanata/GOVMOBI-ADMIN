"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { useCreateLotacao } from "@/hooks/lotacoes/useCreateLotacao";
import { useUpdateLotacao } from "@/hooks/lotacoes/useUpdateLotacao";
import type { Lotacao } from "@/models/Lotacao";

/**
 * Dialog mode — controls which mutation is called on submit.
 */
export type LotacaoFormMode = "create" | "edit";

/**
 * Props for the lotacao create/edit form dialog.
 */
export interface LotacaoFormDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Dialog mode — "create" or "edit". */
  mode: LotacaoFormMode;
  /** Existing lotacao data pre-populated when mode is "edit". */
  lotacao?: Lotacao;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/**
 * Modal form dialog for creating or editing a lotação.
 * Calls useCreateLotacao or useUpdateLotacao depending on mode.
 * Closes on success; stays open on error.
 *
 * @param props - Dialog state, mode, optional lotacao data, and test selector
 * @returns Accessible modal form dialog
 */
export function LotacaoFormDialog({
  open,
  onClose,
  mode,
  lotacao,
  "data-testid": testId,
}: LotacaoFormDialogProps) {
  const { t } = useTranslation("lotacoes");
  const headingId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const wasOpenRef = useRef(false);

  const [nome, setNome] = useState(lotacao?.nome ?? "");
  const [nomeError, setNomeError] = useState<string | undefined>();
  const prevLotacaoId = useRef(lotacao?.id);

  const createMutation = useCreateLotacao();
  const updateMutation = useUpdateLotacao();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Sync nome when lotacao prop changes (e.g. switching rows)
  // Using a ref comparison avoids the setState-in-effect lint warning
  if (lotacao?.id !== prevLotacaoId.current) {
    prevLotacaoId.current = lotacao?.id;
    setNome(lotacao?.nome ?? "");
    setNomeError(undefined);
  }

  // Return focus to trigger on close
  useEffect(() => {
    if (!open && wasOpenRef.current) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  // Escape key closes dialog
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nome.trim();

    if (!trimmed) {
      setNomeError(t("form.nome"));
      return;
    }

    setNomeError(undefined);

    if (mode === "create") {
      await createMutation.mutateAsync(
        { nome: trimmed },
        { onSuccess: onClose }
      );
    } else if (lotacao) {
      await updateMutation.mutateAsync(
        { id: lotacao.id, nome: trimmed },
        { onSuccess: onClose }
      );
    }
  };

  const titleKey =
    mode === "create" ? "actions.create" : "actions.edit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      data-testid={testId}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="w-full max-w-md rounded-lg border border-neutral-300 bg-white p-5 shadow-sm"
      >
        <h2
          id={headingId}
          className="text-base font-semibold text-neutral-900"
        >
          {t(titleKey)}
        </h2>

        <form
          data-testid={testId ? `${testId}-form` : "lotacao-form"}
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-4 space-y-4"
          noValidate
        >
          <Input
            data-testid={testId ? `${testId}-nome` : "lotacao-form-nome"}
            label={t("form.nome")}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            error={nomeError}
            aria-required="true"
            autoFocus
          />

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              data-testid={testId ? `${testId}-cancel` : "lotacao-form-cancel"}
              variant="ghost"
              onClick={onClose}
            >
              {t("form.cancel")}
            </Button>
            <Button
              type="submit"
              data-testid={testId ? `${testId}-submit` : "lotacao-form-submit"}
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
