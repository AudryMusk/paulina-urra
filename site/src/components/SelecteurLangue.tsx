"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function SelecteurLangue() {
  const t = useTranslations("entete");
  const locale = useLocale();
  const chemin = usePathname();
  return (
    <nav aria-label={t("langue")} className="hidden h-11 items-center gap-2.5 text-lg sm:flex">
      {routing.locales.map((langue) => (
        <Link
          key={langue}
          href={chemin}
          locale={langue}
          hrefLang={langue}
          aria-current={langue === locale ? "true" : undefined}
          className={langue === locale ? "font-semibold" : "text-muted transition-colors hover:text-red"}
        >
          {langue.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
