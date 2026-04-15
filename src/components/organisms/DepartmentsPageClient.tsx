"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { DepartmentFormDialog } from "@/components/molecules/DepartmentFormDialog";
import { useDepartments } from "@/hooks/departments/useDepartments";
import { Permission } from "@/models";
import type { Department } from "@/models/Department";

/**
 * Props for the departments page client organism.
 */
export interface DepartmentsPageClientProps {
  /** Optional test selector assigned to the root section. */
  "data-testid"?: string;
}

/**
 * Formats an ISO timestamp to a locale date string.
 *
 * @param iso - ISO 8601 date string
 * @returns Formatted date string (e.g. "Apr 1, 2026")
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Client-side departments page renderer with card grid layout.
 * Handles loading, error, and empty states.
 *
 * @param props - Optional root test selector
 * @returns Interactive departments management content
 */
export function DepartmentsPageClient({
  "data-testid": testId,
}: DepartmentsPageClientProps) {
  const { t } = useTranslation("departments");
  const { data, isLoading, isError, refetch } = useDepartments();
  const [formOpen, setFormOpen] = useState(false);

  const items = data?.items ?? [];

  let content: ReactNode;

  if (isLoading) {
    content = (
      <section
        data-testid="departments-loading"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-40 w-full animate-pulse rounded-lg bg-neutral-200"
          />
        ))}
      </section>
    );
  } else if (isError) {
    content = (
      <ErrorState
        data-testid="departments-error"
        onRetry={() => void refetch()}
      />
    );
  } else if (!items.length) {
    content = (
      <section
        data-testid="departments-empty"
        className="rounded-md border border-neutral-200 bg-neutral-50 p-6"
      >
        <h2 className="text-base font-semibold text-neutral-900">
          {t("page.empty.title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-700">
          {t("page.empty.message")}
        </p>
      </section>
    );
  } else {
    content = (
      <section
        data-testid={testId ?? "departments-grid"}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((dept) => (
          <DepartmentCard key={dept.id} department={dept} />
        ))}
      </section>
    );
  }

  return (
    <Can
      perform={Permission.DEPARTMENT_VIEW}
      fallback={
        <section
          data-testid="departments-access-denied"
          className="rounded-md border border-danger/30 bg-danger/10 p-4"
        >
          <p className="text-sm font-medium text-danger">
            {t("page.accessDenied")}
          </p>
        </section>
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">
            {t("page.title")}
          </h1>
          <Can perform={Permission.DEPARTMENT_CREATE}>
            <Button
              data-testid="departments-create-btn"
              variant="primary"
              size="sm"
              onClick={() => setFormOpen(true)}
            >
              {t("actions.create")}
            </Button>
          </Can>
        </div>

        {content}
      </div>

      <DepartmentFormDialog
        data-testid="department-form-dialog"
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </Can>
  );
}

// ── Card sub-component ───────────────────────────────────────────────────────

interface DepartmentCardProps {
  department: Department;
}

/**
 * Card displaying department summary: name, description, user count, active run count.
 *
 * @param props - Department data
 * @returns Styled department card
 */
function DepartmentCard({ department }: DepartmentCardProps) {
  const { t } = useTranslation("departments");

  return (
    <article
      data-testid={`department-card-${department.id}`}
      className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <div>
        <h2
          data-testid={`department-name-${department.id}`}
          className="text-base font-semibold text-neutral-900"
        >
          {department.name}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          {department.description ?? t("card.noDescription")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          data-testid={`department-users-${department.id}`}
          className="inline-flex items-center rounded-full bg-info/15 px-2.5 py-0.5 text-xs font-medium text-info"
        >
          {t("card.users", { count: department.userCount })}
        </span>

        <span
          data-testid={`department-runs-${department.id}`}
          className={[
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            department.activeRunCount > 0
              ? "bg-success/15 text-success"
              : "bg-neutral-200 text-neutral-700",
          ].join(" ")}
        >
          {t("card.activeRuns", { count: department.activeRunCount })}
        </span>
      </div>

      <p className="text-xs text-neutral-400">
        {t("card.created")}: {formatDate(department.createdAt)}
      </p>
    </article>
  );
}
