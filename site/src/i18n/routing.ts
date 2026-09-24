import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "es"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

export const langueHtml = { fr: "fr-CA", en: "en-CA", es: "es" } as const;
