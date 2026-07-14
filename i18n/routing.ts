import { defineRouting } from "next-intl/routing";

/**
 * Locale routing for FOBS SMS.
 * Cameroon is bilingual (English + French) — both are first-class, English default.
 * Locale is carried in the URL (`/en`, `/fr`) so marketing pages are independently indexable.
 */
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
