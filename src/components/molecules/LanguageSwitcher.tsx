"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

const LANGUAGES = [
  { code: "pt-BR" as const, flag: "🇧🇷", label: "PT" },
  { code: "en" as const, flag: "🇺🇸", label: "US" },
];

/**
 * Compact language switcher for the admin header.
 * Shows the active language flag; clicking opens a dropdown to switch.
 *
 * @returns Language switcher button with dropdown
 */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeLang = (i18n.resolvedLanguage ?? i18n.language).toLowerCase();
  const active = LANGUAGES.find((l) => activeLang.startsWith(l.code.split("-")[0])) ?? LANGUAGES[0];

  const handleSelect = (code: "pt-BR" | "en") => {
    void i18n.changeLanguage(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("govmobile.language", code);
    }
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-base",
          "border border-neutral-200 bg-white shadow-sm",
          "transition-colors hover:bg-neutral-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
        ].join(" ")}
      >
        <span aria-hidden="true">{active.flag}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language.groupLabel")}
          data-testid="language-switcher-dropdown"
          className={[
            "absolute right-0 top-full z-50 mt-1 min-w-[8rem]",
            "rounded-md border border-neutral-200 bg-white py-1 shadow-lg",
          ].join(" ")}
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
                    "flex w-full items-center gap-2 px-3 py-2 text-sm",
                    "transition-colors hover:bg-neutral-100",
                    isSelected
                      ? "font-semibold text-brand-primary"
                      : "text-neutral-700",
                  ].join(" ")}
                >
                  <span aria-hidden="true" className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
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
