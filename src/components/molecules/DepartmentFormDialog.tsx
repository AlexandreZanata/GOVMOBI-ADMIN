"use client";

import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { useCreateDepartment } from "@/hooks/departments/useCreateDepartment";
import { ApiError } from "@/types";

/**
 * Props for the department creation form dialog.
 */
export interface DepartmentFormDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/**
 * Modal form dialog for creating a new department.
 * Calls useCreateDepartment on submit; closes on success.
 * Shows an inline error on 409 (duplicate name).
 *
 * @param props - Dialog state and test selector
 * @returns Accessible modal form dialog
 */
export function DepartmentFormDialog({
  open,
  onClose,
  "data-testid": testId,
}: DepartmentFormDialogProps) {
  const { t } = useTranslation("departments");
  const headingId = useId();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();

  const createMutation = useCreateDepartment();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName("");
      setDescription("");
      setNameError(undefined);
    }
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
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError(t("form.name"));
      return;
    }

    setNameError(undefined);

    try {
      await createMutation.mutateAsync({
        name: trimmedName,
        ...(description.trim() && { description: description.trim() }),
      });
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setNameError(t("toast.duplicateName"));
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
        className="w-full max-w-md rounded-lg border border-neutral-300 bg-white p-5 shadow-sm"
      >
        <h2
          id={headingId}
          className="text-base font-semibold text-neutral-900"
        >
          {t("actions.create")}
        </h2>

        <form
          data-testid={testId ? `${testId}-form` : "department-form"}
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-4 space-y-4"
          noValidate
        >
          <Input
            data-testid={testId ? `${testId}-name` : "department-form-name"}
            label={t("form.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            placeholder={t("form.namePlaceholder")}
            maxLength={100}
            aria-required="true"
            autoFocus
          />

          <div className="flex flex-col gap-1">
            <label
              htmlFor="department-form-description"
              className="text-sm font-medium text-neutral-700"
            >
              {t("form.description")}
            </label>
            <textarea
              id="department-form-description"
              data-testid={
                testId ? `${testId}-description` : "department-form-description"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("form.descriptionPlaceholder")}
              maxLength={300}
              rows={3}
              className={[
                "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm",
                "bg-white text-neutral-900 placeholder:text-neutral-400",
                "focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1",
                "resize-none disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              data-testid={
                testId ? `${testId}-cancel` : "department-form-cancel"
              }
              variant="ghost"
              onClick={onClose}
            >
              {t("form.cancel")}
            </Button>
            <Button
              type="submit"
              data-testid={
                testId ? `${testId}-submit` : "department-form-submit"
              }
              variant="primary"
              isLoading={createMutation.isPending}
              disabled={createMutation.isPending}
            >
              {t("form.submit")}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
