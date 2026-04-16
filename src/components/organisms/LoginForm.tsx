"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Button } from "@/components/atoms";
import { Input } from "@/components/atoms";
import { useLogin } from "@/hooks/auth/useLogin";
import { formatCpf, unformatCpf, isValidCpfFormat } from "@/lib/cpfUtils";
import type { ApiError } from "@/types";

/**
 * Login form organism for CPF + password authentication.
 *
 * Renders a self-contained login form with CPF masking, client-side
 * validation, API error display, and session expiry messaging. Uses the
 * `useLogin` mutation hook and reads `?reason=session_expired` from the
 * URL to show a session expiry notice.
 *
 * @returns The login form with CPF input, password input, submit button,
 *          error messages, and a link to the registration page.
 */
export function LoginForm() {
  const { t } = useTranslation("auth");
  const searchParams = useSearchParams();
  const { mutate, isPending, isError, error } = useLogin();

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    cpf?: string;
    password?: string;
  }>({});

  const isSessionExpired = searchParams.get("reason") === "session_expired";

  /**
   * Validates form fields and returns true if all fields are valid.
   */
  function validate(): boolean {
    const errors: { cpf?: string; password?: string } = {};
    const rawCpf = unformatCpf(cpf);

    if (!rawCpf) {
      errors.cpf = t("validation.cpfRequired");
    } else if (!isValidCpfFormat(rawCpf)) {
      errors.cpf = t("validation.cpfInvalid");
    }

    if (!password) {
      errors.password = t("validation.passwordRequired");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Maps API error status codes to user-facing i18n messages.
   */
  function getApiErrorMessage(err: ApiError): string {
    switch (err.status) {
      case 401:
        return t("errors.invalidCredentials");
      case 429:
        return t("errors.tooManyAttempts");
      default:
        if (err.code === "NETWORK_ERROR") {
          return t("errors.networkError");
        }
        return t("errors.serverError");
    }
  }

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCpf(e.target.value);
    setCpf(formatted);
    if (fieldErrors.cpf) {
      setFieldErrors((prev) => ({ ...prev, cpf: undefined }));
    }
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    mutate({ cpf: unformatCpf(cpf), senha: password });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-neutral-900">
        {t("login.title")}
      </h1>

      {isSessionExpired && (
        <p
          role="status"
          className="rounded-md bg-amber-50 p-3 text-sm text-amber-800"
        >
          {t("session.expired")}
        </p>
      )}

      {isError && error && (
        <div
          data-testid="error-message"
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-danger"
        >
          {getApiErrorMessage(error as ApiError)}
        </div>
      )}

      <Input
        label={t("login.cpfLabel")}
        placeholder={t("login.cpfPlaceholder")}
        value={cpf}
        onChange={handleCpfChange}
        autoComplete="username"
        data-testid="input-cpf"
        error={fieldErrors.cpf}
        id="login-cpf"
        inputMode="numeric"
      />

      <Input
        label={t("login.passwordLabel")}
        placeholder={t("login.passwordPlaceholder")}
        type="password"
        value={password}
        onChange={handlePasswordChange}
        autoComplete="current-password"
        data-testid="input-password"
        error={fieldErrors.password}
        id="login-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isPending}
        aria-busy={isPending}
        data-testid="button-login"
        className="w-full"
      >
        {t("login.submitButton")}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        <Link
          href="/register"
          className="text-brand-primary underline hover:opacity-80"
        >
          {t("login.registerLink")}
        </Link>
      </p>
    </form>
  );
}
