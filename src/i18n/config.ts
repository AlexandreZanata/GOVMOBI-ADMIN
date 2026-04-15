"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEN from "./locales/en/common.json";
import runsEN from "./locales/en/runs.json";
import authEN from "./locales/en/auth.json";
import usersEN from "./locales/en/users.json";

/**
 * i18next configuration for GovMobile Admin Panel.
 * Namespaces: common | runs | auth | users
 */
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    ns: ["common", "runs", "auth", "users"],
    defaultNS: "common",
    resources: {
      en: {
        common: commonEN,
        runs: runsEN,
        auth: authEN,
        users: usersEN,
      },
    },
    interpolation: { escapeValue: false },
  });
}

export default i18n;
