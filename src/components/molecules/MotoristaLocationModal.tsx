"use client";

import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";

import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms";
import type { Motorista } from "@/models/Motorista";
import { useMotoristaLocation } from "@/hooks/motoristas/useMotoristaLocation";

interface MapViewProps {
  position: { lat: number; lng: number; atualizadoEm: string };
  driverName: string;
}

// Dynamically import map component to avoid SSR issues
const MapView = dynamic<MapViewProps>(() => import("@/components/molecules/MotoristaLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
    </div>
  ),
});

export interface MotoristaLocationModalProps {
  open: boolean;
  onClose: () => void;
  motorista: Motorista | undefined;
  "data-testid"?: string;
}

/**
 * Modal that displays the real-time location of a motorista on a map.
 * Uses the /despacho WebSocket (buscar-posicao-motorista) with comEndereco=true
 * to get live position + human-readable address in a single round-trip.
 */
export function MotoristaLocationModal({
  open,
  onClose,
  motorista,
  "data-testid": testId,
}: MotoristaLocationModalProps) {
  const { t } = useTranslation("motoristas");

  const { data: position, isLoading, error } = useMotoristaLocation(
    motorista?.id,
    open
  );

  if (!open) return null;

  const hasPosition = !!position;
  const noPosition = !isLoading && (error === "no_position" || (!position && !error));
  const hasError = !!error && error !== "no_position";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("location.title")}
      subtitle={motorista ? t("location.subtitle", { cnh: motorista.cnhNumero }) : undefined}
      maxWidth="max-w-3xl"
      data-testid={testId}
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("location.close")}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            <p className="text-sm text-neutral-500">{t("location.loading")}</p>
          </div>
        </div>
      ) : hasError ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <MapPin className="h-6 w-6 text-danger" />
            </div>
            <p className="text-sm font-medium text-neutral-900">{t("location.error")}</p>
            <p className="text-xs text-neutral-500">{t("location.errorDescription")}</p>
          </div>
        </div>
      ) : noPosition ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <MapPin className="h-6 w-6 text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-900">{t("location.noPosition")}</p>
            <p className="text-xs text-neutral-500">{t("location.noPositionDescription")}</p>
          </div>
        </div>
      ) : hasPosition ? (
        <div className="space-y-4">
          {/* Map */}
          <MapView
            position={{ lat: position.lat, lng: position.lng, atualizadoEm: position.ultimaAtualizacaoMs ? new Date(position.ultimaAtualizacaoMs).toISOString() : new Date().toISOString() }}
            driverName={motorista?.cnhNumero ?? ""}
          />

          {/* Address + run info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
              <p className="text-xs font-semibold text-neutral-900">
                {t("location.address")}
              </p>
              <p className="mt-0.5 text-sm text-neutral-400" title={position.endereco ?? undefined}>
                {position.endereco ?? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
              <p className="text-xs font-semibold text-neutral-900">
                {t("location.coordinates")}
              </p>
              <p className="mt-0.5 text-sm text-neutral-400">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Last update + active run */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
              <p className="text-xs font-semibold text-neutral-900">
                {t("location.lastUpdate")}
              </p>
              <p className="mt-0.5 text-sm text-neutral-400">
                {position.ultimaAtualizacaoMs
                  ? new Date(position.ultimaAtualizacaoMs).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
              <p className="text-xs font-semibold text-neutral-900">
                {t("location.operationalStatus")}
              </p>
              <p className="mt-0.5 text-sm text-neutral-400">
                {t(`location.opStatus.${position.status}`)}
              </p>
            </div>
          </div>

          {/* Active run badge */}
          {position.corridaId && (
            <div className="rounded-lg border border-info/20 bg-info/5 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-info/20">
                  <svg className="h-3 w-3 text-info" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-900">
                    {t("location.activeRun")}
                  </p>
                  <p className="break-all text-xs text-neutral-400">
                    {position.corridaId}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
