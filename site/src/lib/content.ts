export const courtiers = [
  {
    prenom: "Paulina",
    nom: "Paulina Urra",
    role: "Courtière immobilière\nRésidentiel et commercial",
    citation: "« Je m'engage à réaliser ce projet efficacement et sans complication. »",
    photo: "/images/paulina-portrait.jpg",
    avatar: "/images/paulina-avatar.jpg",
    telephone: "438 866-2204",
    courriel: "paulina.urra@remax-quebec.com",
  },
  {
    prenom: "Denis",
    nom: "Denis Enrique Rauda Hernandez",
    nomCourt: "Denis Rauda Hernandez",
    role: "Courtier immobilier\nRésidentiel et commercial",
    citation: "« Avec vous, du début à la clé. »",
    photo: "/images/denis-equipe.jpg",
    avatar: "/images/denis-avatar.jpg",
    telephone: "514 625-4257",
    courriel: "denis.raudahernandez@remax-quebec.com",
  },
] as const;

export const bureau = {
  nom: "RE/MAX Signature inc.",
  adresse: "1151, place Nobel, bureau 100",
  ville: "Boucherville (Québec) J4B 7L3",
  telephone: "450 449-4411",
};

export const reseaux = {
  facebook: "https://www.facebook.com/paulina.urrarauda.1/",
  instagram: "https://www.instagram.com/paulinaurra_remax/",
  linkedin: "https://www.linkedin.com/in/paulina-urra-585663189/",
};

export const telLink = (numero: string) => `tel:+1${numero.replace(/\D/g, "")}`;

export type Propriete = {
  statut: string;
  tonalite: "red" | "blue";
  prix: string;
  adresse: string;
  ville: string;
  villeLongue: string;
  photo: string;
  resume: string;
  details: { cle: string; valeur: string; accent?: boolean }[];
};

export const proprietes: Propriete[] = [
  {
    statut: "Vendu en 21 jours",
    tonalite: "red",
    prix: "749 000 $",
    adresse: "93, rue Monseigneur-Taché",
    ville: "Boucherville",
    villeLongue: "Boucherville (Québec)",
    photo: "/images/maison-1.jpg",
    resume: "4 ch · 2 sdb · 2 340 pi²",
    details: [
      { cle: "Type", valeur: "Maison à paliers multiples" },
      { cle: "Superficie", valeur: "2 340 pi²" },
      { cle: "Pièces", valeur: "4 chambres · 2 salles de bain" },
      { cle: "Prix demandé", valeur: "739 000 $" },
      { cle: "Écart", valeur: "+ 10 000 $", accent: true },
    ],
  },
  {
    statut: "Vendue au-dessus du prix demandé",
    tonalite: "red",
    prix: "875 000 $",
    adresse: "66, rue De La Perrière S.",
    ville: "Boucherville",
    villeLongue: "Boucherville (Québec)",
    photo: "/images/maison-2.jpg",
    resume: "5 ch · 3 sdb · 3 100 pi²",
    details: [
      { cle: "Superficie", valeur: "3 100 pi²" },
      { cle: "Pièces", valeur: "5 chambres · 3 salles de bain" },
    ],
  },
  {
    statut: "Nouveau sur le marché",
    tonalite: "blue",
    prix: "612 000 $",
    adresse: "412, rue des Tilleuls",
    ville: "Sainte-Julie",
    villeLongue: "Sainte-Julie (Québec)",
    photo: "/images/maison-3.jpg",
    resume: "3 ch · 2 sdb · 1 890 pi²",
    details: [
      { cle: "Superficie", valeur: "1 890 pi²" },
      { cle: "Pièces", valeur: "3 chambres · 2 salles de bain" },
    ],
  },
];

export const temoignageVedette = {
  citation:
    "« Notre maison était en vente depuis huit mois avec un autre courtier. L'équipe l'a repositionnée, refait les photos, et vendue en trois semaines. »",
  auteur: "Marie-Ève & Simon L.",
  detail: "Boucherville · vendu en 21 jours",
};

export const temoignages = [
  {
    citation:
      "« Premiers acheteurs, on ne comprenait rien. Ils nous ont expliqué chaque document, sans jamais nous presser. On s'est sentis protégés. »",
    auteur: "Karim B.",
    ville: "Sainte-Julie",
  },
  {
    citation: "« Ils ont négocié 18 000 $ de plus que notre meilleure offre initiale. Le calme incarné. »",
    auteur: "Josée T.",
    ville: "Verchères",
  },
];
