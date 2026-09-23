import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Equipe } from "@/components/home/Equipe";
import { EvaluationCta } from "@/components/home/EvaluationCta";
import { Hero } from "@/components/home/Hero";
import { Piliers } from "@/components/home/Piliers";
import { Proprietes } from "@/components/home/Proprietes";
import { Services } from "@/components/home/Services";
import { Temoignages } from "@/components/home/Temoignages";

export default function Accueil() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Piliers />
        <Services />
        <Equipe />
        <Proprietes />
        <Temoignages />
        <EvaluationCta />
      </main>
      <SiteFooter />
    </>
  );
}
