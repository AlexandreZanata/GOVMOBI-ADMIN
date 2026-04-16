"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { useDeleteLotacao } from "@/hooks/lotacoes/useDeleteLotacao";
import type { Lotacao } from "@/models/Lotacao";

/**
 * Props for the lotacao soft-delete confirmation dialog.
 */
export interface LotacaoDeleteDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Lotacao to be soft-deleted. */
  lotacao: Lotacao;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/**
 * Confirmation dialog for soft-deleting a lotação.
 * Calls useDeleteLotacao on confirm; closes on success.
 *
 * @param props - Dialog state, target lotacao, and test selector
 * @returns Accessible destructive confirmation dialog
 */
export function LotacaoDeleteDialog({
  open,
  onClose,
  lotacao,
  "data-testid": testId,
}: LotacaoDeleteDialogProps) {
  const { t } = useTranslation("lotacoes");
  const headingId = useId();
  const deleteMutation = useDeleteLotacao();

  if (!open) return null;

  const handleConfirm = async () => {
    await deleteMutation.mutateAsync(
      { id: lotacao.id },
      { onSuccess: onClose }
    );
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
        className="w-full max-w-md rounded-lg border border-neutral-300 bg-white p-5 shadow-sm"
      >
        <h2
          id={headingId}
          className="text-base font-semibold text-neutral-900"
        >
          {t("actions.delete")}
        </h2>

        <p className="mt-2 text-sm text-neutral-700">
          {lotacao.nome}
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            data-testid={testId ? `${testId}-cancel` : "lotacao-delete-cancel"}
            variant="ghost"
            onClick={onClose}
          >
            {t("form.cancel")}
          </Button>
          <Button
            data-testid={testId ? `${testId}-confirm` : "lotacao-delete-confirm"}
            variant="destructive"
            onClick={() => void handleConfirm()}
            isLoading={deleteMutation.isPending}
            disabled={deleteMutation.isPending}
            autoFocus
          >
            {t("actions.delete")}
          </Button>
        </div>
      </section>
    </div>
  );
}
