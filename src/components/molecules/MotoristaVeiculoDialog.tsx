"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, Car } from "lucide-react";

import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { useAssociarVeiculo } from "@/hooks/motoristas/useAssociarVeiculo";
import { useDesassociarVeiculo } from "@/hooks/motoristas/useDesassociarVeiculo";
import { useVeiculos } from "@/hooks/veiculos/useVeiculos";
import type { Motorista } from "@/models/Motorista";
import type { Veiculo } from "@/models/Veiculo";

export interface MotoristaVeiculoDialogProps {
  open: boolean;
  onClose: () => void;
  motorista: Motorista;
  "data-testid"?: string;
}

/**
 * Dialog for associating or removing a vehicle from a motorista.
 * Features:
 * - Pre-selects the currently associated vehicle
 * - Searchable list filtered by placa or modelo
 * - Keyboard navigation (↑↓ Enter Escape)
 * POST /frota/motoristas/{id}/veiculo
 * DELETE /frota/motoristas/{id}/veiculo
 */
export function MotoristaVeiculoDialog({
  open,
  onClose,
  motorista,
  "data-testid": testId,
}: MotoristaVeiculoDialogProps): React.ReactElement | null {
  const { t } = useTranslation("motoristas");
  const { data: veiculos = [], isLoading } = useVeiculos();
  const associarMutation = useAssociarVeiculo();
  const desassociarMutation = useDesassociarVeiculo();

  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Selected vehicle — pre-populate with current association
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync pre-selection when motorista or veiculos list changes
  useEffect(() => {
    if (motorista.veiculoId && veiculos.length > 0) {
      const current = veiculos.find((v) => v.id === motorista.veiculoId) ?? null;
      setSelectedVeiculo(current);
    } else {
      setSelectedVeiculo(null);
    }
  }, [motorista.veiculoId, veiculos]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeVeiculos = veiculos.filter((v) => v.ativo);

  const candidates = activeVeiculos.filter((v) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      v.placa.toLowerCase().includes(q) ||
      v.modelo.toLowerCase().includes(q)
    );
  });

  const isPending = associarMutation.isPending || desassociarMutation.isPending;
  const hasCurrentVeiculo = !!motorista.veiculoId;
  const isDirty = selectedVeiculo?.id !== (motorista.veiculoId ?? undefined);

  const handleSelect = (v: Veiculo) => {
    setSelectedVeiculo(v);
    setQuery("");
    setDropdownOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    setSelectedVeiculo(null);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setDropdownOpen(true);
      return;
    }
    if (e.key === "Escape") { setDropdownOpen(false); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, candidates.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const v = candidates[activeIndex];
      if (v) handleSelect(v);
    }
  };

  const handleAssociar = async (): Promise<void> => {
    if (!selectedVeiculo) return;
    await associarMutation.mutateAsync(
      { motoristaId: motorista.id, veiculoId: selectedVeiculo.id },
      { onSuccess: onClose }
    );
  };

  const handleDesassociar = async (): Promise<void> => {
    await desassociarMutation.mutateAsync(
      { motoristaId: motorista.id },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("form.veiculo")}
      maxWidth="max-w-lg"
      data-testid={testId}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div>
            {hasCurrentVeiculo && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                data-testid={testId ? `${testId}-desassociar` : "motorista-veiculo-desassociar"}
                onClick={() => void handleDesassociar()}
                isLoading={desassociarMutation.isPending}
                disabled={isPending}
              >
                {t("actions.desassociarVeiculo")}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              {t("form.cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              data-testid={testId ? `${testId}-associar` : "motorista-veiculo-associar"}
              onClick={() => void handleAssociar()}
              isLoading={associarMutation.isPending}
              disabled={isPending || !selectedVeiculo || !isDirty}
            >
              {t("actions.associarVeiculo")}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Current vehicle info */}
        {hasCurrentVeiculo && motorista.veiculoId && (
          <div className="flex items-center gap-3 rounded-xl border border-brand-primary/20 bg-brand-primary/5 px-4 py-3">
            <Car className="h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              {selectedVeiculo ? (
                <>
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {selectedVeiculo.placa} — {selectedVeiculo.modelo} ({selectedVeiculo.ano})
                  </p>
                  <p className="text-xs text-neutral-500">{t("form.veiculoAtual")}</p>
                </>
              ) : (
                <p className="text-xs text-neutral-500">ID: {motorista.veiculoId}</p>
              )}
            </div>
          </div>
        )}

        {/* Searchable vehicle picker */}
        <div ref={containerRef} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">
            {t("form.selecionarVeiculo")}
          </label>

          {/* Selected chip */}
          {selectedVeiculo && !dropdownOpen ? (
            <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3">
              <div className="flex min-w-0 items-center gap-2">
                <Car className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
                <span className="truncate text-sm font-medium text-neutral-900">
                  {selectedVeiculo.placa} — {selectedVeiculo.modelo} ({selectedVeiculo.ano})
                </span>
              </div>
              <button
                type="button"
                aria-label="Remover seleção"
                onClick={handleClear}
                className="shrink-0 rounded p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={dropdownOpen}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
                data-testid={testId ? `${testId}-search` : "motorista-veiculo-search"}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true); setActiveIndex(-1); }}
                onFocus={() => setDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar por placa ou modelo..."
                className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                autoFocus
              />

              {dropdownOpen && (
                <ul
                  id={listboxId}
                  role="listbox"
                  aria-label={t("form.selecionarVeiculo")}
                  data-testid={testId ? `${testId}-listbox` : "motorista-veiculo-listbox"}
                  className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
                >
                  {isLoading ? (
                    <li className="px-4 py-3 text-sm text-neutral-400">Carregando...</li>
                  ) : candidates.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-neutral-400">Nenhum veículo encontrado.</li>
                  ) : (
                    candidates.map((v, i) => (
                      <li
                        key={v.id}
                        id={`${listboxId}-opt-${i}`}
                        role="option"
                        aria-selected={v.id === selectedVeiculo?.id}
                        data-testid={testId ? `${testId}-option-${v.id}` : `motorista-veiculo-option-${v.id}`}
                        onMouseDown={(e) => { e.preventDefault(); handleSelect(v); }}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={[
                          "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                          v.id === selectedVeiculo?.id
                            ? "bg-brand-primary/5 font-medium text-brand-primary"
                            : i === activeIndex
                              ? "bg-neutral-50 text-neutral-900"
                              : "text-neutral-900 hover:bg-neutral-50",
                        ].join(" ")}
                      >
                        <Car className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{v.placa}</p>
                          <p className="text-xs text-neutral-400">{v.modelo} · {v.ano}</p>
                        </div>
                        {v.id === motorista.veiculoId && (
                          <span className="shrink-0 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs text-brand-primary">
                            atual
                          </span>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
