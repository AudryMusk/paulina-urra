import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Equipe } from "@/components/home/Equipe";
import { EvaluationCta } from "@/components/home/EvaluationCta";
import { Hero } from "@/components/home/Hero";
import { Piliers } from "@/components/home/Piliers";
import { Proprietes } from "@/components/home/Proprietes";
import { Services } from "@/components/home/Services";
import { Temoignages } from "@/components/home/Temoignages";
import { listerProprietes } from "@/lib/backoffice/proprietes";

export const revalidate = 3600;

export default async function Accueil({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const proprietes = process.env.DATABASE_URL ? await listerProprietes({ publieesSeulement: true }) : [];
  return (
    <>
      <SiteHeader avecProprietes={proprietes.length > 0} />
      <main>
        <Hero />
        <Piliers />
        <Services />
        <Equipe />
        {proprietes.length > 0 && <Proprietes proprietes={proprietes} />}
        <Temoignages />
        <EvaluationCta />
      </main>
      <SiteFooter />
    </>
  );
}
