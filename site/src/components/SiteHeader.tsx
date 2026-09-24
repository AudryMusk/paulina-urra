import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { SelecteurLangue } from "./SelecteurLangue";
import { wrap } from "./ui";

const liens = [
  { cle: "vendre", href: "#services" },
  { cle: "acheter", href: "#services" },
  { cle: "commercial", href: "#services" },
  { cle: "proprietes", href: "#proprietes" },
  { cle: "equipe", href: "#equipe" },
] as const;

export function SiteHeader({ avecProprietes }: { avecProprietes: boolean }) {
  const t = useTranslations("entete");
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className={`${wrap} flex items-center justify-between gap-3 py-[22px] sm:gap-6`}>
        <Logo />
        <nav aria-label={t("navigation")} className="hidden gap-[22px] lg:flex">
          {liens
            .filter((lien) => avecProprietes || lien.href !== "#proprietes")
            .map((lien) => (
              <a
                key={lien.cle}
                href={lien.href}
                className="relative text-lg transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-red after:transition-transform after:duration-300 hover:text-red hover:after:scale-x-100"
              >
                {t(lien.cle)}
              </a>
            ))}
        </nav>
        <div className="flex items-center gap-5">
          <SelecteurLangue />
          <Link
            href="/evaluation"
            className="bg-red px-3.5 py-3 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-navy sm:px-5 sm:text-lg"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </header>
  );
}
