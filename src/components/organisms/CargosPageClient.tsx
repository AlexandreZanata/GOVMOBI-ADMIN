"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { useCargos } from "@/hooks/cargos/useCargos";
import { Permission } from "@/models";
import type { Cargo } from "@/models/Cargo";

type FilterValue = "all" | "active" | "inactive";

/**
 * Client-side cargos page renderer with table, filter, loading/error/empty states.
 *
 * @returns Interactive cargos management content
 */
export function CargosPageClient() {
  const { t } = useTranslation("cargos");
  const { data, isLoading, isError, refetch } = useCargos();
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (filter === "active") return list.filter((c) => c.ativo);
    if (filter === "inactive") return list.filter((c) => !c.ativo);
    return list;
  }, [data, filter]);

  let content: ReactNode;

  if (isLoading) {
    content = (
      <section data-testid="cargos-loading" className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
        ))}
      </section>
    );
  } else if (isError) {
    content = (
      <ErrorState data-testid="cargos-error" onRetry={() => void refetch()} />
    );
  } else if (!filtered.length) {
    content = (
      <section
        data-testid="cargos-empty"
        className="rounded-md border border-neutral-200 bg-neutral-50 p-6"
      >
        <h2 className="text-base font-semibold text-neutral-900">
          {t("page.empty.title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-700">{t("page.empty.message")}</p>
      </section>
    );
  } else {
    content = (
      <div className="overflow-hidden rounded-md border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">{t("table.nome")}</th>
              <th className="px-4 py-3">{t("table.pesoPrioridade")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {filtered.map((cargo) => (
              <CargoRow key={cargo.id} cargo={cargo} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Can
      perform={Permission.CARGO_VIEW}
      fallback={
        <section className="rounded-md border border-danger/30 bg-danger/10 p-4">
          <p className="text-sm font-medium text-danger">{t("page.accessDenied")}</p>
        </section>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">{t("page.title")}</h1>
        </div>

        <div className="flex gap-2" role="group" aria-label={t("page.title")}>
          {(["all", "active", "inactive"] as FilterValue[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-opacity",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                filter === f
                  ? "bg-brand-primary text-white"
                  : "bg-neutral-200 text-neutral-700 hover:opacity-80",
              ].join(" ")}
            >
              {t(`page.filters.${f}`)}
            </button>
          ))}
        </div>

        {content}
      </div>
    </Can>
  );
}

function CargoRow({ cargo }: { cargo: Cargo }) {
  const { t } = useTranslation("cargos");
  return (
    <tr className="transition-colors hover:bg-neutral-50">
      <td className="px-4 py-3 font-medium text-neutral-900">{cargo.nome}</td>
      <td className="px-4 py-3 text-neutral-700">{cargo.pesoPrioridade}</td>
      <td className="px-4 py-3">
        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            cargo.ativo
              ? "bg-success/15 text-success"
              : "bg-neutral-200 text-neutral-700",
          ].join(" ")}
        >
          {cargo.ativo ? t("status.active") : t("status.inactive")}
        </span>
      </td>
    </tr>
  );
}
