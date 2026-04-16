"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { useCreateMotorista } from "@/hooks/motoristas/useCreateMotorista";
import { useUpdateMotorista } from "@/hooks/motoristas/useUpdateMotorista";
import type { CnhCategoria, Motorista } from "@/models/Motorista";
import { ApiError } from "@/types";

/** Dialog mode — controls which mutation is called on submit. */
export type MotoristaFormMode = "create" | "edit";

/** Available CNH category options. */
const CNH_OPTIONS: CnhCategoria[] = ["A", "B", "AB", "C", "D", "E"];

/**
 * Props for the motorista create/edit form dialog.
 */
export interface MotoristaFormDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Dialog mode — "create" or "edit". */
  mode: MotoristaFormMode;
  /** Existing motorista data pre-populated when mode is "edit". */
  motorista?: Motorista;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/**
 * Modal form dialog for registering a new motorista or editing CNH data.
 * In "create" mode: collects servidorId, cnhNumero, cnhCategoria.
 * In "edit" mode: allows updating cnhNumero and cnhCategoria only.
 * Shows inline error on 409 (duplicate CNH).
 *
 * @param props - Dialog state, mode, optional motorista data, and test selector
 * @returns Accessible modal form dialog
 */
export function MotoristaFormDialog({
  open,
  onClose,
  mode,
  motorista,
  "data-testid": testId,
}: MotoristaFormDialogProps) {
  const { t } = useTranslation("motoristas");
  const headingId = useId();

  const [servidorId, setServidorId] = useState(motorista?.servidorId ?? "");
  const [servidorIdError, setServidorIdError] = useState<string | undefined>();
  const [cnhNumero, setCnhNumero] = useState(motorista?.cnhNumero ?? "");
  const [cnhCategoria, setCnhCategoria] = useState<CnhCategoria>(
    motorista?.cnhCategoria ?? "B"
  );
  const [cnhError, setCnhError] = useState<string | undefined>();

  /** RFC 4122 UUID v4/v7 pattern used to validate servidorId before submit. */
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const createMutation = useCreateMotorista();
  const updateMutation = useUpdateMotorista();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Sync fields when motorista prop changes
  const prevId = useRef(motorista?.id);
  if (motorista?.id !== prevId.current) {
    prevId.current = motorista?.id;
    setServidorId(motorista?.servidorId ?? "");
    setServidorIdError(undefined);
    setCnhNumero(motorista?.cnhNumero ?? "");
    setCnhCategoria(motorista?.cnhCategoria ?? "B");
    setCnhError(undefined);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCnhError(undefined);
    setServidorIdError(undefined);

    // Validate servidorId is a valid UUID before hitting the API
    if (mode === "create" && !UUID_RE.test(servidorId.trim())) {
      setServidorIdError(t("form.servidorIdInvalid"));
      return;
    }

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(
          { servidorId: servidorId.trim(), cnhNumero: cnhNumero.trim(), cnhCategoria },
          { onSuccess: onClose }
        );
      } else if (motorista) {
        await updateMutation.mutateAsync(
          { id: motorista.id, cnhNumero: cnhNumero.trim(), cnhCategoria },
          { onSuccess: onClose }
        );
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setCnhError(t("toast.duplicateCnh"));
        return; // error handled inline — do not re-throw
      }
      // All other errors are handled by the hook's onError toast
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
        className="w-full max-w-md rounded-lg border border-neutral-300 bg-white p-5 shadow-sm"
      >
        <h2 id={headingId} className="text-base font-semibold text-neutral-900">
          {mode === "create" ? t("actions.create") : t("actions.edit")}
        </h2>

        <form
          data-testid={testId ? `${testId}-form` : "motorista-form"}
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-4 space-y-4"
          noValidate
        >
          {mode === "create" && (
            <Input
              data-testid={testId ? `${testId}-servidorId` : "motorista-form-servidorId"}
              label={t("form.servidorId")}
              value={servidorId}
              onChange={(e) => setServidorId(e.target.value)}
              error={servidorIdError}
              aria-required="true"
              autoFocus
            />
          )}

          <Input
            data-testid={testId ? `${testId}-cnhNumero` : "motorista-form-cnhNumero"}
            label={t("form.cnhNumero")}
            value={cnhNumero}
            onChange={(e) => setCnhNumero(e.target.value)}
            error={cnhError}
            aria-required="true"
            autoFocus={mode === "edit"}
          />

          <div className="flex flex-col gap-1">
            <label
              htmlFor="motorista-form-cnhCategoria"
              className="text-sm font-medium text-neutral-700"
            >
              {t("form.cnhCategoria")}
            </label>
            <select
              id="motorista-form-cnhCategoria"
              data-testid={testId ? `${testId}-cnhCategoria` : "motorista-form-cnhCategoria"}
              value={cnhCategoria}
              onChange={(e) => setCnhCategoria(e.target.value as CnhCategoria)}
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
            >
              {CNH_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              data-testid={testId ? `${testId}-cancel` : "motorista-form-cancel"}
              variant="ghost"
              onClick={onClose}
            >
              {t("form.cancel")}
            </Button>
            <Button
              type="submit"
              data-testid={testId ? `${testId}-submit` : "motorista-form-submit"}
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
