export type Option = { valeur: string; note?: string; commercial?: boolean };

export const typesPropriete: Option[] = [
  { valeur: "Maison unifamiliale" },
  { valeur: "Condo ou appartement" },
  { valeur: "Plex (2 à 5 logements)" },
  { valeur: "Immeuble à revenus (6 logements et plus)", commercial: true },
  { valeur: "Local commercial ou industriel", commercial: true },
  { valeur: "Terrain, chalet ou autre" },
];

export const etats: Option[] = [
  { valeur: "Clé en main", note: "Rénovée récemment, rien à prévoir" },
  { valeur: "Bon état", note: "Quelques rafraîchissements à prévoir" },
  { valeur: "À rénover", note: "Travaux importants : toiture, cuisine, fondation…" },
  { valeur: "Je ne sais pas trop", note: "On en jase lors de l'appel" },
];

export const echeanciers: Option[] = [
  { valeur: "Le plus tôt possible", note: "D'ici 3 mois" },
  { valeur: "Dans 3 à 6 mois" },
  { valeur: "Dans 6 à 12 mois" },
  { valeur: "Je m'informe seulement", note: "Aucun projet précis pour l'instant" },
];

export const langues = ["Français", "English"] as const;
export const courtiersPreferes = ["Peu importe", "Paulina", "Denis"] as const;

export type Reponses = {
  typePropriete: string;
  adresse: string;
  chambres: number;
  sallesDeBain: number;
  stationnement: number;
  superficie: string;
  etat: string;
  echeancier: string;
  nom: string;
  courriel: string;
  telephone: string;
  langue: (typeof langues)[number];
  courtier: (typeof courtiersPreferes)[number];
  consentement: boolean;
};

export const reponsesInitiales: Reponses = {
  typePropriete: "",
  adresse: "",
  chambres: 3,
  sallesDeBain: 1,
  stationnement: 1,
  superficie: "",
  etat: "",
  echeancier: "",
  nom: "",
  courriel: "",
  telephone: "",
  langue: "Français",
  courtier: "Peu importe",
  consentement: false,
};

export const NOMBRE_QUESTIONS = 6;

const parmi = (options: Option[], valeur: string) => options.some((option) => option.valeur === valeur);
const entier = (n: number) => Number.isInteger(n) && n >= 0 && n <= 20;

export function erreurEtape(etape: number, r: Reponses): string | null {
  switch (etape) {
    case 1:
      return parmi(typesPropriete, r.typePropriete) ? null : "Choisissez un type de propriété pour continuer.";
    case 2:
      return r.adresse.trim().length >= 5 && r.adresse.length <= 200 ? null : "Indiquez l'adresse de la propriété.";
    case 3:
      if (![r.chambres, r.sallesDeBain, r.stationnement].every(entier)) return "Vérifiez les nombres indiqués.";
      return /^\d{0,6}$/.test(r.superficie) ? null : "La superficie doit être un nombre en pieds carrés.";
    case 4:
      return parmi(etats, r.etat) ? null : "Choisissez l'état de la propriété pour continuer.";
    case 5:
      return parmi(echeanciers, r.echeancier) ? null : "Choisissez un échéancier pour continuer.";
    case 6:
      if (r.nom.trim().length < 2 || r.nom.length > 120) return "Indiquez votre prénom et votre nom.";
      if (r.courriel.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.courriel.trim())) {
        return "Indiquez un courriel valide.";
      }
      const chiffres = r.telephone.replace(/\D/g, "").length;
      if (r.telephone.length > 32 || !/^[+\d\s().-]+$/.test(r.telephone) || chiffres < 10 || chiffres > 15) {
        return "Indiquez un numéro de téléphone à 10 chiffres.";
      }
      if (!langues.includes(r.langue) || !courtiersPreferes.includes(r.courtier)) return "Vérifiez vos préférences.";
      return r.consentement ? null : "Cochez la case pour accepter d'être contacté·e.";
    default:
      return null;
  }
}
