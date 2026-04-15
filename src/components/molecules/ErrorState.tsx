"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";

/**
 * Props for reusable error feedback state.
 */
export interface ErrorStateProps {
  /** Callback executed when retry action is pressed. */
  onRetry: () => void;
  /** Test selector prefix for assertions. */
  "data-testid"?: string;
}

/**
 * Displays an operation error message with retry action.
 *
 * @param props - Retry handler and optional test selector
 * @returns Error state container with call-to-action
 */
export function ErrorState({ onRetry, "data-testid": testId }: ErrorStateProps) {
  const { t } = useTranslation("common");

  return (
    <section
      data-testid={testId}
      className="rounded-md border border-danger/30 bg-danger/10 p-4"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-danger">{t("errorState.title")}</p>
      <div className="mt-3">
        <Button
          data-testid={testId ? `${testId}-retry` : "error-retry"}
          onClick={onRetry}
          variant="destructive"
          size="sm"
        >
          {t("errorState.retry")}
        </Button>
      </div>
    </section>
  );
}
