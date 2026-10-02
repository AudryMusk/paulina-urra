"use server";

import { erreurEtape, NOMBRE_QUESTIONS, type ErreurCle, type Reponses } from "@/lib/evaluation";
import { consumeLimit } from "@/lib/backoffice/db";
import { hashToken } from "@/lib/backoffice/identity";
import { addNote, createLead, getLeadBySubmissionKey, recordBooking } from "@/lib/backoffice/store";
import { fuseauValide, lireCreneaux, reserver, typeRendezVous, type EchecReservation } from "@/lib/meetlyio";
import { destinataires, notifierNouvelleDemande } from "@/lib/notification";

type Resultat =
  { ok: true; agenda: boolean } | { ok: false; erreur: ErreurCle | "limite" | "enregistrement" | "envoi" };

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
    if (erreur) return { ok: false, erreur };
  }

  let demande: { id: string; nouveau: boolean };
  try {
    const autorise =
      (await consumeLimit("demande:" + hashToken(reponses.courriel.toLowerCase()), 10, 60 * 60_000)) &&
      (await consumeLimit("demande:global", 500, 60 * 60_000));
    if (!autorise) return { ok: false, erreur: "limite" };
    demande = await createLead(reponses, cleEnvoi);
  } catch (erreur) {
    console.error("Enregistrement de la demande impossible", erreur);
    return { ok: false, erreur: "enregistrement" };
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
      return { ok: false, erreur: "envoi" };
    }
  }

  return { ok: true, agenda: typeRendezVous() !== null };
}

// Agenda Meetlyio : le client choisit son appel juste après l'envoi. La clé d'envoi, connue
// du seul navigateur qui a soumis la demande, sert à retrouver son dossier.

export async function lireDisponibilites(cleEnvoi: string, fuseau: string): Promise<string[] | null> {
  try {
    const demande = await getLeadBySubmissionKey(cleEnvoi);
    const type = typeRendezVous();
    if (!demande || !type) return null;
    if (!(await consumeLimit("creneaux:" + demande.id, 60, 60 * 60_000))) return null;
    return await lireCreneaux(type, fuseauValide(fuseau));
  } catch (erreur) {
    console.error("Lecture des disponibilités impossible", erreur);
    return null;
  }
}

export async function reserverAppel(
  cleEnvoi: string,
  debut: string,
  fuseau: string,
): Promise<{ ok: true; debut: string; hote: string } | { ok: false; erreur: EchecReservation }> {
  if (typeof debut !== "string" || debut.length > 40 || Number.isNaN(Date.parse(debut))) {
    return { ok: false, erreur: "indisponible" };
  }
  try {
    const demande = await getLeadBySubmissionKey(cleEnvoi);
    const type = typeRendezVous();
    if (!demande || !type) return { ok: false, erreur: "indisponible" };
    if (!(await consumeLimit("reservation:" + demande.id, 10, 60 * 60_000))) return { ok: false, erreur: "limite" };
    const resultat = await reserver(type, {
      cle: "site-urra-rauda:" + demande.id,
      debut,
      reponses: demande.answers,
      fuseau: fuseauValide(fuseau),
    });
    if (!resultat.ok) return resultat;
    await recordBooking(demande.id, resultat.reservation).catch((erreur) =>
      console.error("Rendez-vous non inscrit au dossier", erreur),
    );
    return { ok: true, debut: resultat.reservation.debut, hote: resultat.reservation.hote };
  } catch (erreur) {
    console.error("Réservation impossible", erreur);
    return { ok: false, erreur: "indisponible" };
  }
}
