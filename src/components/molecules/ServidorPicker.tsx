"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, User } from "lucide-react";

import { useServidores } from "@/hooks/servidores/useServidores";
import type { Servidor } from "@/models/Servidor";

export interface ServidorPickerProps {
  /** Current selected servidor ID. */
  value: string;
  /** Called with the selected servidor's UUID when a selection is made. */
  onChange: (id: string) => void;
  /** Field label. */
  label: string;
  /** Validation error message. */
  error?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Test selector prefix. */
  "data-testid"?: string;
  /** Whether to show only active servidores (default: true). */
  onlyAtivo?: boolean;
}

/**
 * Searchable servidor picker.
 * Fetches the full servidor list and filters client-side by nome or CPF.
 * Emits the selected servidor's UUID via onChange.
 */
export function ServidorPicker({
  value,
  onChange,
  label,
  error,
  required,
  "data-testid": testId,
  onlyAtivo = true,
}: ServidorPickerProps) {
  const { t } = useTranslation("common");
  const inputId = useId();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: servidores = [], isLoading } = useServidores();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Derive the display label from the current value
  const selectedServidor = servidores.find((s) => s.id === value);

  // Filter list
  const candidates = servidores.filter((s) => {
    if (onlyAtivo && !s.ativo) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      s.nome.toLowerCase().includes(q) ||
      s.cpf.replace(/\D/g, "").includes(q.replace(/\D/g, ""))
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (servidor: Servidor) => {
    onChange(servidor.id);
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, candidates.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const s = candidates[activeIndex];
      if (s) handleSelect(s);
    }
  };

  const formatCpf = (cpf: string) => {
    const d = cpf.replace(/\D/g, "");
    if (d.length !== 11) return cpf;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const hasValue = !!value && !!selectedServidor;

  return (
    <div ref={containerRef} className="flex flex-col gap-1">
      {/* Label */}
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-neutral-700"
      >
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>

      {/* Selected chip or search input */}
      {hasValue ? (
        <div
          data-testid={testId ? `${testId}-selected` : "servidor-picker-selected"}
          className={[
            "flex h-10 items-center justify-between gap-2 rounded-lg border px-3",
            error ? "border-danger" : "border-neutral-200 bg-neutral-50",
          ].join(" ")}
        >
          <div className="flex min-w-0 items-center gap-2">
            <User className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
            <span className="truncate text-sm font-medium text-neutral-900">
              {selectedServidor.nome}
            </span>
            <span className="shrink-0 text-xs text-neutral-400">
              {formatCpf(selectedServidor.cpf)}
            </span>
          </div>
          <button
            type="button"
            data-testid={testId ? `${testId}-clear` : "servidor-picker-clear"}
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
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
            data-testid={testId ? `${testId}-input` : "servidor-picker-input"}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nome ou CPF..."
            aria-required={required}
            className={[
              "h-10 w-full rounded-lg border pl-9 pr-3 text-sm text-neutral-900",
              "placeholder:text-neutral-400",
              "focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
              error
                ? "border-danger focus:border-danger"
                : "border-neutral-200 bg-neutral-50 focus:border-brand-primary",
            ].join(" ")}
          />

          {/* Dropdown */}
          {open && (
            <ul
              id={listboxId}
              role="listbox"
              aria-label={label}
              data-testid={testId ? `${testId}-listbox` : "servidor-picker-listbox"}
              className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
            >
              {isLoading ? (
                <li className="px-4 py-3 text-sm text-neutral-400">Carregando...</li>
              ) : candidates.length === 0 ? (
                <li className="px-4 py-3 text-sm text-neutral-400">
                  Nenhum servidor encontrado.
                </li>
              ) : (
                candidates.map((s, i) => (
                  <li
                    key={s.id}
                    id={`${listboxId}-option-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    data-testid={testId ? `${testId}-option-${s.id}` : `servidor-picker-option-${s.id}`}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={[
                      "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                      i === activeIndex
                        ? "bg-brand-primary/5 text-brand-primary"
                        : "text-neutral-900 hover:bg-neutral-50",
                    ].join(" ")}
                  >
                    <User className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{s.nome}</p>
                      <p className="text-xs text-neutral-400">{formatCpf(s.cpf)}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
