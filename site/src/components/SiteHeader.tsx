import { useTranslations } from "next-intl";
import { Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { courtiers, telLink } from "@/lib/content";
import { Logo } from "./Logo";
import { MenuMobile } from "./MenuMobile";
import { SelecteurLangue } from "./SelecteurLangue";
import { wrap } from "./ui";

const liens = [
  { cle: "vendre", href: "#vendre" },
  { cle: "acheter", href: "#acheter" },
  { cle: "commercial", href: "#commercial" },
  { cle: "proprietes", href: "#proprietes" },
  { cle: "equipe", href: "#equipe" },
] as const;

export function SiteHeader({ avecProprietes }: { avecProprietes: boolean }) {
  const t = useTranslations("entete");
  const liensVisibles = liens.filter((lien) => avecProprietes || lien.href !== "#proprietes");
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className={`${wrap} flex items-center justify-between gap-3 py-[22px] sm:gap-6`}>
        <Logo />
        <nav aria-label={t("navigation")} className="hidden gap-[22px] lg:flex">
          {liensVisibles.map((lien) => (
            <a
              key={lien.cle}
              href={lien.href}
              className="relative text-lg transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-red after:transition-transform after:duration-300 hover:text-red hover:after:scale-x-100"
            >
              {t(lien.cle)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-5">
          <SelecteurLangue />
          <Link
            href="/evaluation"
            className="bg-red px-3.5 py-3 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-navy sm:px-5 sm:text-lg"
          >
            <span className="sm:hidden">{t("ctaCourt")}</span>
            <span className="hidden sm:inline">{t("cta")}</span>
          </Link>
          <MenuMobile>
            <div className={`${wrap} flex flex-col gap-9 py-8`}>
              <nav aria-label={t("navigation")} className="flex flex-col">
                {liensVisibles.map((lien) => (
                  <a key={lien.cle} href={lien.href} className="border-b border-line py-4 font-serif text-3xl">
                    {t(lien.cle)}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium tracking-[0.16em] text-muted uppercase">{t("langue")}</p>
                <SelecteurLangue variante="complet" className="" />
              </div>
              <div className="flex flex-col gap-3">
                {courtiers.map((courtier) => (
                  <a key={courtier.cle} href={telLink(courtier.telephone)} className="flex items-center gap-3 text-lg">
                    <Phone className="size-4 text-blue" aria-hidden />
                    {courtier.prenom} · {courtier.telephone}
                  </a>
                ))}
              </div>
              <Link
                href="/evaluation"
                className="bg-red py-4 text-center text-lg font-semibold text-white transition-colors hover:bg-navy"
              >
                {t("cta")}
              </Link>
            </div>
          </MenuMobile>
        </div>
      </div>
    </header>
  );
}
