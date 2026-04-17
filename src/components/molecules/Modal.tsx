"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the modal should close (X button or Escape key). */
  onClose: () => void;
  /** Modal title shown in the header. */
  title: string;
  /** Optional subtitle shown below the title. */
  subtitle?: string;
  /** Modal body content. */
  children: ReactNode;
  /** Optional footer content (action buttons). */
  footer?: ReactNode;
  /** Max width class — defaults to `max-w-lg`. */
  maxWidth?: string;
  /** Test selector. */
  "data-testid"?: string;
}

/**
 * Reusable base modal component.
 *
 * Provides a consistent overlay, header with title + close button,
 * scrollable body, and optional footer. All domain-specific modals
 * (form dialogs, confirmation dialogs, detail views) should use this
 * as their container.
 *
 * @param props.open - Whether the modal is visible
 * @param props.onClose - Close callback (X button or Escape key)
 * @param props.title - Header title
 * @param props.subtitle - Optional header subtitle
 * @param props.children - Body content
 * @param props.footer - Optional footer (action buttons)
 * @param props.maxWidth - Tailwind max-width class (default: "max-w-lg")
 * @returns Accessible modal dialog
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-lg",
  "data-testid": testId,
}: ModalProps): React.ReactElement | null {
  const headingId = useId();

  // Escape key closes the modal
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    /* Overlay */
    <div
      data-testid={testId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={headingId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          "relative z-10 flex w-full flex-col",
          "rounded-2xl border border-neutral-200 bg-white shadow-xl",
          maxWidth,
          "max-h-[90vh]",
        ].join(" ")}
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-100 px-6 py-4">
          <div className="min-w-0">
            <h2
              id={headingId}
              className="truncate text-base font-semibold text-neutral-900"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 truncate text-sm text-neutral-500">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className={[
              "shrink-0 rounded-lg p-1.5",
              "text-neutral-400 transition-colors",
              "hover:bg-neutral-100 hover:text-neutral-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
            ].join(" ")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* ── Footer (optional) ── */}
        {footer && (
          <div className="shrink-0 border-t border-neutral-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
