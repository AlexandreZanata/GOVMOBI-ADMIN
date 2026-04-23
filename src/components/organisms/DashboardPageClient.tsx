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

import { useMotoristas } from "@/hooks/motoristas/useMotoristas";
import { useServidores } from "@/hooks/servidores/useServidores";
import { useDashboardRuns, computeDashboardStats, computeTopMotoristasByRating } from "@/hooks/dashboard/useDashboardStats";
import { RunStatus } from "@/models";

// ─── Status color map ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  [RunStatus.SOLICITADA]:        { bg: "bg-warning/10",       text: "text-warning",       bar: "bg-warning" },
  [RunStatus.AGUARDANDO_ACEITE]: { bg: "bg-info/10",          text: "text-info",          bar: "bg-info" },
  [RunStatus.ACEITA]:            { bg: "bg-info/10",          text: "text-info",          bar: "bg-info" },
  [RunStatus.EM_ROTA]:           { bg: "bg-brand-primary/10", text: "text-brand-primary", bar: "bg-brand-primary" },
  [RunStatus.PASSAGEIRO_A_BORDO]: { bg: "bg-brand-primary/10", text: "text-brand-primary", bar: "bg-brand-primary" },
  [RunStatus.CONCLUIDA]:         { bg: "bg-success/10",       text: "text-success",       bar: "bg-success" },
  [RunStatus.AVALIADA]:          { bg: "bg-success/10",       text: "text-success",       bar: "bg-success" },
  [RunStatus.CANCELADA]:         { bg: "bg-danger/10",        text: "text-danger",        bar: "bg-danger" },
  [RunStatus.EXPIRADA]:          { bg: "bg-neutral-100",      text: "text-neutral-500",   bar: "bg-neutral-300" },
};

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

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  loading,
  "data-testid": testId,
}: StatCardProps) {
  return (
    <div
      data-testid={testId}
      className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-neutral-500">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-16 animate-pulse rounded-md bg-neutral-100" />
        ) : (
          <p className="mt-0.5 text-2xl font-bold tabular-nums text-neutral-900">
            {value}
          </p>
        )}
        {sub && !loading && (
          <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
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
            {value}{" "}
            <span className="font-normal text-neutral-400">{unit}</span>
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

// ─── Rating Ranking Row ───────────────────────────────────────────────────────

interface RatingRankingRowProps {
  rank: number;
  name: string;
  rating: number;
  totalAvaliacoes: number;
  maxRating?: number;
}

function RatingRankingRow({
  rank,
  name,
  rating,
  totalAvaliacoes,
  maxRating = 5,
}: RatingRankingRowProps) {
  const pct = maxRating > 0 ? Math.round((rating / maxRating) * 100) : 0;
  const isTop = rank === 1;

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span
        className={[
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isTop
            ? "bg-warning text-white"
            : "bg-neutral-100 text-neutral-500",
        ].join(" ")}
      >
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-neutral-800">{name}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-sm font-bold text-neutral-900">
              {rating.toFixed(1)}
            </span>
            <Star
              className="h-3.5 w-3.5 fill-warning text-warning"
              aria-hidden="true"
            />
            <span className="text-xs text-neutral-400">
              ({totalAvaliacoes})
            </span>
          </div>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-warning transition-all duration-500"
            style={{ width: `${pct}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Status Bar ───────────────────────────────────────────────────────────────

interface StatusBarProps {
  status: string;
  count: number;
  total: number;
  label: string;
}

function StatusBar({ status, count, total, label }: StatusBarProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colors = STATUS_COLORS[status] ?? {
    bg: "bg-neutral-100",
    text: "text-neutral-500",
    bar: "bg-neutral-300",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}
      >
        <span
          className={`h-2 w-2 rounded-full ${colors.bar}`}
          aria-hidden="true"
        />
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

// ─── Skeleton list ────────────────────────────────────────────────────────────

function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-10 w-full animate-pulse rounded-lg bg-neutral-100"
        />
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-6 text-center text-sm text-neutral-400">{message}</p>
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
  const { data: runs = [], isLoading: isLoadingRuns } = useDashboardRuns();
  const { data: motoristas = [], isLoading: isLoadingMotoristas } = useMotoristas();
  const { data: servidores = [], isLoading: isLoadingServidores } = useServidores();

  // ── Derived metrics ────────────────────────────────────────────────────────

  const totalServidores = servidores.length;
  const totalServidoresAtivos = servidores.filter((s) => s.ativo).length;

  const totalMotoristas = motoristas.length;
  const totalMotoristasDisponiveis =
    motoristas.filter(
      (m) => m.ativo && m.statusOperacional === "DISPONIVEL",
    ).length;

  const { corridasPorStatus, topSolicitantes, topMotoristas, corridasHoje } =
    useMemo(
      () => computeDashboardStats(runs, servidores, motoristas),
      [runs, servidores, motoristas],
    );

  const topMotoristasByRating = useMemo(
    () => computeTopMotoristasByRating(motoristas, servidores),
    [motoristas, servidores],
  );

  const totalCorridas = runs.length;
  const maxSolicitante = topSolicitantes[0]?.total ?? 1;
  const maxMotorista = topMotoristas[0]?.total ?? 1;

  return (
    <div data-testid="dashboard-page" className="space-y-8">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {t("page.title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{t("page.subtitle")}</p>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <div
        data-testid="dashboard-stats"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard
          data-testid="stat-servidores"
          icon={
            <Users
              className="h-5 w-5 text-brand-primary"
              aria-hidden="true"
            />
          }
          label={t("stats.totalServidores")}
          value={totalServidores}
          sub={`${totalServidoresAtivos} ${t("stats.ativos")}`}
          color="bg-brand-primary/10"
          loading={isLoadingServidores}
        />
        <StatCard
          data-testid="stat-motoristas"
          icon={
            <Truck className="h-5 w-5 text-success" aria-hidden="true" />
          }
          label={t("stats.totalMotoristas")}
          value={totalMotoristas}
          sub={`${totalMotoristasDisponiveis} ${t("stats.disponiveis")}`}
          color="bg-success/10"
          loading={isLoadingMotoristas}
        />
        <StatCard
          data-testid="stat-corridas"
          icon={
            <ClipboardList
              className="h-5 w-5 text-info"
              aria-hidden="true"
            />
          }
          label={t("stats.totalCorridas")}
          value={totalCorridas}
          color="bg-info/10"
          loading={isLoadingRuns}
        />
        <StatCard
          data-testid="stat-corridas-hoje"
          icon={
            <CalendarClock
              className="h-5 w-5 text-warning"
              aria-hidden="true"
            />
          }
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
          aria-label={t("sections.corridasPorStatus")}
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <SectionHeader
            icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
            title={t("sections.corridasPorStatus")}
          />
          <div className="mt-5 space-y-3">
            {isLoadingRuns ? (
              <SkeletonList rows={4} />
            ) : corridasPorStatus.length === 0 ? (
              <EmptyState message={t("table.semDados")} />
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
          aria-label={t("sections.topSolicitantes")}
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <SectionHeader
            icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />}
            title={t("sections.topSolicitantes")}
          />
          <div className="mt-5 divide-y divide-neutral-50">
            {isLoadingRuns ? (
              <SkeletonList rows={5} />
            ) : topSolicitantes.length === 0 ? (
              <EmptyState message={t("table.semDados")} />
            ) : (
              topSolicitantes.map((item) => (
                <RankingRow
                  key={item.id}
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
          aria-label={t("sections.topMotoristas")}
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <SectionHeader
            icon={<Truck className="h-4 w-4" aria-hidden="true" />}
            title={t("sections.topMotoristas")}
          />
          <div className="mt-5 divide-y divide-neutral-50">
            {isLoadingRuns ? (
              <SkeletonList rows={5} />
            ) : topMotoristas.length === 0 ? (
              <EmptyState message={t("table.semDados")} />
            ) : (
              topMotoristas.map((item) => (
                <RankingRow
                  key={item.id}
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

        {/* Top motoristas por avaliação */}
        <section
          data-testid="dashboard-top-avaliacoes"
          aria-label={t("sections.topAvaliacoes")}
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <SectionHeader
            icon={<Award className="h-4 w-4" aria-hidden="true" />}
            title={t("sections.topAvaliacoes")}
          />
          <div className="mt-5 divide-y divide-neutral-50">
            {isLoadingMotoristas ? (
              <SkeletonList rows={5} />
            ) : topMotoristasByRating.length === 0 ? (
              <EmptyState message={t("table.semDados")} />
            ) : (
              topMotoristasByRating.map((item) => (
                <RatingRankingRow
                  key={item.id}
                  rank={item.rank}
                  name={item.name}
                  rating={item.rating}
                  totalAvaliacoes={item.totalAvaliacoes}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
