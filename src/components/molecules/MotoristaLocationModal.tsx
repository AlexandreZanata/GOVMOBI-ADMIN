"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, X, Loader2 } from "lucide-react";

import { Button } from "@/components/atoms";
import type { Motorista } from "@/models/Motorista";
import { motoristasFacade } from "@/facades/motoristasFacade";

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

/**
 * Modal that displays the current location of a motorista on a map.
 * Uses Mapbox GL JS to render an interactive map with the driver's position.
 */
export function MotoristaLocationModal({
  open,
  onClose,
  motorista,
  "data-testid": testId,
}: MotoristaLocationModalProps) {
  const { t } = useTranslation("motoristas");
  const [position, setPosition] = useState<MotoristaPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Fetch Mapbox token on mount
  useEffect(() => {
    async function fetchMapboxToken() {
      try {
        const { fetchWithAuth } = await import("@/facades/authFacade");
        const response = await fetchWithAuth("/api/proxy/pesquisa/config");
        if (response.ok) {
          const data = await response.json();
          setMapboxToken(data.data?.mapboxToken || data.mapboxToken || null);
        }
      } catch (err) {
        console.error("Failed to fetch Mapbox token:", err);
      }
    }
    fetchMapboxToken();
  }, []);

  // Fetch motorista position when modal opens
  useEffect(() => {
    if (!open || !motorista) {
      setPosition(null);
      setError(null);
      return;
    }

    async function fetchPosition() {
      setIsLoading(true);
      setError(null);
      try {
        const pos = await motoristasFacade.getPosicaoMotorista(motorista.id);
        if (pos) {
          setPosition(pos);
        } else {
          setError(t("location.noPosition"));
        }
      } catch (err) {
        console.error("Failed to fetch motorista position:", err);
        setError(t("location.error"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosition();
  }, [open, motorista, t]);

  // Initialize map when position and token are available
  useEffect(() => {
    if (!open || !position || !mapboxToken) return;

    let map: any = null;
    let mapInitialized = false;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Dynamically import Mapbox GL JS
      import("mapbox-gl").then((mapboxgl) => {
        try {
          const container = document.getElementById("motorista-location-map");
          if (!container) {
            console.warn("Map container not found");
            return;
          }

          mapboxgl.default.accessToken = mapboxToken;

          map = new mapboxgl.default.Map({
            container: "motorista-location-map",
            style: "mapbox://styles/mapbox/streets-v12",
            center: [position.lng, position.lat],
            zoom: 15,
            preserveDrawingBuffer: true,
          });

          mapInitialized = true;

          // Add marker for motorista position
          new mapboxgl.default.Marker({ color: "#3B82F6" })
            .setLngLat([position.lng, position.lat])
            .setPopup(
              new mapboxgl.default.Popup({ offset: 25 }).setHTML(
                `<div style="padding: 8px;">
                  <p style="margin: 0; font-weight: 600; font-size: 14px;">${t("location.driverPosition")}</p>
                  <p style="margin: 4px 0 0; font-size: 12px; color: #6B7280;">
                    ${new Date(position.atualizadoEm).toLocaleString()}
                  </p>
                </div>`
              )
            )
            .addTo(map);

          // Add navigation controls
          map.addControl(new mapboxgl.default.NavigationControl(), "top-right");
        } catch (error) {
          console.error("Failed to initialize map:", error);
          // Don't set error state - just log it and show position data without map
        }
      }).catch((error) => {
        console.error("Failed to load Mapbox GL:", error);
        // Don't set error state - just log it and show position data without map
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (map && mapInitialized) {
        try {
          map.remove();
        } catch (e) {
          console.warn("Error removing map:", e);
        }
      }
    };
  }, [open, position, mapboxToken, t]);

  if (!open) return null;

  return (
    <div
      data-testid={testId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="motorista-location-title"
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
              <MapPin className="h-5 w-5 text-brand-primary" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="motorista-location-title"
                className="text-lg font-semibold text-neutral-900"
              >
                {t("location.title")}
              </h2>
              {motorista && (
                <p className="text-sm text-neutral-500">
                  {t("location.subtitle", { cnh: motorista.cnhNumero })}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("location.close")}
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <p className="text-sm text-neutral-500">{t("location.loading")}</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-96 items-center justify-center">
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
          ) : position && mapboxToken ? (
            <div className="space-y-4">
              {/* Map container */}
              <div
                id="motorista-location-map"
                className="h-96 w-full rounded-xl border border-neutral-200 shadow-sm"
                style={{ minHeight: "384px" }}
              />

              {/* Position info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10">
                      <MapPin className="h-4 w-4 text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">
                        {t("location.coordinates")}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-neutral-900">
                      {t("location.lastUpdate")}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {new Date(position.atualizadoEm).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Speed and heading info */}
                {(position.velocidade !== undefined || position.heading !== undefined) && (
                  <div className="grid grid-cols-2 gap-3">
                    {position.velocidade !== undefined && (
                      <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                        <p className="text-xs font-semibold text-neutral-900">
                          {t("location.speed")}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {position.velocidade.toFixed(1)} km/h
                        </p>
                      </div>
                    )}
                    {position.heading !== undefined && (
                      <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                        <p className="text-xs font-semibold text-neutral-900">
                          {t("location.heading")}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {position.heading.toFixed(0)}°
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Active run info */}
                <div className="rounded-lg border border-info/20 bg-info/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-info/20">
                      <svg className="h-3.5 w-3.5 text-info" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
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
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <p className="text-sm text-neutral-500">{t("location.loadingMap")}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("location.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
