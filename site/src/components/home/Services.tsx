import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../Reveal";
import { SectionHeader, wrap } from "../ui";

const services = [
  {
    titre: "Vendre",
    sousTitre: "Mise en marché complète",
    texte: "Un prix réfléchi, des photos professionnelles et un accompagnement à chaque étape de la vente.",
    href: "/evaluation",
  },
  {
    titre: "Acheter",
    sousTitre: "Accompagnement acheteur",
    texte: "Visites ciblées, inspection encadrée et financement préparé en amont avec nos partenaires hypothécaires.",
    href: "#equipe",
  },
  {
    titre: "Commercial",
    sousTitre: "Immeubles, plex et locaux",
    texte: "Immeubles à revenus, locaux commerciaux et terrains. Analyse de rendement et mise en marché ciblée.",
    href: "#equipe",
    nouveau: true,
  },
  {
    titre: "Évaluer",
    sousTitre: "Valeur marchande",
    texte:
      "Une estimation appuyée sur les ventes comparables de votre secteur, expliquée lors d’un appel de 30 minutes.",
    href: "/evaluation",
  },
];

export function Services() {
  return (
    <section id="services" className="scroll-mt-24 bg-paper">
      <div className={`${wrap} flex flex-col gap-10 py-20`}>
        <Reveal depuis="haut">
          <SectionHeader
            label="SERVICES"
            title={"Votre projet,\nnotre accompagnement."}
            intro="Vous échangez directement avec Paulina ou Denis, du premier appel à la remise des clés chez le notaire."
          />
        </Reveal>
        <ul className="flex flex-col">
          {services.map((service, i) => {
            const vedette = i === 0;
            return (
              <li key={service.titre}>
                <Reveal delai={i * 90}>
                  <Link
                    href={service.href}
                    className={`group flex flex-col gap-4 border-b border-line px-4 py-8 transition-colors duration-300 md:flex-row md:items-center md:gap-10 md:px-8 md:py-9 ${vedette ? "bg-mist" : "hover:bg-mist"}`}
                  >
                    <span className={`w-10 shrink-0 text-base font-semibold ${vedette ? "text-red" : "text-muted"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex shrink-0 flex-col gap-1.5 transition-transform duration-500 ease-doux group-hover:translate-x-2 md:w-[360px]">
                      <span className="flex items-center gap-3">
                        <span className="font-serif text-4xl">{service.titre}</span>
                        {service.nouveau && (
                          <span className="bg-blue px-2.5 py-1.5 text-base font-bold text-white">NOUVEAU</span>
                        )}
                      </span>
                      <span className="text-lg text-muted">{service.sousTitre}</span>
                    </span>
                    <span className="flex-1 text-xl leading-relaxed text-muted">{service.texte}</span>
                    <span
                      className={`flex size-12 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${vedette ? "bg-red text-white group-hover:bg-navy" : "border border-line text-ink group-hover:border-red group-hover:bg-red group-hover:text-white"}`}
                      aria-hidden
                    >
                      <ArrowUpRight className="size-[18px] transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
