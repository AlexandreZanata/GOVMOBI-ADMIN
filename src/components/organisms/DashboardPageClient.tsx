"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  Truck,
  ClipboardList,
  CalendarClock,
  Star,
  TrendingUp,
  Award,
} from "lucide-react";
import "@/i18n/config";

import { useRuns } from "@/hooks/runs/useRuns";
import { useMotoristas } from "@/hooks/motoristas/useMotoristas";
import { useServidores } from "@/hooks/servidores/useServidores";
import { RunStatus } from "@/models";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  [RunStatus.SOLICITADA]:        { bg: "bg-warning/10",       text: "text-warning",       bar: "bg-warning" },
  [RunStatus.AGUARDANDO_ACEITE]: { bg: "bg-info/10",          text: "text-info",          bar: "bg-info" },
  [RunStatus.ACEITA]:            { bg: "bg-info/10",          text: "text-info",          bar: "bg-info" },
  [RunStatus.EM_ROTA]:           { bg: "bg-brand-primary/10", text: "text-brand-primary", bar: "bg-brand-primary" },
  [RunStatus.CONCLUIDA]:         { bg: "bg-success/10",       text: "text-success",       bar: "bg-success" },
  [RunStatus.AVALIADA]:          { bg: "bg-success/10",       text: "text-success",       bar: "bg-success" },
  [RunStatus.CANCELADA]:         { bg: "bg-danger/10",        text: "text-danger",        bar: "bg-danger" },
  [RunStatus.EXPIRADA]:          { bg: "bg-neutral-100",      text: "text-neutral-500",   bar: "bg-neutral-300" },
};

function isToday(isoDate: string): boolean {
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  loading?: boolean;
  "data-testid"?: string;
}

function StatCard({ icon, label, value, sub, color, loading, "data-testid": testId }: StatCardProps) {
  return (
    <div
      data-testid={testId}
      className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-neutral-500">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-16 animate-pulse rounded-md bg-neutral-100" />
        ) : (
          <p className="mt-0.5 text-2xl font-bold tabular-nums text-neutral-900">{value}</p>
        )}
        {sub && !loading && (
          <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-brand-primary">{icon}</span>
      <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
    </div>
  );
}

// ─── Ranking Row ──────────────────────────────────────────────────────────────

interface RankingRowProps {
  rank: number;
  name: string;
  value: number;
  unit: string;
  maxValue: number;
}

