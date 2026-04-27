"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

/** Minimal inline SVG flags — no emoji, consistent rendering across all OS/browsers */
function FlagBR({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-hidden="true" fill="none">
      <rect width="20" height="14" rx="2" fill="#009C3B" />
      <polygon points="10,1.5 18.5,7 10,12.5 1.5,7" fill="#FEDF00" />
      <circle cx="10" cy="7" r="3.2" fill="#002776" />
      <path d="M7 7.4 Q10 5.8 13 7.4" stroke="white" strokeWidth="0.7" fill="none" />
    </svg>
  );
}

function FlagUS({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-hidden="true">
      <rect width="20" height="14" rx="2" fill="#B22234" />
      {[0,2,4,6,8,10,12].map((y) => (
        <rect key={y} x="0" y={y} width="20" height="1" fill="white" />
      ))}
      <rect width="8" height="7" rx="0" fill="#3C3B6E" />
    </svg>
  );
}

const LANGUAGES = [
  { code: "pt-BR" as const, Flag: FlagBR, label: "PT", fullLabel: "Português" },
  { code: "en" as const,    Flag: FlagUS, label: "EN", fullLabel: "English" },
];

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeLang = (i18n.resolvedLanguage ?? i18n.language).toLowerCase();
  const active = LANGUAGES.find((l) => activeLang.startsWith(l.code.split("-")[0])) ?? LANGUAGES[0];

  const handleSelect = (code: "pt-BR" | "en") => {
    void i18n.changeLanguage(code);
    if (typeof window !== "undefined") localStorage.setItem("govmobile.language", code);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" data-testid="language-switcher">
      <button
        type="button"
        aria-label={t("language.groupLabel")}
        aria-haspopup="listbox"
        aria-expanded={open}
        data-testid="language-switcher-trigger"
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex h-8 items-center gap-1.5 rounded-md px-2",
          "border border-neutral-200 bg-white shadow-sm text-xs font-medium text-neutral-700",
          "transition-colors hover:bg-neutral-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
        ].join(" ")}
      >
        <active.Flag className="h-3.5 w-5 rounded-[2px]" />
        <span>{active.label}</span>
        <svg className={["h-3 w-3 text-neutral-400 transition-transform", open ? "rotate-180" : ""].join(" ")} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language.groupLabel")}
          data-testid="language-switcher-dropdown"
          className="absolute right-0 top-full z-50 mt-1 min-w-[9rem] rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = active.code === lang.code;
            return (
              <li key={lang.code} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  data-testid={`language-option-${lang.code}`}
                  onClick={() => handleSelect(lang.code)}
                  className={[
                    "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-neutral-50",
                    isSelected ? "font-medium text-brand-primary" : "text-neutral-700",
                  ].join(" ")}
                >
                  <lang.Flag className="h-3.5 w-5 shrink-0 rounded-[2px]" />
                  <span>{lang.fullLabel}</span>
                  {isSelected && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-primary" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
