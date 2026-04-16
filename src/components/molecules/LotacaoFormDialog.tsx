"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { useCreateLotacao } from "@/hooks/lotacoes/useCreateLotacao";
import { useUpdateLotacao } from "@/hooks/lotacoes/useUpdateLotacao";
import type { Lotacao } from "@/models/Lotacao";
import { ApiError } from "@/types";

/**
 * Dialog mode — controls which mutation is called on submit.
 */
export type LotacaoFormMode = "create" | "edit";

/**
 * Props for the lotação create/edit form dialog.
 */
export interface LotacaoFormDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Dialog mode — "create" or "edit". */
  mode: LotacaoFormMode;
  /** Existing lotação data pre-populated when mode is "edit". */
  lotacao?: Lotacao;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/** Maximum allowed length for the lotação name field. */
const NOME_MAX_LENGTH = 100;

/**
 * Modal form dialog for creating or editing a lotação.
 * Calls useCreateLotacao or useUpdateLotacao depending on mode.
 * Closes on success; stays open and shows inline error on HTTP 409 (duplicate name).
 *
 * @param props.open - Whether the dialog is visible
 * @param props.onClose - Callback to close the dialog
 * @param props.mode - "create" or "edit"
 * @param props.lotacao - Existing lotação data for edit mode
 * @param props.data-testid - Test selector prefix
 * @returns Accessible modal form dialog
 */
export function LotacaoFormDialog({
  open,
  onClose,
  mode,
  lotacao,
  "data-testid": testId,
}: LotacaoFormDialogProps): React.ReactElement | null {
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
  if (lotacao?.id !== prevLotacaoId.current) {
    prevLotacaoId.current = lotacao?.id;
    setNome(lotacao?.nome ?? "");
    setNomeError(undefined);
  }

  // Reset form when dialog opens in create mode
  useEffect(() => {
    if (open && mode === "create") {
      setNome("");
      setNomeError(undefined);
    }
  }, [open, mode]);

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

  const validate = (): boolean => {
    const trimmed = nome.trim();

    if (!trimmed) {
      setNomeError(t("form.nomeRequired"));
      return false;
    }

    if (trimmed.length > NOME_MAX_LENGTH) {
      setNomeError(t("form.nomeMaxLength"));
      return false;
    }

    setNomeError(undefined);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validate()) return;

    const trimmed = nome.trim();

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({ nome: trimmed });
      } else if (lotacao) {
        await updateMutation.mutateAsync({ id: lotacao.id, nome: trimmed });
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setNomeError(t("form.duplicateName"));
      }
    }
  };

  const titleKey =
    mode === "create" ? "form.titleCreate" : "form.titleEdit";

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
            maxLength={NOME_MAX_LENGTH}
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
