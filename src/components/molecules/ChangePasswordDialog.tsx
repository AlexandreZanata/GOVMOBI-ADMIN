"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Modal } from "./Modal";
import { Button } from "@/components/atoms";
import { useChangePassword } from "@/hooks/auth/useChangePassword";
import type { ApiError } from "@/types";

export interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  "data-testid"?: string;
}

interface FormErrors {
  senhaAntiga?: string;
  novaSenha?: string;
  confirmarSenha?: string;
  general?: string;
}

/**
 * Modal dialog for changing the authenticated user's password.
 *
 * Features:
 * - Three-field form: Current Password, New Password, Confirm New Password
 * - Client-side validation: min 8 chars, passwords match
 * - Server-side error handling: 401 (wrong password), 422 (validation)
 * - Success state: shows message, auto-closes after 2s
 * - Full keyboard navigation and ARIA support
 *
 * @param props.open - Whether the dialog is visible
 * @param props.onClose - Callback to close the dialog
 * @returns Accessible modal form dialog
 */
export function ChangePasswordDialog({
  open,
  onClose,
  "data-testid": testId,
}: ChangePasswordDialogProps): React.ReactElement | null {
  const { t } = useTranslation("auth");
  const { mutate, isPending, isError, error, isSuccess, reset } = useChangePassword();

  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const senhaAntigaRef = useRef<HTMLInputElement>(null);

  // Auto-focus current password field when dialog opens
  useEffect(() => {
    if (open && senhaAntigaRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        senhaAntigaRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSenhaAntiga("");
      setNovaSenha("");
      setConfirmarSenha("");
      setErrors({});
      setTouched({});
      setShowSuccess(false);
      reset();
    }
  }, [open, reset]);

  // Handle success: show message and auto-close after 2s
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  // Handle API errors
  useEffect(() => {
    if (isError && error) {
      const newErrors: FormErrors = {};

      if (error.status === 401) {
        // Incorrect current password
        newErrors.senhaAntiga = t("changePassword.errors.incorrectPassword");
      } else if (error.status === 422) {
        // Validation error from API
        const apiError = error as ApiError & { field?: string };
        if (apiError.field === "novaSenha") {
          newErrors.novaSenha = error.message || t("changePassword.errors.passwordTooShort");
        } else {
          newErrors.general = error.message;
        }
      } else if (error.code === "NETWORK_ERROR") {
        // Network error
        newErrors.general = t("errors.networkError");
      } else {
        // Other errors
        newErrors.general = error.message || t("errors.serverError");
      }

      setErrors(newErrors);
    }
  }, [isError, error, t]);

  // Client-side validation
  const validateField = (field: string, value: string): string | undefined => {
    if (field === "senhaAntiga") {
      if (!value) return t("validation.passwordRequired");
    } else if (field === "novaSenha") {
      if (!value) return t("validation.passwordRequired");
      if (value.length < 8) return t("changePassword.errors.passwordTooShort");
    } else if (field === "confirmarSenha") {
      if (!value) return t("validation.passwordRequired");
      if (value !== novaSenha) return t("changePassword.errors.passwordMismatch");
    }
    return undefined;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const senhaAntigaError = validateField("senhaAntiga", senhaAntiga);
    const novaSenhaError = validateField("novaSenha", novaSenha);
    const confirmarSenhaError = validateField("confirmarSenha", confirmarSenha);

    if (senhaAntigaError) newErrors.senhaAntiga = senhaAntigaError;
    if (novaSenhaError) newErrors.novaSenha = novaSenhaError;
    if (confirmarSenhaError) newErrors.confirmarSenha = confirmarSenhaError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle blur events for touched state
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate field on blur if it's been touched
    const value = field === "senhaAntiga" ? senhaAntiga : field === "novaSenha" ? novaSenha : confirmarSenha;
    const error = validateField(field, value);

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      senhaAntiga: true,
      novaSenha: true,
      confirmarSenha: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Submit
    mutate({ senhaAntiga, novaSenha });
  };

  // Success state
  if (showSuccess) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={t("changePassword.title")}
        data-testid={testId}
      >
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <svg
              className="h-6 w-6 text-success"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-neutral-900" role="status">
            {t("changePassword.successMessage")}
          </p>
        </div>
      </Modal>
    );
  }

  // Form state
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("changePassword.title")}
      data-testid={testId}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            {t("changePassword.cancelButton")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? "..." : t("changePassword.submitButton")}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* General error message */}
        {errors.general && (
          <div
            className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
            role="alert"
          >
            {errors.general}
          </div>
        )}

        {/* Current Password */}
        <div>
          <label
            htmlFor="senhaAntiga"
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            {t("changePassword.currentPasswordLabel")}
          </label>
          <input
            ref={senhaAntigaRef}
            id="senhaAntiga"
            type="password"
            value={senhaAntiga}
            onChange={(e) => setSenhaAntiga(e.target.value)}
            onBlur={() => handleBlur("senhaAntiga")}
            placeholder={t("changePassword.currentPasswordPlaceholder")}
            disabled={isPending}
            aria-invalid={touched.senhaAntiga && !!errors.senhaAntiga}
            aria-describedby={errors.senhaAntiga ? "senhaAntiga-error" : undefined}
            className={[
              "h-10 w-full rounded-lg border px-3 text-sm transition-colors",
              "placeholder:text-neutral-400",
              "focus:outline-none focus:ring-2",
              touched.senhaAntiga && errors.senhaAntiga
                ? "border-danger bg-danger/5 focus:border-danger focus:ring-danger/20"
                : "border-neutral-200 bg-neutral-50 focus:border-brand-primary focus:bg-white focus:ring-brand-primary/20",
              isPending && "opacity-50 cursor-not-allowed",
            ].join(" ")}
          />
          {touched.senhaAntiga && errors.senhaAntiga && (
            <p id="senhaAntiga-error" className="mt-1.5 text-xs text-danger">
              {errors.senhaAntiga}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="novaSenha"
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            {t("changePassword.newPasswordLabel")}
          </label>
          <input
            id="novaSenha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            onBlur={() => handleBlur("novaSenha")}
            placeholder={t("changePassword.newPasswordPlaceholder")}
            disabled={isPending}
            aria-invalid={touched.novaSenha && !!errors.novaSenha}
            aria-describedby={errors.novaSenha ? "novaSenha-error" : undefined}
            className={[
              "h-10 w-full rounded-lg border px-3 text-sm transition-colors",
              "placeholder:text-neutral-400",
              "focus:outline-none focus:ring-2",
              touched.novaSenha && errors.novaSenha
                ? "border-danger bg-danger/5 focus:border-danger focus:ring-danger/20"
                : "border-neutral-200 bg-neutral-50 focus:border-brand-primary focus:bg-white focus:ring-brand-primary/20",
              isPending && "opacity-50 cursor-not-allowed",
            ].join(" ")}
          />
          {touched.novaSenha && errors.novaSenha && (
            <p id="novaSenha-error" className="mt-1.5 text-xs text-danger">
              {errors.novaSenha}
            </p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label
            htmlFor="confirmarSenha"
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            {t("changePassword.confirmPasswordLabel")}
          </label>
          <input
            id="confirmarSenha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            onBlur={() => handleBlur("confirmarSenha")}
            placeholder={t("changePassword.confirmPasswordPlaceholder")}
            disabled={isPending}
            aria-invalid={touched.confirmarSenha && !!errors.confirmarSenha}
            aria-describedby={errors.confirmarSenha ? "confirmarSenha-error" : undefined}
            className={[
              "h-10 w-full rounded-lg border px-3 text-sm transition-colors",
              "placeholder:text-neutral-400",
              "focus:outline-none focus:ring-2",
              touched.confirmarSenha && errors.confirmarSenha
                ? "border-danger bg-danger/5 focus:border-danger focus:ring-danger/20"
                : "border-neutral-200 bg-neutral-50 focus:border-brand-primary focus:bg-white focus:ring-brand-primary/20",
              isPending && "opacity-50 cursor-not-allowed",
            ].join(" ")}
          />
          {touched.confirmarSenha && errors.confirmarSenha && (
            <p id="confirmarSenha-error" className="mt-1.5 text-xs text-danger">
              {errors.confirmarSenha}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
