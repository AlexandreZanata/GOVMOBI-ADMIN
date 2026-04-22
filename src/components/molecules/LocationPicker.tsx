"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { pesquisaFacade } from "@/facades/pesquisaFacade";
import type { GeocodingFeature } from "@/facades/pesquisaFacade";

export interface LocationValue {
  lat: number;
  lng: number;
  label: string;
}

export interface LocationPickerProps {
  label: string;
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
  error?: string;
  required?: boolean;
  "data-testid"?: string;
}

/**
 * Address search input backed by GET /pesquisa/geocoding.
 * Displays a dropdown of suggestions; on selection emits { lat, lng, label }.
 */
export function LocationPicker({
  label,
  value,
  onChange,
  error,
  required,
  "data-testid": testId,
}: LocationPickerProps): React.ReactElement {
  const { t } = useTranslation("runs");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (value) onChange(null); // clear selection when user types again

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim() || q.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const features = await pesquisaFacade.geocoding(q.trim());
        setResults(features);
        setOpen(features.length > 0);
      } catch {
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (feature: GeocodingFeature) => {
    const [lng, lat] = feature.center;
    onChange({ lat, lng, label: feature.place_name });
    setQuery(feature.place_name);
    setResults([]);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); }
  };

  const displayValue = value ? value.label : query;

  return (
    <div ref={containerRef} className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-neutral-900">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>

      <div className="relative">
        {/* Search icon */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.34-4.34" />
          <circle cx="11" cy="11" r="8" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          data-testid={testId}
          value={displayValue}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("dialogs.createRun.locationPlaceholder")}
          aria-required={required}
          aria-invalid={!!error}
          autoComplete="off"
          className={[
            "h-9 w-full rounded-lg border bg-neutral-50 pl-9 pr-8 text-sm text-neutral-900",
            "placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2",
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-neutral-200 focus:border-brand-primary focus:ring-brand-primary/20",
          ].join(" ")}
        />

        {/* Clear / loading indicator */}
        {loading ? (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 animate-spin text-neutral-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </span>
        ) : (value || query) ? (
          <button
            type="button"
            aria-label="Limpar"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}

        {/* Dropdown */}
        {open && results.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
          >
            {results.map((feature, idx) => (
              <li key={idx} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none"
                  onClick={() => handleSelect(feature)}
                >
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="line-clamp-2">{feature.place_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected coords chip */}
      {value && (
        <p className="text-xs text-neutral-400">
          {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      )}

      {error && (
        <p className="text-xs text-danger" role="alert">{error}</p>
      )}
    </div>
  );
}
