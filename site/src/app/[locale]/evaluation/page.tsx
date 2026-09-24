import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { EvaluationFlow } from "./EvaluationFlow";

export async function generateMetadata({ params }: PageProps<"/[locale]/evaluation">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("evaluationTitre"), description: t("evaluationDescription") };
}

export default async function Evaluation({ params, searchParams }: PageProps<"/[locale]/evaluation">) {
  const [{ locale }, { adresse }] = await Promise.all([params, searchParams]);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <EvaluationFlow adresseInitiale={typeof adresse === "string" ? adresse.trim().slice(0, 200) : ""} />;
}
