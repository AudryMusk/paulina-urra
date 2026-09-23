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
