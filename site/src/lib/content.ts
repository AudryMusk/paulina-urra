export const courtiers = [
  {
    cle: "paulina",
    prenom: "Paulina",
    nom: "Paulina Urra",
    photo: "/images/paulina-portrait.jpg",
    avatar: "/images/paulina-avatar.jpg",
    telephone: "438 866-2204",
    courriel: "paulina.urra@remax-quebec.com",
  },
  {
    cle: "denis",
    prenom: "Denis",
    nom: "Denis Enrique Rauda Hernandez",
    nomCourt: "Denis Rauda Hernandez",
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

export const temoignageVedette = { auteur: "Marie-Ève & Simon L." };

export const temoignages = [
  { cle: "karim", auteur: "Karim B.", ville: "Sainte-Julie" },
  { cle: "josee", auteur: "Josée T.", ville: "Verchères" },
] as const;
