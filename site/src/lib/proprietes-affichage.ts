export type Etat = "vendu" | "a_vendre";

export type ProprieteDonnees = {
  id: string;
  etat: Etat;
  mention: string;
  prix: number;
  prix_demande: number | null;
  adresse: string;
  ville: string;
  type_propriete: string;
  superficie: number | null;
  chambres: number | null;
  salles_de_bain: number | null;
  photo_id: string;
  position: number;
  publie: boolean;
};

export const etats: Record<Etat, string> = { vendu: "Vendue", a_vendre: "À vendre" };

const nombre = new Intl.NumberFormat("fr-CA");
export const argent = (montant: number) => `${nombre.format(montant)} $`;
