/**
 * Minimal react-i18next mock for unit tests.
 * Returns the i18n key as the translated string so assertions are predictable.
 */
import { vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: (ns?: string) => ({
    t: (key: string) => {
      // Return "namespace:key" when namespace is provided, else just "key"
      return ns ? `${ns}:${key}` : key;
    },
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: "3rdParty", init: vi.fn() },
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));
