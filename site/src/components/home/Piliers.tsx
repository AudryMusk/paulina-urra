import { useTranslations } from "next-intl";
import { Reveal } from "../Reveal";
import { wrap } from "../ui";

const piliers = ["vendre", "acheter", "evaluer", "echanger"] as const;

export function Piliers() {
  const t = useTranslations("piliers");
  return (
    <section className="bg-navy text-white">
      <div className={`${wrap} grid grid-cols-2 gap-6 py-10 lg:flex lg:items-center`}>
        <Reveal depuis="haut" className="col-span-2 lg:w-56 lg:shrink-0">
          <p className="whitespace-pre-line font-serif text-2xl leading-snug">{t("titre")}</p>
        </Reveal>
        {piliers.map((pilier, i) => (
          <Reveal
            key={pilier}
            delai={100 + i * 100}
            className="flex flex-1 flex-col gap-2.5 border-l border-white/15 pl-6"
          >
            <p className="font-serif text-[26px]">{t(`${pilier}.titre`)}</p>
            <p className="whitespace-pre-line text-lg leading-snug text-white/85">{t(`${pilier}.texte`)}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
