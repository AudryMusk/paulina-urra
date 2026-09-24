import Image from "next/image";
import { useTranslations } from "next-intl";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { bureau, courtiers, reseaux, telLink } from "@/lib/content";
import { Courriel, wrap } from "./ui";

const liensSociaux = [
  { label: "Facebook", href: reseaux.facebook, Icone: FaFacebookF },
  { label: "Instagram", href: reseaux.instagram, Icone: FaInstagram },
  { label: "LinkedIn", href: reseaux.linkedin, Icone: FaLinkedinIn },
];

export function SiteFooter() {
  const t = useTranslations("pied");
  return (
    <footer className="bg-night text-white/85">
      <div className={`${wrap} flex flex-col gap-14 pt-16 pb-8`}>
        <div className="grid gap-10 sm:grid-cols-2 lg:flex lg:gap-8">
          <div className="flex flex-col gap-5 lg:w-60 lg:shrink-0">
            <Image src="/images/logo-ur.jpg" alt="Équipe Urra-Rauda" width={132} height={138} />
            <p className="text-base leading-relaxed">{t("description")}</p>
          </div>
          {courtiers.map((courtier) => (
            <div key={courtier.nom} className="flex flex-col gap-3 lg:flex-1">
              <p className="text-base font-semibold tracking-[0.12em] uppercase">
                {"nomCourt" in courtier ? courtier.nomCourt : courtier.nom}
              </p>
              <a href={telLink(courtier.telephone)} className="text-lg hover:text-white">
                {t("cellulaire")} · {courtier.telephone}
              </a>
              <a href={`mailto:${courtier.courriel}`} className="text-lg hover:text-white">
                <Courriel adresse={courtier.courriel} />
              </a>
            </div>
          ))}
          <address className="flex flex-col gap-3 not-italic lg:flex-1">
            <p className="text-base font-semibold tracking-[0.12em]">{t("bureauTitre")}</p>
            <p className="text-lg">{bureau.nom}</p>
            <p className="text-lg">{bureau.adresse}</p>
            <p className="text-lg">{bureau.ville}</p>
            <a href={telLink(bureau.telephone)} className="text-lg hover:text-white">
              {t("bureau")} · {bureau.telephone}
            </a>
          </address>
        </div>

        <div className="flex flex-col gap-6 border-t border-white/12 pt-6 md:flex-row md:items-center md:justify-between">
          <Image src="/images/remax-signature-blanc.png" alt="RE/MAX Signature" width={236} height={36} />
          <ul className="flex gap-2.5">
            {liensSociaux.map(({ label, href, Icone }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center border border-white/20 text-white hover:border-white"
                >
                  <Icone className="size-[15px]" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <p className="text-base text-white/50">© 2026 Équipe Urra-Rauda</p>
        </div>
      </div>
    </footer>
  );
}
