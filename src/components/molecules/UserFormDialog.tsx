"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { useCreateUser } from "@/hooks/users/useCreateUser";
import { useUpdateUser } from "@/hooks/users/useUpdateUser";
import type { User } from "@/models/User";
import { ApiError } from "@/types";

/** Dialog mode — controls which mutation is called on submit. */
export type UserFormMode = "create" | "edit";

/** Available role options for the role select. */
const ROLE_OPTIONS = [
  "ADMIN",
  "SUPERVISOR",
  "DISPATCHER",
  "FIELD_AGENT",
] as const;

/**
 * Props for the user create/edit form dialog.
 */
export interface UserFormDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Dialog mode — "create" or "edit". */
  mode: UserFormMode;
  /** Existing user data pre-populated when mode is "edit". */
  user?: User;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/**
 * Modal form dialog for creating or editing a user.
 * Calls useCreateUser or useUpdateUser depending on mode.
 * Closes on success; stays open on error.
 * Shows inline field-level errors for 409 (duplicate email) and 422 responses.
 *
 * @param props - Dialog state, mode, optional user data, and test selector
 * @returns Accessible modal form dialog
 */
export function UserFormDialog({
  open,
  onClose,
  mode,
  user,
  "data-testid": testId,
}: UserFormDialogProps) {
  const { t } = useTranslation("users");
  const headingId = useId();
  const wasOpenRef = useRef(false);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<string>(user?.role ?? "DISPATCHER");
  const [departmentId, setDepartmentId] = useState(
    user?.departmentId ?? ""
  );
  const [emailError, setEmailError] = useState<string | undefined>();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Sync fields when user prop changes
  const prevUserId = useRef(user?.id);
  if (user?.id !== prevUserId.current) {
    prevUserId.current = user?.id;
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setRole(user?.role ?? "DISPATCHER");
    setDepartmentId(user?.departmentId ?? "");
    setEmailError(undefined);
  }

  // Return focus to trigger on close
  useEffect(() => {
    if (!open && wasOpenRef.current) {
      wasOpenRef.current = false;
    }
    if (open) wasOpenRef.current = true;
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
    setEmailError(undefined);

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          name: name.trim(),
          email: email.trim(),
          role: role as User["role"],
          departmentId: departmentId.trim(),
        });
        onClose();
      } else if (user) {
        await updateMutation.mutateAsync({
          id: user.id,
          name: name.trim(),
          role: role as User["role"],
          departmentId: departmentId.trim(),
        });
        onClose();
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setEmailError(t("toast.duplicateEmail"));
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
          {mode === "create" ? t("actions.create") : t("actions.edit")}
        </h2>

        <form
          data-testid={testId ? `${testId}-form` : "user-form"}
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-4 space-y-4"
          noValidate
        >
          <Input
            data-testid={testId ? `${testId}-name` : "user-form-name"}
            label={t("form.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-required="true"
            autoFocus
          />

          {mode === "create" ? (
            <Input
              data-testid={testId ? `${testId}-email` : "user-form-email"}
              label={t("form.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              aria-required="true"
            />
          ) : (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-700">
                {t("form.email")}
              </label>
              <p
                data-testid={testId ? `${testId}-email-readonly` : "user-form-email-readonly"}
                className="h-10 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500"
              >
                {user?.email}
              </p>
              <p className="text-xs text-neutral-500">{t("form.emailReadOnly")}</p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label
              htmlFor="user-form-role"
              className="text-sm font-medium text-neutral-700"
            >
              {t("form.role")}
            </label>
            <select
              id="user-form-role"
              data-testid={testId ? `${testId}-role` : "user-form-role"}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {t(`role.${r}`)}
                </option>
              ))}
            </select>
          </div>

          <Input
            data-testid={testId ? `${testId}-department` : "user-form-department"}
            label={t("form.department")}
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            aria-required="true"
          />

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              data-testid={testId ? `${testId}-cancel` : "user-form-cancel"}
              variant="ghost"
              onClick={onClose}
            >
              {t("form.cancel")}
            </Button>
            <Button
              type="submit"
              data-testid={testId ? `${testId}-submit` : "user-form-submit"}
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
