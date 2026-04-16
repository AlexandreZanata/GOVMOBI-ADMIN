"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { useCreateCargo } from "@/hooks/cargos/useCreateCargo";
import { useUpdateCargo } from "@/hooks/cargos/useUpdateCargo";
import type { Cargo } from "@/models/Cargo";
import { ApiError } from "@/types";

/**
 * Dialog mode — controls which mutation is called on submit.
 */
export type CargoFormMode = "create" | "edit";

/**
 * Props for the cargo create/edit form dialog.
 */
export interface CargoFormDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Dialog mode — "create" or "edit". */
  mode: CargoFormMode;
  /** Existing cargo data pre-populated when mode is "edit". */
  cargo?: Cargo;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/** Maximum allowed length for the cargo name field. */
const NOME_MAX_LENGTH = 100;
/** Minimum allowed value for the priority weight field. */
const PESO_MIN = 0;
/** Maximum allowed value for the priority weight field. */
const PESO_MAX = 100;

/**
 * Modal form dialog for creating or editing a cargo.
 * Calls useCreateCargo or useUpdateCargo depending on mode.
 * Closes on success; stays open and shows inline error on HTTP 409 (duplicate name).
 *
 * @param props.open - Whether the dialog is visible
 * @param props.onClose - Callback to close the dialog
 * @param props.mode - "create" or "edit"
 * @param props.cargo - Existing cargo data for edit mode
 * @param props.data-testid - Test selector prefix
 * @returns Accessible modal form dialog
 */
export function CargoFormDialog({
  open,
  onClose,
  mode,
  cargo,
  "data-testid": testId,
}: CargoFormDialogProps): React.ReactElement | null {
  const { t } = useTranslation("cargos");
  const headingId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const wasOpenRef = useRef(false);

  const [nome, setNome] = useState(cargo?.nome ?? "");
  const [pesoPrioridade, setPesoPrioridade] = useState<string>(
    cargo?.pesoPrioridade?.toString() ?? ""
  );
  const [nomeError, setNomeError] = useState<string | undefined>();
  const [pesoError, setPesoError] = useState<string | undefined>();
  const prevCargoId = useRef(cargo?.id);

  const createMutation = useCreateCargo();
  const updateMutation = useUpdateCargo();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Sync fields when cargo prop changes (e.g. switching rows in edit mode)
  if (cargo?.id !== prevCargoId.current) {
    prevCargoId.current = cargo?.id;
    setNome(cargo?.nome ?? "");
    setPesoPrioridade(cargo?.pesoPrioridade?.toString() ?? "");
    setNomeError(undefined);
    setPesoError(undefined);
  }

  // Reset form when dialog opens in create mode
  useEffect(() => {
    if (open && mode === "create") {
      setNome("");
      setPesoPrioridade("");
      setNomeError(undefined);
      setPesoError(undefined);
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
    let valid = true;
    const trimmedNome = nome.trim();

    if (!trimmedNome) {
      setNomeError(t("form.nomeRequired"));
      valid = false;
    } else if (trimmedNome.length > NOME_MAX_LENGTH) {
      setNomeError(t("form.nomeMaxLength"));
      valid = false;
    } else {
      setNomeError(undefined);
    }

    const pesoNum = Number(pesoPrioridade);
    if (pesoPrioridade.trim() === "" || Number.isNaN(pesoNum)) {
      setPesoError(t("form.pesoPrioridadeRequired"));
      valid = false;
    } else if (pesoNum < PESO_MIN) {
      setPesoError(t("form.pesoPrioridadeMin"));
      valid = false;
    } else if (pesoNum > PESO_MAX) {
      setPesoError(t("form.pesoPrioridadeMax"));
      valid = false;
    } else {
      setPesoError(undefined);
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validate()) return;

    const trimmedNome = nome.trim();
    const pesoNum = Number(pesoPrioridade);

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          nome: trimmedNome,
          pesoPrioridade: pesoNum,
        });
      } else if (cargo) {
        await updateMutation.mutateAsync({
          id: cargo.id,
          nome: trimmedNome,
          pesoPrioridade: pesoNum,
        });
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
          data-testid={testId ? `${testId}-form` : "cargo-form"}
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-4 space-y-4"
          noValidate
        >
          <Input
            data-testid={testId ? `${testId}-nome` : "cargo-form-nome"}
            label={t("form.nome")}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            error={nomeError}
            maxLength={NOME_MAX_LENGTH}
            aria-required="true"
            autoFocus
          />

          <Input
            data-testid={
              testId ? `${testId}-pesoPrioridade` : "cargo-form-pesoPrioridade"
            }
            label={t("form.pesoPrioridade")}
            type="number"
            value={pesoPrioridade}
            onChange={(e) => setPesoPrioridade(e.target.value)}
            error={pesoError}
            min={PESO_MIN}
            max={PESO_MAX}
            aria-required="true"
          />

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              data-testid={testId ? `${testId}-cancel` : "cargo-form-cancel"}
              variant="ghost"
              onClick={onClose}
            >
              {t("form.cancel")}
            </Button>
            <Button
              type="submit"
              data-testid={testId ? `${testId}-submit` : "cargo-form-submit"}
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
