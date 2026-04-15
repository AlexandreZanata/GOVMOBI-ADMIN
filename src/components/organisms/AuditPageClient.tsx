"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge, Button, Input } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { Permission, type AuditEntry } from "@/models";
import type { AuditFilters } from "@/types";

/**
 * Client-side audit page renderer with filter controls and cursor pagination.
 *
 * @returns Read-only audit timeline content
 */
export function AuditPageClient() {
  const { t } = useTranslation("audit");

  const [eventType, setEventType] = useState("");
  const [actorId, setActorId] = useState("");
  const [entityType, setEntityType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filters: AuditFilters = useMemo(
    () => ({
      ...(eventType.trim() ? { eventType: eventType.trim() } : {}),
      ...(actorId.trim() ? { actorId: actorId.trim() } : {}),
      ...(entityType.trim() ? { entityType: entityType.trim() } : {}),
      ...(fromDate ? { from: fromDate } : {}),
      ...(toDate ? { to: toDate } : {}),
      pageSize: 20,
    }),
    [eventType, actorId, entityType, fromDate, toDate]
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAuditTrail(filters);

  return (
    <Can
      perform={Permission.AUDIT_VIEW}
      fallback={
        <section
          data-testid="audit-access-denied"
          className="rounded-md border border-danger/30 bg-danger/10 p-4"
        >
          <p className="text-sm font-medium text-danger">{t("page.accessDenied")}</p>
        </section>
      }
    >
      <section className="space-y-4" data-testid="audit-page-client">
        <header className="space-y-1">
          <h1 className="text-lg font-semibold text-neutral-900">{t("page.title")}</h1>
          <p className="text-sm text-neutral-700">{t("page.subtitle")}</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FilterInput
            testId="audit-filter-eventType"
            label={t("filters.eventType")}
            value={eventType}
            onChange={setEventType}
            placeholder={t("filters.placeholders.eventType")}
          />
          <FilterInput
            testId="audit-filter-actorId"
            label={t("filters.actorId")}
            value={actorId}
            onChange={setActorId}
            placeholder={t("filters.placeholders.actorId")}
          />
          <FilterInput
            testId="audit-filter-entityType"
            label={t("filters.entityType")}
            value={entityType}
            onChange={setEntityType}
            placeholder={t("filters.placeholders.entityType")}
          />

          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            <span>{t("filters.from")}</span>
            <Input
              data-testid="audit-filter-from"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            <span>{t("filters.to")}</span>
            <Input
              data-testid="audit-filter-to"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>
        </div>

        {isLoading ? (
          <section data-testid="audit-loading" className="space-y-3">
            <div className="h-20 w-full animate-pulse rounded-md bg-neutral-200" />
            <div className="h-20 w-full animate-pulse rounded-md bg-neutral-200" />
            <div className="h-20 w-full animate-pulse rounded-md bg-neutral-200" />
          </section>
        ) : isError ? (
          <ErrorState data-testid="audit-error" onRetry={() => void refetch()} />
        ) : data.length === 0 ? (
          <section
            data-testid="audit-empty"
            className="rounded-md border border-neutral-200 bg-neutral-50 p-6"
          >
            <h2 className="text-base font-semibold text-neutral-900">{t("page.empty.title")}</h2>
            <p className="mt-1 text-sm text-neutral-700">{t("page.empty.message")}</p>
          </section>
        ) : (
          <>
            <ol data-testid="audit-timeline" className="space-y-3">
              {data.map((entry) => (
                <AuditTimelineItem key={entry.id} entry={entry} />
              ))}
            </ol>

            {hasNextPage && (
              <div className="flex justify-center">
                <Button
                  data-testid="audit-load-more"
                  variant="secondary"
                  isLoading={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {t("actions.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </Can>
  );
}

interface FilterInputProps {
  testId: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

function FilterInput({
  testId,
  label,
  value,
  placeholder,
  onChange,
}: FilterInputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-neutral-700">
      <span>{label}</span>
      <Input
        data-testid={testId}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

interface AuditTimelineItemProps {
  entry: AuditEntry;
}

function AuditTimelineItem({ entry }: AuditTimelineItemProps) {
  const { t } = useTranslation("audit");

  return (
    <li
      data-testid={`audit-entry-${entry.id}`}
      className="rounded-md border border-neutral-200 bg-white p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-neutral-900">
            {toActorDisplayName(t, entry.actorId)}
          </p>
          <Badge variant={getActorRoleVariant(entry.actorRole)}>{entry.actorRole}</Badge>
        </div>
        <time className="text-xs text-neutral-600" dateTime={entry.timestamp}>
          {new Date(entry.timestamp).toLocaleString()}
        </time>
      </div>

      <p className="mt-2 text-sm text-neutral-800">{entry.eventType}</p>
      <p className="mt-1 text-xs text-neutral-600">
        {t("timeline.entity", { entityType: entry.entityType, entityId: entry.entityId })}
      </p>
      <p className="mt-1 text-xs text-neutral-600">
        {t("timeline.payload")}: {summarizePayload(t, entry.payload)}
      </p>
    </li>
  );
}

function toActorDisplayName(
  t: (key: string, options?: Record<string, unknown>) => string,
  actorId: string
): string {
  const normalized = actorId.replace(/^user-/, "").trim();
  return t("timeline.actorFallback", { actorId: normalized });
}

function getActorRoleVariant(
  actorRole: AuditEntry["actorRole"]
): "danger" | "warning" | "info" | "neutral" {
  if (actorRole === "ADMIN") return "danger";
  if (actorRole === "SUPERVISOR") return "warning";
  if (actorRole === "DISPATCHER") return "info";
  return "neutral";
}

function summarizePayload(
  t: (key: string) => string,
  payload: Record<string, unknown>
): string {
  const entries = Object.entries(payload);
  if (!entries.length) {
    return t("timeline.payloadEmpty");
  }

  return entries
    .slice(0, 2)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(" | ");
}
