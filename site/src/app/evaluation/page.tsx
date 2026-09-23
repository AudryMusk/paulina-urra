import type { Metadata } from "next";
import { EvaluationFlow } from "./EvaluationFlow";

export const metadata: Metadata = {
  title: "Évaluation gratuite · Équipe Urra-Rauda",
  description:
    "Six questions sur votre propriété, puis un appel gratuit de 30 minutes avec Paulina ou Denis pour discuter de votre évaluation.",
};

export default async function Evaluation({ searchParams }: PageProps<"/evaluation">) {
  const { adresse } = await searchParams;
  return <EvaluationFlow adresseInitiale={typeof adresse === "string" ? adresse.trim().slice(0, 200) : ""} />;
}
