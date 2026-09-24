export type Option = { id: string; valeur: string; commercial?: boolean };

export const typesPropriete: Option[] = [
  { id: "unifamiliale", valeur: "Maison unifamiliale" },
  { id: "condo", valeur: "Condo ou appartement" },
  { id: "plex", valeur: "Plex (2 à 5 logements)" },
  { id: "immeuble", valeur: "Immeuble à revenus (6 logements et plus)", commercial: true },
  { id: "local", valeur: "Local commercial ou industriel", commercial: true },
  { id: "autre", valeur: "Terrain, chalet ou autre" },
];

export const etats: Option[] = [
  { id: "cleEnMain", valeur: "Clé en main" },
  { id: "bon", valeur: "Bon état" },
  { id: "aRenover", valeur: "À rénover" },
  { id: "incertain", valeur: "Je ne sais pas trop" },
];

export const echeanciers: Option[] = [
  { id: "rapide", valeur: "Le plus tôt possible" },
  { id: "troisSix", valeur: "Dans 3 à 6 mois" },
  { id: "sixDouze", valeur: "Dans 6 à 12 mois" },
  { id: "information", valeur: "Je m'informe seulement" },
];

export const langues = ["Français", "English", "Español"] as const;
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

export type ErreurCle =
  | "typePropriete"
  | "adresse"
  | "nombres"
  | "superficie"
  | "etat"
  | "echeancier"
  | "nom"
  | "courriel"
  | "telephone"
  | "preferences"
  | "consentement";

export function erreurEtape(etape: number, r: Reponses): ErreurCle | null {
  switch (etape) {
    case 1:
      return parmi(typesPropriete, r.typePropriete) ? null : "typePropriete";
    case 2:
      return r.adresse.trim().length >= 5 && r.adresse.length <= 200 ? null : "adresse";
    case 3:
      if (![r.chambres, r.sallesDeBain, r.stationnement].every(entier)) return "nombres";
      return /^\d{0,6}$/.test(r.superficie) ? null : "superficie";
    case 4:
      return parmi(etats, r.etat) ? null : "etat";
    case 5:
      return parmi(echeanciers, r.echeancier) ? null : "echeancier";
    case 6:
      if (r.nom.trim().length < 2 || r.nom.length > 120) return "nom";
      if (r.courriel.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.courriel.trim())) {
        return "courriel";
      }
      const chiffres = r.telephone.replace(/\D/g, "").length;
      if (r.telephone.length > 32 || !/^[+\d\s().-]+$/.test(r.telephone) || chiffres < 10 || chiffres > 15) {
        return "telephone";
      }
      if (!langues.includes(r.langue) || !courtiersPreferes.includes(r.courtier)) return "preferences";
      return r.consentement ? null : "consentement";
    default:
      return null;
  }
}
