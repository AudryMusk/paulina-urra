import Image from "next/image";
import { useTranslations } from "next-intl";
import { Building2, Languages, MapPin, Phone } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { courtiers, reseaux, telLink } from "@/lib/content";
import { Reveal } from "../Reveal";
import { wrap } from "../ui";

const [paulina] = courtiers;

const points = [
  { cle: "specialite", Icone: Building2 },
  { cle: "langues", Icone: Languages },
  { cle: "bureau", Icone: MapPin },
] as const;

export function Rencontre() {
  const t = useTranslations("rencontre");
  return (
    <section className="overflow-hidden bg-navy text-white">
      <div className={`${wrap} flex flex-col gap-20 py-20 lg:flex-row lg:items-center lg:gap-28 lg:py-[110px]`}>
        <div className="relative w-full max-w-[520px] self-center lg:w-[440px] lg:shrink-0 xl:w-[500px]">
          <span className="absolute -top-4 -left-4 size-24 border-t-2 border-l-2 border-red" aria-hidden />
          <Reveal depuis="rideau" className="group relative aspect-[4/5] overflow-hidden">
            <Image
              src="/images/paulina-rencontre.jpg"
              alt={t("alt")}
              fill
              sizes="(min-width: 1280px) 500px, (min-width: 1024px) 440px, (min-width: 568px) 520px, 100vw"
              className="object-cover object-top transition-transform duration-700 ease-doux group-hover:scale-105"
            />
          </Reveal>
          <Reveal
            depuis="haut"
            delai={600}
            className="absolute -right-3 -bottom-12 w-[44%] border-[6px] border-navy sm:-right-10 lg:-right-16"
          >
            <Image
              src="/images/paulina-rencontre-detail.jpg"
              alt=""
              width={800}
              height={800}
              sizes="240px"
              className="aspect-square object-cover"
            />
          </Reveal>
        </div>

        <Reveal delai={150} className="flex max-w-[640px] flex-col">
          <p className="flex items-center gap-4 text-base font-medium tracking-[0.16em] text-white/70">
            <span className="h-0.5 w-11 bg-red" aria-hidden />
            {t("label")}
          </p>
          <h2 className="mt-8 whitespace-pre-line font-serif text-4xl leading-[1.08] lg:text-5xl">{t("titre")}</h2>
          <p className="mt-7 text-xl leading-[1.8] text-white/80">{t("texte")}</p>
          <ul className="mt-9 flex flex-col gap-3.5 border-t border-white/15 pt-8">
            {points.map(({ cle, Icone }) => (
              <li key={cle} className="flex items-center gap-3 text-lg">
                <Icone className="size-4 shrink-0 text-red" aria-hidden />
                {t(`points.${cle}`)}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={telLink(paulina.telephone)}
              className="group flex items-center gap-2.5 bg-red px-5 py-4 text-lg font-semibold transition-colors hover:bg-white hover:text-navy"
            >
              <Phone className="size-[18px]" aria-hidden />
              {t("appeler")}
              <span className="hidden font-normal text-white/80 group-hover:text-navy/70 sm:inline">
                · {paulina.telephone}
              </span>
            </a>
            <a
              href={reseaux.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 border border-white/40 px-5 py-4 text-lg font-semibold transition-colors hover:border-white hover:bg-white hover:text-navy"
            >
              <FaInstagram className="size-[18px]" aria-hidden />
              {t("instagram")}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
