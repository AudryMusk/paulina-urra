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
import { versAffichage } from "@/lib/proprietes-affichage";

export const revalidate = 3600;

export default async function Accueil() {
  const proprietes = process.env.DATABASE_URL
    ? (await listerProprietes({ publieesSeulement: true })).map(versAffichage)
    : [];
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
