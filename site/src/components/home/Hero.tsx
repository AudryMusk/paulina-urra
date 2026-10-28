import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section className="flex flex-col lg:h-[580px] lg:flex-row">
      <div className="relative order-1 h-[420px] overflow-hidden bg-mist sm:h-[500px] lg:order-2 lg:h-full lg:w-[46%] lg:shrink-0">
        <Image
          src="/images/paulina-equipe.jpg"
          alt={t("alt")}
          fill
          preload
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="animate-rideau object-cover object-top"
        />
        <span className="absolute top-0 right-0 h-20 w-1.5 bg-red" aria-hidden />
      </div>
      <div className="order-2 flex flex-1 items-center bg-paper px-6 py-14 md:px-10 lg:order-1 lg:px-16">
        <div className="flex w-full max-w-[560px] flex-col gap-5">
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
              href="#apropos"
              className="border border-navy bg-white px-5 py-4 text-lg font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              {t("apropos")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
