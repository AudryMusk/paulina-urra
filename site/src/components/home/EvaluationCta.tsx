import Image from "next/image";
import Form from "next/form";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, MapPin } from "lucide-react";
import { getPathname } from "@/i18n/navigation";
import { courtiers } from "@/lib/content";
import { Reveal } from "../Reveal";
import { Eyebrow, wrap } from "../ui";

const chiffres = ["temps", "echange", "gratuit"] as const;

export function EvaluationCta() {
  const t = useTranslations("evaluationCta");
  const locale = useLocale();
  return (
    <section className="border-t border-line bg-paper">
      <div className={`${wrap} flex flex-col justify-between gap-14 py-20 lg:flex-row lg:py-[110px]`}>
        <Reveal depuis="haut" className="flex max-w-[640px] flex-col">
          <Eyebrow>{t("label")}</Eyebrow>
          <h2 className="mt-9 whitespace-pre-line font-serif text-4xl leading-[1.05] text-navy lg:text-5xl">
            {t("titre")}
          </h2>
          <p className="mt-[30px] text-xl leading-[1.8] text-slate">{t("texte")}</p>
          <dl className="mt-11 flex">
            {chiffres.map((chiffre, i) => (
              <div
                key={chiffre}
                className={`flex flex-col-reverse gap-0.5 ${i > 0 ? "pl-4 sm:pl-7" : ""} ${i < chiffres.length - 1 ? "border-r border-line-strong pr-4 sm:pr-7" : ""}`}
              >
                <dt className="text-base text-muted">{t(`${chiffre}.libelle`)}</dt>
                <dd className="font-serif text-[27px] whitespace-nowrap text-blue">{t(`${chiffre}.valeur`)}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delai={150} className="w-full lg:w-[500px]">
          <Form action={getPathname({ href: "/evaluation", locale })} className="flex w-full flex-col lg:pt-[18px]">
            <label htmlFor="adresse-accueil" className="text-base font-medium tracking-[0.16em] text-muted">
              {t("adresse")}
            </label>
            <div className="relative mt-[22px] flex items-center gap-3.5 border-b-2 border-navy pb-3.5 pl-2 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-red after:transition-transform after:duration-500 after:ease-doux focus-within:after:scale-x-100">
              <MapPin className="size-[18px] shrink-0 text-blue" aria-hidden />
              <input
                id="adresse-accueil"
                name="adresse"
                type="text"
                autoComplete="street-address"
                placeholder={t("placeholder")}
                className="w-full bg-transparent text-xl outline-none placeholder:text-muted"
              />
            </div>
            <button
              type="submit"
              className="group mt-5 flex h-[60px] items-center justify-center gap-2.5 bg-red text-lg font-semibold text-white transition-colors hover:bg-navy"
            >
              {t("bouton")}
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
                <p className="text-lg font-medium">{t("traite")}</p>
                <p className="text-base text-muted">{t("coordonnees")}</p>
              </div>
            </div>
          </Form>
        </Reveal>
      </div>
    </section>
  );
}
