import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { temoignages, temoignageVedette } from "@/lib/content";
import { Reveal } from "../Reveal";
import { wrap } from "../ui";

export function Temoignages() {
  const t = useTranslations("temoignages");
  return (
    <section className="bg-mist">
      <div className={`${wrap} flex flex-col gap-12 pt-24 pb-[120px] lg:gap-[60px]`}>
        <Reveal depuis="haut" className="flex flex-col gap-6 lg:flex-row lg:gap-0">
          <div className="flex flex-col gap-3 lg:w-[237px] lg:shrink-0">
            <p className="text-base font-medium tracking-[0.16em] text-muted">{t("label")}</p>
            <span className="h-0.5 w-[52px] bg-red" aria-hidden />
          </div>
          <h2 className="whitespace-pre-line font-serif text-4xl leading-[1.08] lg:text-5xl">{t("titre")}</h2>
        </Reveal>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <Reveal depuis="haut" delai={150} className="lg:w-[660px] lg:shrink-0">
            <figure className="flex h-full flex-col gap-9 bg-navy px-8 py-10 text-white lg:px-10 lg:py-11">
              <div className="flex gap-1 text-red" role="img" aria-label={t("etoiles")}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-current group-data-[visible=true]/reveal:animate-pop"
                    style={{ "--delai": `${500 + i * 90}ms` } as CSSProperties}
                    aria-hidden
                  />
                ))}
              </div>
              <blockquote className="font-serif text-2xl leading-[1.55] lg:text-[29px]">
                {t("vedette.citation")}
              </blockquote>
              <figcaption className="flex items-center gap-3.5">
                <span className="h-0.5 w-[26px] bg-red" aria-hidden />
                <span className="flex flex-col gap-[3px]">
                  <span className="text-lg font-semibold">{temoignageVedette.auteur}</span>
                  <span className="text-base text-white/60">{t("vedette.detail")}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <div className="flex flex-1 flex-col">
            {temoignages.map((temoignage, i) => (
              <Reveal
                key={temoignage.auteur}
                delai={150 + i * 120}
                className={`${i === 0 ? "pb-[26px]" : "py-[26px]"} ${i < temoignages.length - 1 ? "border-b border-line" : ""}`}
              >
                <figure className="flex flex-col gap-3.5">
                  <blockquote className="text-lg leading-[1.75] text-ink-soft">{t(temoignage.cle)}</blockquote>
                  <figcaption className="flex items-center gap-2 text-lg">
                    <span className="font-semibold">{temoignage.auteur}</span>
                    <span className="text-muted" aria-hidden>
                      ·
                    </span>
                    <span className="text-muted">{temoignage.ville}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
