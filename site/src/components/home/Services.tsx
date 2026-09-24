import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "../Reveal";
import { SectionHeader, wrap } from "../ui";

const services = [
  { cle: "vendre", href: "/evaluation" },
  { cle: "acheter", href: "#equipe" },
  { cle: "commercial", href: "#equipe", nouveau: true },
  { cle: "evaluer", href: "/evaluation" },
] as const;

function Lien({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  return href.startsWith("#") ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function Services() {
  const t = useTranslations("services");
  return (
    <section id="services" className="scroll-mt-24 bg-paper">
      <div className={`${wrap} flex flex-col gap-10 py-20`}>
        <Reveal depuis="haut">
          <SectionHeader label={t("label")} title={t("titre")} intro={t("intro")} />
        </Reveal>
        <ul className="flex flex-col">
          {services.map((service, i) => {
            const vedette = i === 0;
            return (
              <li key={service.cle}>
                <Reveal delai={i * 90}>
                  <Lien
                    href={service.href}
                    className={`group flex flex-col gap-4 border-b border-line px-4 py-8 transition-colors duration-300 md:flex-row md:items-center md:gap-10 md:px-8 md:py-9 ${vedette ? "bg-mist" : "hover:bg-mist"}`}
                  >
                    <span className={`w-10 shrink-0 text-base font-semibold ${vedette ? "text-red" : "text-muted"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex shrink-0 flex-col gap-1.5 transition-transform duration-500 ease-doux group-hover:translate-x-2 md:w-[360px]">
                      <span className="flex items-center gap-3">
                        <span className="font-serif text-4xl">{t(`${service.cle}.titre`)}</span>
                        {"nouveau" in service && (
                          <span className="bg-blue px-2.5 py-1.5 text-base font-bold text-white">{t("nouveau")}</span>
                        )}
                      </span>
                      <span className="text-lg text-muted">{t(`${service.cle}.sousTitre`)}</span>
                    </span>
                    <span className="flex-1 text-xl leading-relaxed text-muted">{t(`${service.cle}.texte`)}</span>
                    <span
                      className={`flex size-12 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${vedette ? "bg-red text-white group-hover:bg-navy" : "border border-line text-ink group-hover:border-red group-hover:bg-red group-hover:text-white"}`}
                      aria-hidden
                    >
                      <ArrowUpRight className="size-[18px] transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </Lien>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
