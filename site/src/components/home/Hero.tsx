import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section className="relative flex flex-col overflow-hidden lg:block lg:h-[560px]">
      <div className="relative h-[340px] overflow-hidden sm:h-[420px] lg:absolute lg:inset-0 lg:h-full">
        <Image
          src="/images/equipe-urra-rauda-duo.jpg"
          alt={t("alt")}
          fill
          preload
          sizes="100vw"
          className="animate-zoom-lent object-cover object-[86%_center] lg:object-center"
        />
      </div>
      <div className="relative mx-auto flex h-full w-full max-w-[1440px] items-center px-6 py-12 md:px-10 lg:px-16 lg:py-0">
        <div className="flex w-full max-w-[430px] flex-col gap-5">
          <p className="flex animate-descendre items-center gap-3 text-sm font-semibold tracking-[0.18em] [--delai:150ms]">
            <span className="h-0.5 w-7 bg-red" aria-hidden />
            {t("surtitre")}
          </p>
          <h1 className="animate-descendre font-serif text-5xl leading-[1.02] text-navy [--delai:280ms] lg:text-[54px]">
            {t("titre")}
          </h1>
          <p className="animate-descendre text-xl leading-relaxed [--delai:420ms]">
            {t("texte")}
            <br />
            <br />
            {t("langues")}
          </p>
          <div className="flex animate-descendre flex-wrap gap-3 pt-2 [--delai:560ms]">
            <Link
              href="/evaluation"
              className="group flex items-center gap-2.5 bg-red px-5 py-4 text-lg font-semibold text-white transition-colors hover:bg-navy"
            >
              {t("cta")}
              <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <a
              href="#equipe"
              className="border border-navy bg-white/90 px-5 py-4 text-lg font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              {t("equipe")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
