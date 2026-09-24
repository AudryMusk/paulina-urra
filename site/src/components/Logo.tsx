import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Logo() {
  const t = useTranslations("logo");
  return (
    <Link href="/" className="flex items-center gap-3.5" aria-label={t("accueil")}>
      <span className="flex h-10 w-1.5 flex-col" aria-hidden>
        <span className="flex-1 bg-red" />
        <span className="flex-1 border-x border-line bg-white" />
        <span className="flex-1 bg-blue" />
      </span>
      <span className="flex flex-col gap-[3px]">
        <span className="text-[10px] font-medium tracking-[0.35em] text-muted">{t("equipe")}</span>
        <span className="font-serif text-[17px] font-semibold tracking-[0.15em] whitespace-nowrap text-ink">
          URRA-RAUDA
        </span>
      </span>
    </Link>
  );
}
