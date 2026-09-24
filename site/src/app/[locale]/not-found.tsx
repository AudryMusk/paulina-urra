import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Introuvable() {
  const t = useTranslations("introuvable");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-serif text-4xl">{t("titre")}</h1>
      <p className="text-lg text-muted">{t("texte")}</p>
      <Link href="/" className="text-lg text-blue underline">
        {t("retour")}
      </Link>
    </main>
  );
}
