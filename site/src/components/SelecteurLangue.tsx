"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const noms = { fr: "Français", en: "English", es: "Español" } as const;

// « court » : FR · EN · ES dans l'en-tête. « complet » : trois boutons pleine largeur pour le menu mobile.
export function SelecteurLangue({
  variante = "court",
  className = "hidden sm:flex",
}: {
  variante?: "court" | "complet";
  className?: string;
}) {
  const t = useTranslations("entete");
  const locale = useLocale();
  const chemin = usePathname();
  const complet = variante === "complet";
  return (
    <nav
      aria-label={t("langue")}
      className={complet ? `grid grid-cols-3 gap-2 ${className}` : `h-11 items-center gap-2.5 text-lg ${className}`}
    >
      {routing.locales.map((langue) => {
        const actif = langue === locale;
        return (
          <Link
            key={langue}
            href={chemin}
            locale={langue}
            hrefLang={langue}
            aria-current={actif ? "true" : undefined}
            className={
              complet
                ? `flex h-12 items-center justify-center border text-base transition-colors ${actif ? "border-navy bg-navy font-semibold text-white" : "border-line hover:border-navy"}`
                : actif
                  ? "font-semibold"
                  : "text-muted transition-colors hover:text-red"
            }
          >
            {complet ? noms[langue] : langue.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
