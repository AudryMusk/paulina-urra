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

export type Propriete = {
  id: string;
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

export const etats: Record<Etat, string> = { vendu: "Vendue", a_vendre: "À vendre" };

const nombre = new Intl.NumberFormat("fr-CA");
export const argent = (montant: number) => `${nombre.format(montant)} $`;
const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;

export function versAffichage(p: ProprieteDonnees): Propriete {
  const pieces = [
    p.chambres !== null ? pluriel(p.chambres, "chambre") : null,
    p.salles_de_bain !== null ? pluriel(p.salles_de_bain, "salle") + " de bain" : null,
  ].filter(Boolean);
  const details: Propriete["details"] = [];
  if (p.type_propriete) details.push({ cle: "Type", valeur: p.type_propriete });
  if (p.superficie !== null) details.push({ cle: "Superficie", valeur: `${nombre.format(p.superficie)} pi²` });
  if (pieces.length) details.push({ cle: "Pièces", valeur: pieces.join(" · ") });
  if (p.prix_demande !== null) {
    details.push({ cle: "Prix demandé", valeur: argent(p.prix_demande) });
    if (p.etat === "vendu" && p.prix !== p.prix_demande) {
      const ecart = p.prix - p.prix_demande;
      details.push({ cle: "Écart", valeur: `${ecart > 0 ? "+" : "−"} ${argent(Math.abs(ecart))}`, accent: true });
    }
  }
  return {
    id: p.id,
    statut: p.mention || etats[p.etat],
    tonalite: p.etat === "vendu" ? "red" : "blue",
    prix: argent(p.prix),
    adresse: p.adresse,
    ville: p.ville,
    villeLongue: `${p.ville} (Québec)`,
    photo: `/photos/${p.photo_id}`,
    resume: [
      p.chambres !== null ? `${p.chambres} ch` : null,
      p.salles_de_bain !== null ? `${p.salles_de_bain} sdb` : null,
      p.superficie !== null ? `${nombre.format(p.superficie)} pi²` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    details,
  };
}
