"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";

// Bouton menu et panneau déroulant sous l'en-tête, en dessous de 1024 px.
// Le contenu du panneau est rendu côté serveur par SiteHeader.
export function MenuMobile({ children }: { children: ReactNode }) {
  const t = useTranslations("entete");
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    const surGrandEcran = matchMedia("(min-width: 1024px)");
    const fermer = () => setOuvert(false);
    window.addEventListener("keydown", surTouche);
    surGrandEcran.addEventListener("change", fermer);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", surTouche);
      surGrandEcran.removeEventListener("change", fermer);
      document.body.style.overflow = "";
    };
  }, [ouvert]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-controls="menu-mobile"
        aria-label={ouvert ? t("fermerMenu") : t("ouvrirMenu")}
        className="-mr-2.5 flex size-11 items-center justify-center text-navy lg:hidden"
      >
        {ouvert ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
      </button>
      <div
        id="menu-mobile"
        hidden={!ouvert}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOuvert(false);
        }}
        className="absolute inset-x-0 top-full h-[calc(100dvh-100%)] animate-fondu overflow-y-auto border-t border-line bg-paper lg:hidden"
      >
        {children}
      </div>
    </>
  );
}
