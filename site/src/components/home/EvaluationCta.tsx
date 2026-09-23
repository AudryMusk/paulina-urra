import Image from "next/image";
import Form from "next/form";
import { ArrowRight, MapPin } from "lucide-react";
import { courtiers } from "@/lib/content";
import { Reveal } from "../Reveal";
import { Eyebrow, wrap } from "../ui";

const chiffres = [
  { valeur: "2 min", libelle: "de votre temps" },
  { valeur: "30 min", libelle: "pour notre échange" },
  { valeur: "0 $", libelle: "et sans engagement" },
];

export function EvaluationCta() {
  return (
    <section className="border-t border-line bg-paper">
      <div className={`${wrap} flex flex-col justify-between gap-14 py-20 lg:flex-row lg:py-[110px]`}>
        <Reveal depuis="haut" className="flex max-w-[640px] flex-col">
          <Eyebrow>ÉVALUATION GRATUITE</Eyebrow>
          <h2 className="mt-9 whitespace-pre-line font-serif text-4xl leading-[1.05] text-navy lg:text-5xl">
            {"Combien vaut votre\nmaison aujourd'hui ?"}
          </h2>
          <p className="mt-[30px] text-xl leading-[1.8] text-slate">
            Répondez à six questions sur votre propriété, puis choisissez un appel gratuit de 30 minutes avec Paulina ou
            Denis pour discuter de votre évaluation.
          </p>
          <dl className="mt-11 flex">
            {chiffres.map((chiffre, i) => (
              <div
                key={chiffre.valeur}
                className={`flex flex-col-reverse gap-0.5 ${i > 0 ? "pl-4 sm:pl-7" : ""} ${i < chiffres.length - 1 ? "border-r border-line-strong pr-4 sm:pr-7" : ""}`}
              >
                <dt className="text-base text-muted">{chiffre.libelle}</dt>
                <dd className="font-serif text-[27px] whitespace-nowrap text-blue">{chiffre.valeur}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delai={150} className="w-full lg:w-[500px]">
          <Form action="/evaluation" className="flex w-full flex-col lg:pt-[18px]">
            <label htmlFor="adresse-accueil" className="text-base font-medium tracking-[0.16em] text-muted">
              ADRESSE DE VOTRE PROPRIÉTÉ
            </label>
            <div className="relative mt-[22px] flex items-center gap-3.5 border-b-2 border-navy pb-3.5 pl-2 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-red after:transition-transform after:duration-500 after:ease-doux focus-within:after:scale-x-100">
              <MapPin className="size-[18px] shrink-0 text-blue" aria-hidden />
              <input
                id="adresse-accueil"
                name="adresse"
                type="text"
                autoComplete="street-address"
                placeholder="Numéro civique, rue, ville"
                className="w-full bg-transparent text-xl outline-none placeholder:text-muted"
              />
            </div>
            <button
              type="submit"
              className="group mt-5 flex h-[60px] items-center justify-center gap-2.5 bg-red text-lg font-semibold text-white transition-colors hover:bg-navy"
            >
              Commencer mon évaluation
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </button>
            <div className="mt-[30px] flex items-center gap-3.5">
              <div className="flex shrink-0 -space-x-3">
                {courtiers.map((courtier) => (
                  <Image
                    key={courtier.nom}
                    src={courtier.avatar}
                    alt=""
                    width={46}
                    height={46}
                    className="size-[46px] rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-lg font-medium">Traité personnellement par Paulina ou Denis.</p>
                <p className="text-base text-muted">Vos coordonnées servent à préparer votre évaluation.</p>
              </div>
            </div>
          </Form>
        </Reveal>
      </div>
    </section>
  );
}
