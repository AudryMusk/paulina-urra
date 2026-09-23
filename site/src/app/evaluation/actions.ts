"use server";

import { erreurEtape, NOMBRE_QUESTIONS, type Reponses } from "@/lib/evaluation";
import { consumeLimit } from "@/lib/backoffice/db";
import { hashToken } from "@/lib/backoffice/identity";
import { externalUrl } from "@/lib/backoffice/model";
import { addNote, createLead } from "@/lib/backoffice/store";
import { destinataires, notifierNouvelleDemande } from "@/lib/notification";

type Resultat = { ok: true; rdvUrl: string | null } | { ok: false; message: string };

const texte = (v: unknown) => (typeof v === "string" ? v : "");
const nombre = (v: unknown) => (typeof v === "number" ? v : -1);

function normaliser(entree: unknown): Reponses {
  const r = (typeof entree === "object" && entree !== null ? entree : {}) as Record<string, unknown>;
  return {
    typePropriete: texte(r.typePropriete),
    adresse: texte(r.adresse).trim(),
    chambres: nombre(r.chambres),
    sallesDeBain: nombre(r.sallesDeBain),
    stationnement: nombre(r.stationnement),
    superficie: texte(r.superficie),
    etat: texte(r.etat),
    echeancier: texte(r.echeancier),
    nom: texte(r.nom).trim(),
    courriel: texte(r.courriel).trim(),
    telephone: texte(r.telephone).trim(),
    langue: texte(r.langue) as Reponses["langue"],
    courtier: texte(r.courtier) as Reponses["courtier"],
    consentement: r.consentement === true,
  };
}

export async function soumettreEvaluation(entree: Reponses, cleEnvoi: string): Promise<Resultat> {
  const reponses = normaliser(entree);
  for (let etape = 1; etape <= NOMBRE_QUESTIONS; etape++) {
    const erreur = erreurEtape(etape, reponses);
    if (erreur) return { ok: false, message: erreur };
  }

  let demande: { id: string; nouveau: boolean };
  try {
    const autorise =
      (await consumeLimit("demande:" + hashToken(reponses.courriel.toLowerCase()), 10, 60 * 60_000)) &&
      (await consumeLimit("demande:global", 500, 60 * 60_000));
    if (!autorise) return { ok: false, message: "Trop de demandes rapprochées. Réessayez plus tard ou appelez-nous." };
    demande = await createLead(reponses, cleEnvoi);
  } catch (erreur) {
    console.error("Enregistrement de la demande impossible", erreur);
    return { ok: false, message: "Votre demande n’a pas pu être enregistrée. Réessayez ou appelez-nous directement." };
  }

  if (demande.nouveau) {
    const envoi = await notifierNouvelleDemande(demande.id, reponses);
    if (envoi !== "non-configure") {
      const trace =
        envoi === "envoye"
          ? `Courriel de notification envoyé à ${destinataires().join(", ")}.`
          : "Le courriel de notification n’a pas pu être envoyé.";
      await addNote(demande.id, "Site", trace).catch((erreur) =>
        console.error("Trace de notification impossible", erreur),
      );
    }
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    const envoye = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...reponses, recuLe: new Date().toISOString() }),
    }).then(
      (reponse) => reponse.ok,
      () => false,
    );
    if (!envoye) {
      return { ok: false, message: "L'envoi a échoué. Réessayez ou appelez-nous directement." };
    }
  }

  const lienCourtier =
    reponses.courtier === "Paulina"
      ? process.env.CALNODE_PAULINA_BOOKING_URL
      : reponses.courtier === "Denis"
        ? process.env.CALNODE_DENIS_BOOKING_URL
        : undefined;
  const rdvUrl = externalUrl(lienCourtier) || externalUrl(process.env.CALNODE_BOOKING_URL || process.env.RDV_URL);
  return { ok: true, rdvUrl };
}
