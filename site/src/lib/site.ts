import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { langueHtml, routing } from "@/i18n/routing";

// Adresse publique du site : SITE_URL si défini, sinon le domaine de production fourni par Vercel.
export function adresseSite() {
  const brute = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "localhost:3000";
  if (/^https?:\/\//.test(brute)) return brute;
  return `${brute.startsWith("localhost") ? "http" : "https"}://${brute}`;
}

export type PagePublique = "/" | "/evaluation";

export const cheminLocalise = (href: PagePublique, locale: Locale) => getPathname({ href, locale });

// Versions de la page dans chaque langue, pour les balises hreflang et le sitemap.
export function versionsLangues(href: PagePublique): Record<string, string> {
  return Object.fromEntries([
    ...routing.locales.map((locale) => [langueHtml[locale], cheminLocalise(href, locale)]),
    ["x-default", cheminLocalise(href, routing.defaultLocale)],
  ]);
}

// Titre, description, adresse canonique et aperçu de partage (Facebook, WhatsApp…) d'une page publique.
export function metadonneesPage(page: PagePublique, locale: Locale, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: cheminLocalise(page, locale), languages: versionsLangues(page) },
    openGraph: {
      type: "website",
      siteName: "Équipe Urra-Rauda",
      locale: langueHtml[locale].replace("-", "_"),
      url: cheminLocalise(page, locale),
      title,
      description,
      images: [{ url: "/images/apercu-partage.jpg", width: 1200, height: 630, alt: "Paulina Urra · Denis Rauda Hernandez" }],
    },
    twitter: { card: "summary_large_image" },
  };
}
