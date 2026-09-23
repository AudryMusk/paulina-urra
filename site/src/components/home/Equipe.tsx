import Image from "next/image";
import { Check, Languages, Mail, Phone } from "lucide-react";
import { courtiers, telLink } from "@/lib/content";
import { Reveal } from "../Reveal";
import { Courriel, SectionHeader, wrap } from "../ui";

const garanties = [
  "Programme de protection Tranquilli-T inclus",
  "RE/MAX Intégrité : solution vices cachés",
  "Photographie et mise en valeur professionnelles",
  "Réseau de notaires, courtiers hypothécaires et inspecteurs",
];

export function Equipe() {
  return (
    <section id="equipe" className="scroll-mt-24 bg-mist">
      <div className={`${wrap} flex flex-col gap-10 py-20`}>
        <Reveal depuis="haut">
          <SectionHeader
            label="L'ÉQUIPE"
            title={"Une équipe à l’écoute\nde votre projet."}
            intro="Vendre ou acheter marque une nouvelle étape. Paulina et Denis mettent leurs compétences en commun pour vous guider, répondre à vos questions et suivre votre dossier avec attention."
          />
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          {courtiers.map((courtier, i) => (
            <Reveal key={courtier.nom} delai={i * 150}>
              <article className="group flex flex-col bg-paper transition-shadow duration-500 hover:shadow-[0_24px_60px_-24px_rgb(10_27_61/0.25)] sm:h-[470px] sm:flex-row">
                <div className="relative h-80 overflow-hidden sm:h-full sm:w-[260px] sm:shrink-0">
                  <Reveal depuis="rideau" delai={250 + i * 150} className="absolute inset-0">
                    <Image
                      src={courtier.photo}
                      alt={courtier.nom}
                      fill
                      sizes="(min-width: 640px) 260px, 100vw"
                      className="object-cover object-top transition-transform duration-700 ease-doux group-hover:scale-105"
                    />
                  </Reveal>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <h3 className="font-serif text-[30px] leading-tight">{courtier.nom}</h3>
                  <p className="whitespace-pre-line text-base text-muted">{courtier.role}</p>
                  <p className="font-serif text-xl italic leading-normal">{courtier.citation}</p>
                  <div className="flex-1" />
                  <a href={telLink(courtier.telephone)} className="flex items-center gap-2.5 text-lg hover:text-red">
                    <Phone className="size-[15px] text-blue" aria-hidden />
                    {courtier.telephone}
                  </a>
                  <a
                    href={`mailto:${courtier.courriel}`}
                    className="flex items-center gap-2.5 text-base hover:text-red"
                  >
                    <Mail className="size-[15px] shrink-0 text-blue" aria-hidden />
                    <span>
                      <Courriel adresse={courtier.courriel} />
                    </span>
                  </a>
                  <p className="flex items-center gap-2.5 text-lg">
                    <Languages className="size-[15px] text-blue" aria-hidden />
                    Français · English
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <ul className="grid gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {garanties.map((garantie, i) => (
            <li key={garantie}>
              <Reveal delai={i * 80} className="flex gap-2.5 text-lg leading-normal text-muted">
                <Check className="mt-1 size-4 shrink-0 text-red" aria-hidden />
                {garantie}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
