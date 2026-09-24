"use client";

import Image from "next/image";
import { useLocale, useMessages, useTranslations } from "next-intl";
import {
  type CSSProperties,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronUp,
  CornerDownLeft,
  Gift,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useRouter } from "@/i18n/navigation";
import { courtiers } from "@/lib/content";
import {
  courtiersPreferes,
  echeanciers,
  erreurEtape,
  etats,
  langues,
  NOMBRE_QUESTIONS,
  reponsesInitiales,
  typesPropriete,
  type ErreurCle,
  type Option,
  type Reponses,
} from "@/lib/evaluation";
import { soumettreEvaluation } from "./actions";

const CLE_SAUVEGARDE = "evaluation-urra-rauda";

const questionsAChoix: Partial<Record<number, { champ: "typePropriete" | "etat" | "echeancier"; options: Option[] }>> =
  {
    1: { champ: "typePropriete", options: typesPropriete },
    4: { champ: "etat", options: etats },
    5: { champ: "echeancier", options: echeanciers },
  };

type Depart = { etape: number; reponses: Reponses };

const abonnementVide = () => () => {};

const languesDuSite = { fr: "Français", en: "English", es: "Español" } as const;

function lireDepart(adresse: string, langue: Reponses["langue"], depuisSauvegarde: boolean): Depart {
  const depart: Depart = { etape: adresse ? 1 : 0, reponses: { ...reponsesInitiales, adresse, langue } };
  if (!depuisSauvegarde) return depart;
  try {
    const sauvegarde = JSON.parse(localStorage.getItem(CLE_SAUVEGARDE) ?? "null");
    if (!sauvegarde) return depart;
    return {
      etape: Math.min(Math.max(Number(sauvegarde.etape) || 0, depart.etape), NOMBRE_QUESTIONS),
      reponses: { ...reponsesInitiales, ...sauvegarde.reponses, ...(adresse && { adresse }) },
    };
  } catch {
    return depart;
  }
}

export function EvaluationFlow({ adresseInitiale }: { adresseInitiale: string }) {
  const locale = useLocale();
  const hydrate = useSyncExternalStore(
    abonnementVide,
    () => true,
    () => false,
  );
  return (
    <Parcours
      key={hydrate ? "client" : "serveur"}
      depart={lireDepart(adresseInitiale, languesDuSite[locale], hydrate)}
      sauvegarder={hydrate}
    />
  );
}

