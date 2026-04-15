"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button, StatusPill } from "@/components/atoms";
import { ErrorState } from "@/components/molecules/ErrorState";
import { Can } from "@/components/auth/Can";
import { useRuns } from "@/hooks/useRuns";
import { Permission, type Run } from "@/models";

/**
 * Props for the runs page client organism.
 */
export interface RunsPageClientProps {
  /** Optional test selector assigned to the root section. */
  "data-testid"?: string;
}

/**
 * Client-side runs page renderer with query state handling and filtering.
 *
 * @param props - Optional root test selector
 * @returns Interactive runs management content
 */
export function RunsPageClient({ "data-testid": testId }: RunsPageClientProps) {
  const { t } = useTranslation("runs");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const { data, isLoading, isError, refetch } = useRuns();

  const filteredRuns = useMemo(() => {
    const runs = data ?? [];

    return runs.filter((run) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : run.status === statusFilter;
      const matchesType = typeFilter === "ALL" ? true : run.type === typeFilter;

      return matchesStatus && matchesType;
    });
  }, [data, statusFilter, typeFilter]);

  let content: ReactNode;

  if (isLoading) {
    content = (
      <section data-testid="runs-loading" className="space-y-3">
        <div className="h-10 w-full animate-pulse rounded-[var(--radius-md)] bg-neutral-200" />
        <div className="h-24 w-full animate-pulse rounded-[var(--radius-md)] bg-neutral-200" />
        <div className="h-24 w-full animate-pulse rounded-[var(--radius-md)] bg-neutral-200" />
      </section>
    );
  } else if (isError) {
    content = <ErrorState data-testid="runs-error" onRetry={() => void refetch()} />;
  } else if (!filteredRuns.length) {
    content = (
      <section
        data-testid="runs-empty"
        className="rounded-[var(--radius-md)] border border-neutral-200 bg-neutral-50 p-6"
      >
        <h2 className="text-base font-semibold text-neutral-900">
          {t("page.empty.title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-700">{t("page.empty.message")}</p>
      </section>
    );
  } else {
    content = (
      <section data-testid={testId} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          <span>{t("page.filters.status")}</span>
          <select
            data-testid="runs-filter-status"
            className="rounded-[var(--radius-md)] border border-neutral-300 bg-neutral-50 px-3 py-2 text-neutral-900"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">{t("page.filters.all")}</option>
            <option value="PENDING">{t("status.PENDING")}</option>
            <option value="ASSIGNED">{t("status.ASSIGNED")}</option>
            <option value="IN_PROGRESS">{t("status.IN_PROGRESS")}</option>
            <option value="COMPLETED">{t("status.COMPLETED")}</option>
            <option value="CANCELLED">{t("status.CANCELLED")}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          <span>{t("page.filters.type")}</span>
          <select
            data-testid="runs-filter-type"
            className="rounded-[var(--radius-md)] border border-neutral-300 bg-neutral-50 px-3 py-2 text-neutral-900"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="ALL">{t("page.filters.all")}</option>
            <option value="TRANSPORT">{t("page.types.TRANSPORT")}</option>
            <option value="INSPECTION">{t("page.types.INSPECTION")}</option>
            <option value="EMERGENCY">{t("page.types.EMERGENCY")}</option>
            <option value="MAINTENANCE">{t("page.types.MAINTENANCE")}</option>
            <option value="ADMINISTRATIVE">{t("page.types.ADMINISTRATIVE")}</option>
          </select>
        </label>
      </div>

      <ul data-testid="runs-list" className="space-y-3">
        {filteredRuns.map((run) => (
          <RunCard key={run.id} run={run} />
        ))}
      </ul>
      </section>
    );
  }

  return (
    <Can
      perform={Permission.VIEW_RUNS}
      fallback={
        <section
          data-testid="runs-access-denied"
          className="rounded-[var(--radius-md)] border border-danger/30 bg-danger/10 p-4"
        >
          <p className="text-sm font-medium text-danger">{t("page.accessDenied")}</p>
        </section>
      }
    >
      {content}
    </Can>
  );
}

interface RunCardProps {
  /** Run contract to display. */
  run: Run;
}

function RunCard({ run }: RunCardProps) {
  const { t } = useTranslation("runs");

  return (
    <li
      data-testid={`run-card-${run.id}`}
      className="rounded-[var(--radius-md)] border border-neutral-200 bg-white p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">{run.title}</h3>
          <p className="mt-1 text-sm text-neutral-700">{run.description}</p>
        </div>
        <StatusPill data-testid={`run-status-${run.id}`} status={run.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Can perform={Permission.ASSIGN_RUN}>
          <Button data-testid={`assign-run-${run.id}`} size="sm" variant="secondary">
            {t("page.actions.assign")}
          </Button>
        </Can>

        <Can perform={Permission.UPDATE_STATUS}>
          <Button data-testid={`update-run-${run.id}`} size="sm" variant="primary">
            {t("page.actions.updateStatus")}
          </Button>
        </Can>

        <Can perform={Permission.OVERRIDE_ACTION}>
          <Button data-testid={`override-run-${run.id}`} size="sm" variant="destructive">
            {t("page.actions.override")}
          </Button>
        </Can>
      </div>
    </li>
  );
}
