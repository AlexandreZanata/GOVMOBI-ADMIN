"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";

import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms";
import type { Motorista } from "@/models/Motorista";
import { motoristasFacade } from "@/facades/motoristasFacade";

// Dynamically import map component to avoid SSR issues
const MapView = dynamic(() => import("./MotoristaLocationMap"), {
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

interface MotoristaPosition {
  lat: number;
  lng: number;
  atualizadoEm: string;
  corridaId: string;
  velocidade?: number;
  heading?: number;
}

interface RunDetails {
  passageiroNome: string;
  destino: string;
}

/**
 * Modal that displays the current location of a motorista on a map.
 * Uses Leaflet to render an interactive map with the driver's position.
 */
export function MotoristaLocationModal({
  open,
  onClose,
  motorista,
  "data-testid": testId,
}: MotoristaLocationModalProps) {
  const { t } = useTranslation("motoristas");
  const [position, setPosition] = useState<MotoristaPosition | null>(null);
  const [runDetails, setRunDetails] = useState<RunDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch motorista position and run details when modal opens
  useEffect(() => {
    if (!open || !motorista) {
      setPosition(null);
      setRunDetails(null);
      setError(null);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const pos = await motoristasFacade.getPosicaoMotorista(motorista.id);
        if (pos) {
          setPosition(pos);
          
          // Fetch run details
          const { fetchWithAuth } = await import("@/facades/authFacade");
          const { handleApiResponse } = await import("@/lib/handleApiResponse");
          const runResponse = await fetchWithAuth(`/api/proxy/corridas/${pos.corridaId}`);
          const runData = await handleApiResponse<any>(runResponse);
          
          setRunDetails({
            passageiroNome: runData.passageiro?.nome || "—",
            destino: runData.destino?.endereco || `${runData.destino?.lat.toFixed(6)}, ${runData.destino?.lng.toFixed(6)}`,
          });
        } else {
          setError(t("location.noPosition"));
        }
      } catch (err) {
        console.error("Failed to fetch motorista data:", err);
        setError(t("location.error"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [open, motorista, t]);

  if (!open) return null;

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
      ) : error ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <MapPin className="h-6 w-6 text-danger" />
            </div>
            <p className="text-sm font-medium text-neutral-900">{error}</p>
            <p className="text-xs text-neutral-500">
              {t("location.errorDescription")}
            </p>
          </div>
        </div>
      ) : position ? (
        <div className="space-y-4">
          {/* Map container */}
          <MapView position={position} driverName={motorista?.cnhNumero || ""} />

          {/* Run details */}
          {runDetails && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="text-xs font-semibold text-neutral-900">
                  {t("location.passenger")}
                </p>
                <p className="mt-0.5 text-sm text-neutral-400">
                  {runDetails.passageiroNome}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="text-xs font-semibold text-neutral-900">
                  {t("location.destination")}
                </p>
                <p className="mt-0.5 truncate text-sm text-neutral-400" title={runDetails.destino}>
                  {runDetails.destino}
                </p>
              </div>
            </div>
          )}

          {/* Position info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
              <p className="text-xs font-semibold text-neutral-900">
                {t("location.coordinates")}
              </p>
              <p className="mt-0.5 text-sm text-neutral-400">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
              <p className="text-xs font-semibold text-neutral-900">
                {t("location.lastUpdate")}
              </p>
              <p className="mt-0.5 text-sm text-neutral-400">
                {new Date(position.atualizadoEm).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Active run badge */}
          <div className="rounded-lg border border-info/20 bg-info/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-info/20">
                <svg className="h-3 w-3 text-info" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-900">
                  {t("location.activeRun")}
                </p>
                <p className="text-xs text-neutral-400">
                  ID: {position.corridaId.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
