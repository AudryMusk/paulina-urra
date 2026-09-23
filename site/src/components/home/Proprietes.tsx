"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Propriete } from "@/lib/proprietes-affichage";
import { Reveal } from "../Reveal";
import { Eyebrow, wrap } from "../ui";

const tonalites = { red: "text-red", blue: "text-blue" };

export function Proprietes({ proprietes }: { proprietes: Propriete[] }) {
  const [index, setIndex] = useState(0);
  const vedette = proprietes[index];
  const autres = [1, 2]
    .filter((pas) => pas < proprietes.length)
    .map((pas) => {
      const i = (index + pas) % proprietes.length;
      return { propriete: proprietes[i], i };
    });
  const decaler = (pas: number) => setIndex((i) => (i + pas + proprietes.length) % proprietes.length);

  return (
    <section id="proprietes" className="scroll-mt-24 bg-paper">
      <div className={`${wrap} flex flex-col gap-12 pt-20 pb-24 lg:gap-[60px]`}>
        <Reveal depuis="haut" className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex flex-col gap-6">
            <Eyebrow>MANDATS RÉCENTS</Eyebrow>
            <h2 className="whitespace-pre-line font-serif text-4xl leading-[1.1] lg:text-5xl">
              {"Vendues ou disponibles,\ndécouvrez nos propriétés."}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-lg text-muted">
              {proprietes.length} propriété{proprietes.length > 1 ? "s" : ""}
            </p>
            {proprietes.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => decaler(-1)}
                  aria-label="Propriété précédente"
                  className="flex size-[46px] items-center justify-center rounded-full border border-[#cdd3dd] text-muted hover:border-navy hover:text-navy"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => decaler(1)}
                  aria-label="Propriété suivante"
                  className="flex size-[46px] items-center justify-center rounded-full bg-blue text-white hover:bg-navy"
                >
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </>
            )}
          </div>
        </Reveal>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <Reveal depuis="rideau" className="relative aspect-[820/518] w-full overflow-hidden lg:w-[62.5%] lg:shrink-0">
            <Image
              key={vedette.photo}
              src={vedette.photo}
              alt={`${vedette.adresse}, ${vedette.ville}`}
              fill
              sizes="(min-width: 1024px) 820px, 100vw"
              className="animate-rideau object-cover"
            />
          </Reveal>
          <Reveal delai={300} className="flex-1">
            <div key={vedette.id} className="flex animate-entrer-droite flex-col">
              <Statut propriete={vedette} className="text-base" />
              <p className="mt-[30px] font-serif text-[56px] leading-none text-navy">{vedette.prix}</p>
              <p className="mt-4 text-xl">{vedette.adresse}</p>
              <p className="mt-6 text-lg text-muted">{vedette.villeLongue}</p>
              <dl className="mt-[34px] border-t border-line-strong">
                {vedette.details.map((detail, i) => (
                  <div
                    key={detail.cle}
                    className={`flex justify-between gap-4 py-3.5 text-lg ${i < vedette.details.length - 1 ? "border-b border-line-strong" : ""}`}
                  >
                    <dt className="text-muted">{detail.cle}</dt>
                    <dd className={`text-right ${detail.accent ? "font-semibold text-blue" : ""}`}>{detail.valeur}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col gap-10 pt-5 md:flex-row md:gap-0">
          {autres.map(({ propriete, i: position }, i) => (
            <Reveal key={propriete.id} delai={i * 120} className="flex flex-1">
              {i > 0 && <span className="mx-6 hidden w-px self-stretch bg-line-strong md:block" aria-hidden />}
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Voir ${propriete.adresse}, ${propriete.ville}`}
                className="group flex flex-1 flex-col gap-6 text-left sm:flex-row sm:gap-[26px]"
              >
                <div className="relative aspect-[230/171] w-full overflow-hidden sm:w-[230px] sm:shrink-0">
                  <Image
                    src={propriete.photo}
                    alt={`${propriete.adresse}, ${propriete.ville}`}
                    fill
                    sizes="230px"
                    className="object-cover transition-transform duration-700 ease-doux group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Statut propriete={propriete} className="text-sm" />
                  <p className="font-serif text-[32px] leading-tight text-navy transition-colors group-hover:text-red">
                    {propriete.prix}
                  </p>
                  <p className="text-lg">{propriete.adresse}</p>
                  <p className="text-lg text-muted">{propriete.ville}</p>
                  <p className="text-lg">{propriete.resume}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Statut({ propriete, className }: { propriete: Propriete; className: string }) {
  return (
    <p
      className={`flex items-center gap-2.5 font-semibold tracking-[0.14em] uppercase ${tonalites[propriete.tonalite]} ${className}`}
    >
      <span className="size-[7px] rounded-full bg-current" aria-hidden />
      {propriete.statut}
    </p>
  );
}
