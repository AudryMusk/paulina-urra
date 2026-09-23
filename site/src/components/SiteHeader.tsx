import Link from "next/link";
import { Logo } from "./Logo";
import { wrap } from "./ui";

const liens = [
  { label: "Vendre", href: "#services" },
  { label: "Acheter", href: "#services" },
  { label: "Commercial", href: "#services" },
  { label: "Propriétés", href: "#proprietes" },
  { label: "L'équipe", href: "#equipe" },
];

export function SiteHeader({ avecProprietes }: { avecProprietes: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className={`${wrap} flex items-center justify-between gap-3 py-[22px] sm:gap-6`}>
        <Logo />
        <nav aria-label="Navigation principale" className="hidden gap-[22px] lg:flex">
          {liens
            .filter((lien) => avecProprietes || lien.href !== "#proprietes")
            .map((lien) => (
              <a
                key={lien.label}
                href={lien.href}
                className="relative text-lg transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-red after:transition-transform after:duration-300 hover:text-red hover:after:scale-x-100"
              >
                {lien.label}
              </a>
            ))}
        </nav>
        <div className="flex items-center gap-5">
          <div className="hidden h-11 items-center gap-2.5 text-lg sm:flex" aria-label="Langue">
            <span className="font-semibold" aria-current="true">
              FR
            </span>
            <span className="text-muted" title="Bientôt disponible">
              EN
            </span>
          </div>
          <Link
            href="/evaluation"
            className="bg-red px-3.5 py-3 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-navy sm:px-5 sm:text-lg"
          >
            Évaluation gratuite
          </Link>
        </div>
      </div>
    </header>
  );
}