function RankingRow({ rank, name, value, unit, maxValue }: RankingRowProps) {
  const pct = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  const isTop = rank === 1;

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span
        className={[
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isTop
            ? "bg-brand-primary text-white"
            : "bg-neutral-100 text-neutral-500",
        ].join(" ")}
      >
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-neutral-800">{name}</p>
          <span className="shrink-0 text-xs font-semibold text-neutral-600">
            {value} <span className="font-normal text-neutral-400">{unit}</span>
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-brand-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Status Bar Chart ─────────────────────────────────────────────────────────

interface StatusBarProps {
  status: string;
  count: number;
  total: number;
  label: string;
}

function StatusBar({ status, count, total, label }: StatusBarProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colors = STATUS_COLORS[status] ?? { bg: "bg-neutral-100", text: "text-neutral-500", bar: "bg-neutral-300" };

  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
        <span className={`h-2 w-2 rounded-full ${colors.bar}`} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-xs font-medium ${colors.text}`}>{label}</p>
          <span className="text-xs font-semibold tabular-nums text-neutral-700">
            {count}
            <span className="ml-1 font-normal text-neutral-400">({pct}%)</span>
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
            style={{ width: `${pct}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Dashboard page client — operational overview with KPI cards, rankings, and charts.
 * Aggregates data from runs, motoristas, and servidores.
 */
export function DashboardPageClient() {
  const { t } = useTranslation("dashboard");

  // Data fetching
  const { data: runsData, isLoading: isLoadingRuns } = useRuns({ page: 1, limit: 500 });
  const { data: motoristas, isLoading: isLoadingMotoristas } = useMotoristas();
  const { data: servidores, isLoading: isLoadingServidores } = useServidores();

  const runs = runsData?.data ?? [];

  // ── Derived metrics ────────────────────────────────────────────────────────

  const totalServidores = servidores?.length ?? 0;
  const totalServidoresAtivos = servidores?.filter((s) => s.ativo).length ?? 0;

  const totalMotoristas = motoristas?.length ?? 0;
  const totalMotoristasDisponiveis = motoristas?.filter(
    (m) => m.ativo && m.statusOperacional === "DISPONIVEL"
  ).length ?? 0;

  const totalCorridas = runsData?.total ?? runs.length;
  const corridasHoje = runs.filter((r) => isToday(r.createdAt)).length;

  // Corridas por status
  const corridasPorStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const run of runs) {
      counts[run.status] = (counts[run.status] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => ({ status, count }));
  }, [runs]);

  // Top solicitantes (passageiroId com mais corridas)
  const topSolicitantes = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const run of runs) {
      counts[run.passageiroId] = (counts[run.passageiroId] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, total], idx) => ({ rank: idx + 1, name: id.slice(0, 8) + "…", total }));
  }, [runs]);

  // Top motoristas (motoristaId com mais corridas concluídas)
  const topMotoristas = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const run of runs) {
      if (
        run.motoristaId &&
        (run.status === RunStatus.CONCLUIDA || run.status === RunStatus.AVALIADA)
      ) {
        counts[run.motoristaId] = (counts[run.motoristaId] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, total], idx) => ({ rank: idx + 1, name: id.slice(0, 8) + "…", total }));
  }, [runs]);

  const maxSolicitante = topSolicitantes[0]?.total ?? 1;
  const maxMotorista = topMotoristas[0]?.total ?? 1;

  const isLoading = isLoadingRuns || isLoadingMotoristas || isLoadingServidores;

  return (
    <div data-testid="dashboard-page" className="space-y-8">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t("page.title")}</h1>
        <p className="mt-1 text-sm text-neutral-500">{t("page.subtitle")}</p>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <div
        data-testid="dashboard-stats"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard
          data-testid="stat-servidores"
          icon={<Users className="h-5 w-5 text-brand-primary" aria-hidden="true" />}
          label={t("stats.totalServidores")}
          value={totalServidores}
          sub={`${totalServidoresAtivos} ${t("stats.ativos")}`}
          color="bg-brand-primary/10"
          loading={isLoadingServidores}
        />
        <StatCard
          data-testid="stat-motoristas"
          icon={<Truck className="h-5 w-5 text-success" aria-hidden="true" />}
          label={t("stats.totalMotoristas")}
          value={totalMotoristas}
          sub={`${totalMotoristasDisponiveis} ${t("stats.disponiveis")}`}
          color="bg-success/10"
          loading={isLoadingMotoristas}
        />
        <StatCard
          data-testid="stat-corridas"
          icon={<ClipboardList className="h-5 w-5 text-info" aria-hidden="true" />}
          label={t("stats.totalCorridas")}
          value={totalCorridas}
          color="bg-info/10"
          loading={isLoadingRuns}
        />
        <StatCard
          data-testid="stat-corridas-hoje"
          icon={<CalendarClock className="h-5 w-5 text-warning" aria-hidden="true" />}
          label={t("stats.corridasHoje")}
          value={corridasHoje}
          color="bg-warning/10"
          loading={isLoadingRuns}
        />
      </div>

      {/* ── Middle row: status chart + top solicitantes ───────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Corridas por status */}
        <section
          data-testid="dashboard-status-chart"
          aria-labelledby="status-chart-heading"
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <SectionHeader
            icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
            title={t("sections.corridasPorStatus")}
          />
          <div className="mt-5 space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 w-full animate-pulse rounded-lg bg-neutral-100" />
              ))
            ) : corridasPorStatus.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">{t("table.semDados")}</p>
            ) : (
              corridasPorStatus.map(({ status, count }) => (
                <StatusBar
                  key={status}
                  status={status}
                  count={count}
                  total={totalCorridas}
                  label={t(`status.${status}`, { defaultValue: status })}
                />
              ))
            )}
          </div>
        </section>

        {/* Top solicitantes */}
        <section
          data-testid="dashboard-top-solicitantes"
          aria-labelledby="top-solicitantes-heading"
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <SectionHeader
            icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />}
            title={t("sections.topSolicitantes")}
          />
          <div className="mt-5 divide-y divide-neutral-50">
            {isLoadingRuns ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-neutral-100 my-1" />
              ))
            ) : topSolicitantes.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">{t("table.semDados")}</p>
            ) : (
              topSolicitantes.map((item) => (
                <RankingRow
                  key={item.name}
                  rank={item.rank}
                  name={item.name}
                  value={item.total}
                  unit={t("table.corridas")}
                  maxValue={maxSolicitante}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Bottom row: top motoristas + avaliações ───────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Top motoristas por corridas */}
        <section
          data-testid="dashboard-top-motoristas"
          aria-labelledby="top-motoristas-heading"
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <SectionHeader
            icon={<Truck className="h-4 w-4" aria-hidden="true" />}
            title={t("sections.topMotoristas")}
          />
          <div className="mt-5 divide-y divide-neutral-50">
            {isLoadingRuns ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-neutral-100 my-1" />
              ))
            ) : topMotoristas.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">{t("table.semDados")}</p>
            ) : (
              topMotoristas.map((item) => (
                <RankingRow
                  key={item.name}
                  rank={item.rank}
                  name={item.name}
                  value={item.total}
                  unit={t("table.corridas")}
                  maxValue={maxMotorista}
                />
              ))
            )}
          </div>
        </section>

        {/* Top avaliações — API em produção */}
        <section
          data-testid="dashboard-top-avaliacoes"
          aria-labelledby="top-avaliacoes-heading"
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <SectionHeader
            icon={<Award className="h-4 w-4" aria-hidden="true" />}
            title={t("sections.topAvaliacoes")}
          />
          <div className="mt-5 flex flex-col items-center justify-center gap-3 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10">
              <Star className="h-7 w-7 text-warning" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-neutral-700">{t("rating.pending")}</p>
            <p className="max-w-[220px] text-center text-xs text-neutral-400">
              {t("rating.pendingDescription")}
            </p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" aria-hidden="true" />
              Em desenvolvimento
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