function Parcours({ depart, sauvegarder }: { depart: Depart; sauvegarder: boolean }) {
  const router = useRouter();
  const t = useTranslations("evaluation");
  const [etape, setEtape] = useState(depart.etape);
  const [reponses, setReponses] = useState<Reponses>(depart.reponses);
  const [erreur, setErreur] = useState<ErreurCle | "limite" | "enregistrement" | "envoi" | null>(null);
  const [termine, setTermine] = useState(false);
  const [sens, setSens] = useState<1 | -1>(1);
  const [envoiEnCours, demarrerEnvoi] = useTransition();
  const titreRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!sauvegarder || termine) return;
    try {
      localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify({ etape, reponses }));
    } catch {}
  }, [etape, reponses, sauvegarder, termine]);

  useEffect(() => {
    if (termine || (etape !== 2 && etape !== 6)) titreRef.current?.focus({ preventScroll: true });
  }, [etape, termine]);

  const modifier = <K extends keyof Reponses>(champ: K, valeur: Reponses[K]) => {
    setErreur(null);
    setReponses((r) => ({ ...r, [champ]: valeur }));
  };

  const aller = (cible: number) => {
    setErreur(null);
    setSens(cible >= etape ? 1 : -1);
    setEtape(Math.min(Math.max(cible, 0), NOMBRE_QUESTIONS));
  };

  const cleEnvoi = useRef<string | null>(null);

  const suivant = () => {
    if (envoiEnCours) return;
    if (etape === 0) return aller(1);
    const probleme = erreurEtape(etape, reponses);
    if (probleme) return setErreur(probleme);
    if (etape < NOMBRE_QUESTIONS) return aller(etape + 1);
    demarrerEnvoi(async () => {
      cleEnvoi.current ??= crypto.randomUUID();
      const resultat = await soumettreEvaluation(reponses, cleEnvoi.current);
      if (!resultat.ok) return setErreur(resultat.erreur);
      localStorage.removeItem(CLE_SAUVEGARDE);
      if (resultat.rdvUrl) window.location.assign(resultat.rdvUrl);
      else setTermine(true);
    });
  };

  const surTouche = useEffectEvent((ev: KeyboardEvent) => {
    if (termine || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const cible = ev.target as HTMLElement;
    if (cible.closest("input, textarea, select")) return;
    if (ev.key === "Enter" && !cible.closest("button, a")) {
      ev.preventDefault();
      return suivant();
    }
    const question = questionsAChoix[etape];
    const index = ev.key.length === 1 ? ev.key.toUpperCase().charCodeAt(0) - 65 : -1;
    if (question && index >= 0 && index < question.options.length) {
      modifier(question.champ, question.options[index].valeur);
    }
  });

  useEffect(() => {
    const ecouteur = (ev: KeyboardEvent) => surTouche(ev);
    window.addEventListener("keydown", ecouteur);
    return () => window.removeEventListener("keydown", ecouteur);
  }, []);

  if (etape === 0) return <Introduction titreRef={titreRef} onCommencer={() => aller(1)} />;

  const soumettre = (ev: FormEvent) => {
    ev.preventDefault();
    suivant();
  };

  const question = questionsAChoix[etape];

  return (
    <div className="relative flex min-h-dvh flex-col bg-paper">
      <div
        className="absolute inset-x-0 top-0 h-1 origin-left bg-red transition-transform duration-300"
        style={{ transform: `scaleX(${etape / NOMBRE_QUESTIONS})` }}
        role="progressbar"
        aria-label={t("progression")}
        aria-valuemin={0}
        aria-valuemax={NOMBRE_QUESTIONS}
        aria-valuenow={etape}
      />

      <header className="flex items-center justify-between gap-4 px-6 py-7 md:px-12">
        <Logo />
        <div className="flex items-center gap-5">
          <p className="text-base text-muted">{t("etapeSur", { etape, total: NOMBRE_QUESTIONS })}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="hidden border border-line px-[18px] py-[11px] text-base hover:border-ink sm:block"
          >
            {t("reprendre")}
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center px-6 py-10 md:px-12 lg:px-[200px]">
        {termine ? (
          <div className="flex animate-descendre flex-col gap-7">
            <h1 ref={titreRef} tabIndex={-1} className="font-serif text-4xl leading-[1.12] outline-none lg:text-5xl">
              {t("merciTitre", { prenom: reponses.nom.trim().split(/\s+/)[0] })}
            </h1>
            <p className="max-w-[760px] text-xl leading-relaxed text-muted">{t("merciTexte")}</p>
          </div>
        ) : (
          <form
            key={etape}
            onSubmit={soumettre}
            noValidate
            className={`flex w-full flex-col ${etape === 6 ? "gap-[22px]" : "gap-7"} ${sens > 0 ? "animate-entrer-droite" : "animate-entrer-gauche"}`}
          >
            <p className="flex items-center gap-1.5 text-lg font-semibold text-red">
              {etape}
              <ArrowRight className="size-3.5" aria-hidden />
            </p>

            {etape === 1 && <Titre refTitre={titreRef}>{t("q1.titre")}</Titre>}
            {etape === 2 && (
              <Titre refTitre={titreRef} aide={t("q2.aide")}>
                {t("q2.titre")}
              </Titre>
            )}
            {etape === 3 && (
              <Titre refTitre={titreRef} aide={t("q3.aide")}>
                {t("q3.titre")}
              </Titre>
            )}
            {etape === 4 && (
              <Titre refTitre={titreRef} aide={t("q4.aide")}>
                {t("q4.titre")}
              </Titre>
            )}
            {etape === 5 && (
              <Titre refTitre={titreRef} aide={t("q5.aide")}>
                {t("q5.titre")}
              </Titre>
            )}
            {etape === 6 && (
              <Titre refTitre={titreRef} aide={t("q6.aide")} grandeAide>
                {t("q6.titre")}
              </Titre>
            )}

            {question && (
              <Choix
                groupe={question.champ}
                options={question.options}
                valeur={reponses[question.champ]}
                onChange={(valeur) => modifier(question.champ, valeur)}
              />
            )}

            {etape === 2 && (
              <div className="flex w-full max-w-[760px] items-center gap-3 border-b-2 border-line py-3.5 focus-within:border-red">
                <MapPin className="size-5 shrink-0 text-red" aria-hidden />
                <input
                  autoFocus
                  aria-label={t("adresse")}
                  autoComplete="street-address"
                  placeholder={t("adressePlaceholder")}
                  value={reponses.adresse}
                  onChange={(ev) => modifier("adresse", ev.target.value)}
                  className="w-full bg-transparent text-[26px] outline-none placeholder:text-muted/60"
                />
              </div>
            )}

            {etape === 3 && (
              <div className="flex w-full max-w-[760px] flex-col gap-3">
                <Compteur
                  libelle={t("chambres")}
                  valeur={reponses.chambres}
                  onChange={(v) => modifier("chambres", v)}
                />
                <Compteur
                  libelle={t("sallesDeBain")}
                  valeur={reponses.sallesDeBain}
                  onChange={(v) => modifier("sallesDeBain", v)}
                />
                <Compteur
                  libelle={t("stationnement")}
                  valeur={reponses.stationnement}
                  onChange={(v) => modifier("stationnement", v)}
                />
                <label className="flex items-center gap-2 border border-line p-5 focus-within:border-red focus-within:bg-red-soft focus-within:ring-1 focus-within:ring-red">
                  <span className="flex-1 text-lg">{t("superficie")}</span>
                  <input
                    inputMode="numeric"
                    placeholder="0"
                    value={reponses.superficie}
                    onChange={(ev) => modifier("superficie", ev.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-28 bg-transparent text-right text-2xl font-semibold outline-none placeholder:text-muted/50"
                  />
                  <span className="text-base text-muted">{t("pieds")}</span>
                </label>
              </div>
            )}

            {etape === 6 && (
              <div className="flex w-full max-w-[880px] flex-col gap-5">
                <Champ
                  libelle={t("nom")}
                  autoFocus
                  autoComplete="name"
                  value={reponses.nom}
                  onChange={(v) => modifier("nom", v)}
                />
                <Champ
                  libelle={t("courriel")}
                  type="email"
                  autoComplete="email"
                  value={reponses.courriel}
                  onChange={(v) => modifier("courriel", v)}
                />
                <Champ
                  libelle={t("telephone")}
                  type="tel"
                  autoComplete="tel"
                  value={reponses.telephone}
                  onChange={(v) => modifier("telephone", v)}
                />
                <Pastilles
                  libelle={t("langue")}
                  options={langues}
                  valeur={reponses.langue}
                  onChange={(v) => modifier("langue", v)}
                />
                <Pastilles
                  libelle={t("courtier")}
                  options={courtiersPreferes}
                  etiquette={(option) => (option === "Peu importe" ? t("peuImporte") : option)}
                  valeur={reponses.courtier}
                  onChange={(v) => modifier("courtier", v)}
                />
                <label className="flex cursor-pointer items-center gap-3 pt-1 text-lg">
                  <input
                    type="checkbox"
                    checked={reponses.consentement}
                    onChange={(ev) => modifier("consentement", ev.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    className="flex size-5 shrink-0 items-center justify-center border border-line-strong text-white peer-checked:border-red peer-checked:bg-red peer-focus-visible:ring-2 peer-focus-visible:ring-blue"
                    aria-hidden
                  >
                    {reponses.consentement && <Check className="size-[13px]" />}
                  </span>
                  {t("consentement")}
                </label>
              </div>
            )}

            {erreur && (
              <p role="alert" className="animate-fondu text-base font-medium text-red">
                {t(`erreurs.${erreur}`)}
              </p>
            )}

            <div className="flex items-center gap-[18px] pt-3">
              <button
                type="submit"
                disabled={envoiEnCours}
                className="group flex items-center gap-2.5 bg-red px-[26px] py-4 text-lg font-semibold text-white transition-colors hover:bg-navy disabled:opacity-60"
              >
                {etape === 6 ? (envoiEnCours ? t("envoi") : t("choisirAppel")) : t("continuer")}
                {etape === 6 ? (
                  <ArrowRight className="size-[15px] transition-transform group-hover:translate-x-1" aria-hidden />
                ) : (
                  <CornerDownLeft
                    className="size-[15px] transition-transform group-hover:-translate-x-0.5"
                    aria-hidden
                  />
                )}
              </button>
              <span className="hidden text-base text-muted md:inline">{t("entree")}</span>
            </div>
          </form>
        )}
      </main>

      <footer className="flex items-center justify-between gap-4 px-6 py-6 md:px-12">
        <p className="flex items-center gap-2 text-base text-muted">
          <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
          {t("confidentialite")}
        </p>
        {!termine && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => aller(etape - 1)}
              aria-label={t("precedente")}
              className="flex size-11 items-center justify-center bg-mist hover:bg-line"
            >
              <ChevronUp className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={suivant}
              aria-label={t("suivante")}
              className="flex size-11 items-center justify-center bg-mist hover:bg-line"
            >
              <ChevronDown className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}

function Introduction({
  titreRef,
  onCommencer,
}: {
  titreRef: RefObject<HTMLHeadingElement | null>;
  onCommencer: () => void;
}) {
  const t = useTranslations("evaluation.intro");
  const te = useTranslations("evaluation");
  const [paulina, denis] = courtiers;
  return (
    <div className="flex min-h-dvh flex-col bg-paper lg:flex-row">
      <main className="flex flex-1 flex-col justify-center gap-7 px-6 py-16 md:px-[72px] [&>*]:animate-descendre [&>*:nth-child(2)]:[--delai:120ms] [&>*:nth-child(3)]:[--delai:240ms] [&>*:nth-child(4)]:[--delai:360ms] [&>*:nth-child(5)]:[--delai:480ms]">
        <Logo />
        <h1
          ref={titreRef}
          tabIndex={-1}
          className="max-w-[720px] font-serif text-4xl leading-[1.1] outline-none lg:text-[52px]"
        >
          {t("titre")}
        </h1>
        <p className="max-w-[640px] text-xl leading-relaxed text-muted">{t("texte")}</p>
        <div className="flex items-center gap-[18px] pt-2">
          <button
            type="button"
            onClick={onCommencer}
            className="group flex items-center gap-3 bg-red px-7 py-[18px] text-lg font-semibold text-white transition-colors hover:bg-navy"
          >
            {t("commencer")}
            <CornerDownLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          </button>
          <span className="hidden text-base text-muted md:inline">{te("entree")}</span>
        </div>
        <ul className="flex flex-col gap-3.5 text-lg">
          {[
            { Icone: Timer, texte: t("questions") },
            { Icone: Gift, texte: t("engagement") },
            { Icone: CalendarCheck, texte: t("appel") },
          ].map(({ Icone, texte }) => (
            <li key={texte} className="flex items-center gap-2">
              <Icone className="size-4 text-blue" aria-hidden />
              {texte}
            </li>
          ))}
        </ul>
      </main>
      <aside className="flex flex-col justify-center gap-8 bg-mist px-6 py-12 md:px-10 lg:w-[640px] lg:shrink-0">
        <div className="relative aspect-square w-full max-w-[560px] overflow-hidden">
          <Image
            src="/images/equipe-urra-rauda-duo.jpg"
            alt={t("alt")}
            fill
            preload
            sizes="(min-width: 1024px) 560px, 100vw"
            className="animate-rideau object-cover object-[80%_center]"
          />
        </div>
        <div className="flex animate-entrer-droite flex-col gap-4 [--delai:500ms]">
          <p className="font-serif text-[28px] italic text-navy">{t("ecoute")}</p>
          <p className="text-xl leading-relaxed">
            Paulina · {paulina.telephone}
            <br />
            Denis · {denis.telephone}
          </p>
        </div>
      </aside>
    </div>
  );
}

function Titre({
  children,
  aide,
  grandeAide,
  refTitre,
}: {
  children: ReactNode;
  aide?: string;
  grandeAide?: boolean;
  refTitre: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <>
      <h1 ref={refTitre} tabIndex={-1} className="font-serif text-4xl leading-[1.12] outline-none lg:text-5xl">
        {children}
      </h1>
      {aide && <p className={`text-muted ${grandeAide ? "text-xl" : "text-lg"}`}>{aide}</p>}
    </>
  );
}

function Choix({
  groupe,
  options,
  valeur,
  onChange,
}: {
  groupe: "typePropriete" | "etat" | "echeancier";
  options: Option[];
  valeur: string;
  onChange: (valeur: string) => void;
}) {
  const t = useTranslations("evaluation");
  const textes: Record<string, { label: string; note?: string }> = useMessages().evaluation[groupe];
  return (
    <div role="radiogroup" className="flex w-full max-w-[760px] flex-col gap-3">
      {options.map((option, i) => {
        const choisi = option.valeur === valeur;
        const lettre = String.fromCharCode(65 + i);
        return (
          <button
            key={option.valeur}
            type="button"
            role="radio"
            aria-checked={choisi}
            onClick={() => onChange(option.valeur)}
            style={{ "--delai": `${120 + i * 60}ms` } as CSSProperties}
            className={`flex animate-entrer-droite items-center gap-4 border px-5 py-[18px] text-left transition-[border-color,background-color,box-shadow,translate] duration-300 hover:translate-x-1 ${choisi ? "border-red bg-red-soft ring-1 ring-red" : "border-line hover:border-muted"}`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center text-base font-semibold transition-colors ${choisi ? "animate-pop bg-red text-white" : "bg-mist text-muted"}`}
              aria-hidden
            >
              {lettre}
            </span>
            <span className="flex flex-1 flex-col gap-[3px]">
              <span className="text-lg">{textes[option.id].label}</span>
              {textes[option.id].note && <span className="text-base text-muted">{textes[option.id].note}</span>}
            </span>
            {option.commercial && (
              <span className="bg-blue px-2 py-[3px] text-base font-bold text-white">{t("commercial")}</span>
            )}
            {choisi && <Check className="size-[18px] shrink-0 animate-pop text-red" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

function Compteur({
  libelle,
  valeur,
  onChange,
}: {
  libelle: string;
  valeur: number;
  onChange: (valeur: number) => void;
}) {
  const t = useTranslations("evaluation");
  return (
    <div className="flex items-center border border-line px-5 py-4">
      <span className="flex-1 text-lg" id={`compteur-${libelle}`}>
        {libelle}
      </span>
      <div className="flex items-center gap-[18px]">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, valeur - 1))}
          aria-label={t("unDeMoins", { libelle })}
          className="flex size-11 items-center justify-center bg-mist hover:bg-line"
        >
          <Minus className="size-[15px]" aria-hidden />
        </button>
        <output
          key={valeur}
          aria-labelledby={`compteur-${libelle}`}
          className="w-6 animate-pop text-center text-[22px] font-semibold"
        >
          {valeur}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, valeur + 1))}
          aria-label={t("unDePlus", { libelle })}
          className="flex size-11 items-center justify-center bg-red text-white hover:bg-red/90"
        >
          <Plus className="size-[15px]" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function Champ({
  libelle,
  onChange,
  ...props
}: {
  libelle: string;
  onChange: (valeur: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  return (
    <label className="flex flex-col gap-2 border-b border-line pb-2.5 focus-within:border-b-2 focus-within:border-red focus-within:pb-2">
      <span className="text-base font-semibold tracking-[0.12em] text-muted uppercase">{libelle}</span>
      <input
        {...props}
        onChange={(ev) => onChange(ev.target.value)}
        className="bg-transparent text-[22px] outline-none"
      />
    </label>
  );
}

function Pastilles<T extends string>({
  libelle,
  options,
  valeur,
  onChange,
  etiquette = (option) => option,
}: {
  libelle: string;
  options: readonly T[];
  valeur: T;
  onChange: (valeur: T) => void;
  etiquette?: (option: T) => string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <p className="text-base font-semibold tracking-[0.12em] text-muted uppercase sm:w-56 sm:shrink-0">{libelle}</p>
      <div role="radiogroup" aria-label={libelle} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const choisi = option === valeur;
          const courtier = courtiers.find((c) => c.prenom === option);
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={choisi}
              onClick={() => onChange(option)}
              className={`flex h-11 items-center gap-2 border px-4 text-base transition-colors duration-300 ${choisi ? "border-blue bg-blue font-semibold text-white" : "border-line hover:border-muted"}`}
            >
              {courtier && (
                <Image
                  src={courtier.avatar}
                  alt=""
                  width={22}
                  height={22}
                  className="size-[22px] rounded-full object-cover"
                />
              )}
              {etiquette(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
