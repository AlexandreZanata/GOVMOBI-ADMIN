"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";

/**
 * Supported namespaces for dialog translation keys.
 */
type DialogNamespace = "common" | "runs" | "users" | "auth";

/**
 * Props for the generic confirmation dialog molecule.
 */
export interface ConfirmDialogProps {
  /** Dialog open state. */
  open: boolean;
  /** Called when dialog should close. */
  onClose: () => void;
  /** Called when destructive action is confirmed. */
  onConfirm: () => void;
  /** Translation namespace for dialog keys. */
  namespace: DialogNamespace;
  /** i18n key for dialog title. */
  titleKey: string;
  /** i18n key for optional dialog description. */
  descriptionKey?: string;
  /** i18n key for confirm button label. */
  confirmLabelKey: string;
  /** i18n key for cancel button label. */
  cancelLabelKey: string;
  /** Whether the confirm action is disabled. */
  confirmDisabled?: boolean;
  /** Whether the confirm action is in loading state. */
  confirmLoading?: boolean;
  /** Optional reason field content rendered by the caller. */
  reasonField?: ReactNode;
  /** Trigger element that should regain focus on close. */
  triggerRef?: RefObject<HTMLButtonElement | null>;
  /** Test selector prefix for dialog controls. */
  "data-testid"?: string;
}

/**
 * Displays an accessible destructive confirmation dialog.
 *
 * @param props - Dialog state, actions, labels, and accessibility metadata
 * @returns Modal dialog markup when open, otherwise null
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  namespace,
  titleKey,
  descriptionKey,
  confirmLabelKey,
  cancelLabelKey,
  confirmDisabled = false,
  confirmLoading = false,
  reasonField,
  triggerRef,
  "data-testid": testId,
}: ConfirmDialogProps) {
  const { t } = useTranslation(namespace);
  const headingId = useId();
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open && wasOpenRef.current) {
      triggerRef?.current?.focus();
    }

    wasOpenRef.current = open;
  }, [open, triggerRef]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      data-testid={testId}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="w-full max-w-lg rounded-lg border border-neutral-300 bg-white p-5 shadow-sm"
      >
        <h2 id={headingId} className="text-base font-semibold text-neutral-900">
          {t(titleKey)}
        </h2>

        {descriptionKey ? (
          <p className="mt-2 text-sm text-neutral-700">{t(descriptionKey)}</p>
        ) : null}

        {reasonField ? <div className="mt-4">{reasonField}</div> : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            data-testid={testId ? `${testId}-cancel` : "confirm-dialog-cancel"}
            variant="ghost"
            onClick={onClose}
          >
            {t(cancelLabelKey)}
          </Button>
          <Button
            data-testid={testId ? `${testId}-confirm` : "confirm-dialog-confirm"}
            variant="destructive"
            onClick={onConfirm}
            disabled={confirmDisabled}
            isLoading={confirmLoading}
            autoFocus
          >
            {t(confirmLabelKey)}
          </Button>
        </div>
      </section>
    </div>
  );
}
