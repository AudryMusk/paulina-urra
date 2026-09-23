"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/backoffice/auth";
import {
  deplacerPropriete,
  enregistrerPropriete,
  estEtat,
  nombreOuNull,
  supprimerPropriete,
} from "@/lib/backoffice/proprietes";
import type { FormState } from "../actions";

const texte = (data: FormData, cle: string) => String(data.get(cle) || "");

function rafraichir() {
  revalidatePath("/");
  revalidatePath("/admin/proprietes");
}

export async function sauvegarderPropriete(_: FormState, data: FormData): Promise<FormState> {
  await requireUser();
  const id = texte(data, "id") || null;
  const etat = texte(data, "etat");
  const fichier = data.get("photo");
  const photo = fichier instanceof File && fichier.size > 0 ? Buffer.from(await fichier.arrayBuffer()) : null;
  try {
    if (!estEtat(etat)) throw new Error("Choisissez si la propriété est vendue ou à vendre.");
    await enregistrerPropriete(
      id,
      {
        etat,
        mention: texte(data, "mention"),
        prix: nombreOuNull(data.get("prix")) ?? Number.NaN,
        prix_demande: nombreOuNull(data.get("prix_demande")),
        adresse: texte(data, "adresse"),
        ville: texte(data, "ville"),
        type_propriete: texte(data, "type_propriete"),
        superficie: nombreOuNull(data.get("superficie")),
        chambres: nombreOuNull(data.get("chambres")),
        salles_de_bain: nombreOuNull(data.get("salles_de_bain")),
        publie: data.get("publie") === "on",
      },
      photo,
    );
  } catch (erreur) {
    return { error: erreur instanceof Error ? erreur.message : "Enregistrement impossible." };
  }
  rafraichir();
  redirect("/admin/proprietes");
}

export async function retirerPropriete(data: FormData) {
  await requireUser();
  await supprimerPropriete(texte(data, "id"));
  rafraichir();
  redirect("/admin/proprietes");
}

export async function changerOrdre(data: FormData) {
  await requireUser();
  await deplacerPropriete(texte(data, "id"), texte(data, "sens") === "haut" ? -1 : 1);
  rafraichir();
}
