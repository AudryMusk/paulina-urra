import { randomUUID } from "node:crypto";
import type { Etat, ProprieteDonnees } from "../proprietes-affichage";
import { query, transaction } from "./db";

export const TAILLE_PHOTO_MAX = 4_500_000;

const COLONNES =
  "id, etat, mention, prix, prix_demande, adresse, ville, type_propriete, superficie, chambres, salles_de_bain, photo_id, position, publie";

export type ChampsPropriete = Omit<ProprieteDonnees, "id" | "photo_id" | "position">;

function typeImage(octets: Buffer): string | null {
  if (octets[0] === 0xff && octets[1] === 0xd8 && octets[2] === 0xff) return "image/jpeg";
  if (octets.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (octets.toString("ascii", 0, 4) === "RIFF" && octets.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

const entierOptionnel = (valeur: number | null, max: number) =>
  valeur === null || (Number.isInteger(valeur) && valeur >= 0 && valeur <= max);

function verifier(c: ChampsPropriete) {
  if (!["vendu", "a_vendre"].includes(c.etat)) return "Choisissez si la propriété est vendue ou à vendre.";
  if (!c.adresse.trim() || c.adresse.length > 200) return "Indiquez l’adresse (200 caractères maximum).";
  if (!c.ville.trim() || c.ville.length > 100) return "Indiquez la ville.";
  if (c.mention.length > 80) return "La mention doit faire 80 caractères maximum.";
  if (c.type_propriete.length > 80) return "Le type doit faire 80 caractères maximum.";
  if (!Number.isInteger(c.prix) || c.prix <= 0 || c.prix > 100_000_000) return "Indiquez un prix valide.";
  if (!entierOptionnel(c.prix_demande, 100_000_000)) return "Le prix demandé n’est pas valide.";
  if (!entierOptionnel(c.superficie, 1_000_000)) return "La superficie n’est pas valide.";
  if (!entierOptionnel(c.chambres, 50) || !entierOptionnel(c.salles_de_bain, 50)) {
    return "Le nombre de pièces n’est pas valide.";
  }
  return null;
}

export async function listerProprietes({ publieesSeulement = false } = {}) {
  return query<ProprieteDonnees>(
    `SELECT ${COLONNES} FROM properties ${publieesSeulement ? "WHERE publie" : ""} ORDER BY position, created_at`,
  );
}

export async function lirePropriete(id: string) {
  const [propriete] = await query<ProprieteDonnees>(`SELECT ${COLONNES} FROM properties WHERE id = $1`, [id]);
  return propriete || null;
}

export async function enregistrerPropriete(id: string | null, champs: ChampsPropriete, photo: Buffer | null) {
  const erreur = verifier(champs);
  if (erreur) throw new Error(erreur);
  if (!id && !photo) throw new Error("Ajoutez une photo de la propriété.");
  const typePhoto = photo ? typeImage(photo) : null;
  if (photo && (!typePhoto || photo.length > TAILLE_PHOTO_MAX)) {
    throw new Error("La photo doit être une image JPEG, PNG ou WebP de moins de 4,5 Mo.");
  }
  const maintenant = new Date().toISOString();
  const valeurs = [
    champs.etat,
    champs.mention.trim(),
    champs.prix,
    champs.prix_demande,
    champs.adresse.trim(),
    champs.ville.trim(),
    champs.type_propriete.trim(),
    champs.superficie,
    champs.chambres,
    champs.salles_de_bain,
    champs.publie,
    maintenant,
  ];

  return transaction(async (q) => {
    let photoId: string | null = null;
    if (photo) {
      photoId = randomUUID();
      await q("INSERT INTO photos(id, type, donnees, created_at) VALUES ($1, $2, decode($3, 'base64'), $4)", [
        photoId,
        typePhoto,
        photo.toString("base64"),
        maintenant,
      ]);
    }
    if (!id) {
      const nouvelId = randomUUID();
      await q(
        `INSERT INTO properties(etat, mention, prix, prix_demande, adresse, ville, type_propriete, superficie, chambres,
           salles_de_bain, publie, created_at, updated_at, id, photo_id, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $13, $14,
           (SELECT coalesce(max(position), 0) + 1 FROM properties))`,
        [...valeurs, nouvelId, photoId],
      );
      return nouvelId;
    }
    const [avant] = await q<{ photo_id: string }>("SELECT photo_id FROM properties WHERE id = $1 FOR UPDATE", [id]);
    if (!avant) throw new Error("Propriété introuvable.");
    await q(
      `UPDATE properties SET etat = $1, mention = $2, prix = $3, prix_demande = $4, adresse = $5, ville = $6,
         type_propriete = $7, superficie = $8, chambres = $9, salles_de_bain = $10, publie = $11, updated_at = $12,
         photo_id = coalesce($14, photo_id)
       WHERE id = $13`,
      [...valeurs, id, photoId],
    );
    if (photoId) await q("DELETE FROM photos WHERE id = $1", [avant.photo_id]);
    return id;
  });
}

export async function supprimerPropriete(id: string) {
  return transaction(async (q) => {
    const [supprimee] = await q<{ photo_id: string }>("DELETE FROM properties WHERE id = $1 RETURNING photo_id", [id]);
    if (!supprimee) throw new Error("Propriété introuvable.");
    await q("DELETE FROM photos WHERE id = $1", [supprimee.photo_id]);
  });
}

export async function deplacerPropriete(id: string, sens: -1 | 1) {
  return transaction(async (q) => {
    const liste = await q<{ id: string; position: number }>(
      "SELECT id, position FROM properties ORDER BY position, created_at FOR UPDATE",
    );
    const index = liste.findIndex((p) => p.id === id);
    const voisin = liste[index + sens];
    if (index < 0 || !voisin) return;
    const ordre = liste.map((p) => p.id);
    [ordre[index], ordre[index + sens]] = [ordre[index + sens], ordre[index]];
    for (const [i, identifiant] of ordre.entries()) {
      await q("UPDATE properties SET position = $1 WHERE id = $2", [i + 1, identifiant]);
    }
  });
}

export async function lirePhoto(id: string) {
  const [photo] = await query<{ type: string; donnees: string }>(
    "SELECT type, encode(donnees, 'base64') AS donnees FROM photos WHERE id = $1",
    [id],
  );
  return photo ? { type: photo.type, octets: Buffer.from(photo.donnees, "base64") } : null;
}

export function nombreOuNull(valeur: FormDataEntryValue | null) {
  const texte = String(valeur ?? "").replace(/[\s $]/g, "");
  return texte === "" ? null : Number(texte);
}

export const estEtat = (valeur: string): valeur is Etat => valeur === "vendu" || valeur === "a_vendre";
