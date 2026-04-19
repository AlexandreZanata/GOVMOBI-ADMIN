"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEN from "./locales/en/common.json";
import runsEN from "./locales/en/runs.json";
import authEN from "./locales/en/auth.json";
import usersEN from "./locales/en/users.json";
import navEN from "./locales/en/nav.json";
import cargosEN from "./locales/en/cargos.json";
import lotacoesEN from "./locales/en/lotacoes.json";
import departmentsEN from "./locales/en/departments.json";
import auditEN from "./locales/en/audit.json";
import motoristasEN from "./locales/en/motoristas.json";
import servidoresEN from "./locales/en/servidores.json";
import veiculosEN from "./locales/en/veiculos.json";

import commonPTBR from "./locales/pt-BR/common.json";
import runsPTBR from "./locales/pt-BR/runs.json";
import authPTBR from "./locales/pt-BR/auth.json";
import usersPTBR from "./locales/pt-BR/users.json";
import navPTBR from "./locales/pt-BR/nav.json";
import cargosPTBR from "./locales/pt-BR/cargos.json";
import lotacoesPTBR from "./locales/pt-BR/lotacoes.json";
import departmentsPTBR from "./locales/pt-BR/departments.json";
import auditPTBR from "./locales/pt-BR/audit.json";
import motoristasPTBR from "./locales/pt-BR/motoristas.json";
import servidoresPTBR from "./locales/pt-BR/servidores.json";
import veiculosPTBR from "./locales/pt-BR/veiculos.json";

/** Available i18n languages in the admin panel. */
export const SUPPORTED_LANGUAGES = ["pt-BR", "en"] as const;

/** Type-safe language options accepted by i18next config. */
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Resolves the initial language from browser preferences.
 * Falls back to Brazilian Portuguese when no supported locale is detected.
 *
 * @returns Resolved language key for i18next initialization
 */
export function resolveInitialLanguage(): SupportedLanguage {
  if (typeof window !== "undefined") {
    const storedLanguage = localStorage.getItem("govmobile.language");
    if (storedLanguage === "pt-BR" || storedLanguage === "en") {
      return storedLanguage;
    }
  }

  if (typeof navigator === "undefined") {
    return "pt-BR";
  }

  const preferred = [...navigator.languages, navigator.language]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());

  const hasPortuguese = preferred.some(
    (value) => value === "pt-br" || value.startsWith("pt")
  );
  if (hasPortuguese) {
    return "pt-BR";
  }

  const hasEnglish = preferred.some(
    (value) => value === "en-us" || value.startsWith("en")
  );
  if (hasEnglish) {
    return "en";
  }

  return "pt-BR";
}

/**
 * i18next configuration for GovMobile Admin Panel.
 * Namespaces: common | runs | auth | users | nav | cargos | lotacoes | departments | audit
 */
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: resolveInitialLanguage(),
    fallbackLng: "pt-BR",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    ns: [
      "common",
      "runs",
      "auth",
      "users",
      "nav",
      "cargos",
      "lotacoes",
      "departments",
      "audit",
      "motoristas",
      "servidores",
      "veiculos"
    ],
    defaultNS: "common",
    resources: {
      en: {
        common: commonEN,
        runs: runsEN,
        auth: authEN,
        users: usersEN,
        nav: navEN,
        cargos: cargosEN,
        lotacoes: lotacoesEN,
        departments: departmentsEN,
        audit: auditEN,
        motoristas: motoristasEN,
        servidores: servidoresEN,
        veiculos: veiculosEN,
      },
      "pt-BR": {
        common: commonPTBR,
        runs: runsPTBR,
        auth: authPTBR,
        users: usersPTBR,
        nav: navPTBR,
        cargos: cargosPTBR,
        lotacoes: lotacoesPTBR,
        departments: departmentsPTBR,
        audit: auditPTBR,
        motoristas: motoristasPTBR,
        servidores: servidoresPTBR,
        veiculos: veiculosPTBR,
      },
    },
    interpolation: { escapeValue: false },
  });
}

export default i18n;
