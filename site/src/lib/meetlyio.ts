import { createHmac, timingSafeEqual } from "node:crypto";
import { externalUrl } from "./backoffice/model";
import type { BookingEvent } from "./backoffice/store";
import type { Reponses } from "./evaluation";

// Client de l'API publique de Meetlyio (agenda de l'équipe). Appelé uniquement côté serveur :
// les coordonnées du client viennent de la base, jamais du navigateur.

export const FUSEAU_EQUIPE = "America/Toronto";
const JOURS_PROPOSES = 21;
const DELAI_MS = 8000;

const languesMeetlyio: Record<Reponses["langue"], string> = { Français: "fr-CA", English: "en", Español: "es" };

export type EchecReservation = "pris" | "deja" | "limite" | "indisponible";
export type Reservation = { reference: string; debut: string; hote: string };

function adresseEspace() {
  const url = externalUrl(process.env.MEETLYIO_URL);
  return url ? url.replace(/\/+$/, "") : null;
}

export function adminMeetlyio() {
  const espace = adresseEspace();
  return espace ? espace + "/admin/" : null;
}

/** Type de rendez-vous de l'équipe (tourniquet Paulina / Denis). Null si l'agenda n'est pas configuré. */
export function typeRendezVous(): string | null {
  const type = process.env.MEETLYIO_TYPE;
  return adresseEspace() && type && /^[a-z0-9-]{1,100}$/i.test(type) ? type : null;
}

export function fuseauValide(fuseau: unknown): string {
  if (typeof fuseau === "string" && fuseau.length <= 64) {
    try {
      new Intl.DateTimeFormat("en", { timeZone: fuseau });
      return fuseau;
    } catch {}
  }
  return FUSEAU_EQUIPE;
}

const jourDans = (date: Date, fuseau: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: fuseau, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

function appel(chemin: string, init: RequestInit = {}) {
  return fetch(adresseEspace() + chemin, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(DELAI_MS),
    headers: { Accept: "application/json", ...init.headers },
  });
}

/** Débuts des créneaux libres (ISO 8601) des trois prochaines semaines. */
export async function lireCreneaux(type: string, fuseau: string): Promise<string[]> {
  const maintenant = new Date();
  const du = jourDans(maintenant, fuseau);
  const au = jourDans(new Date(maintenant.getTime() + JOURS_PROPOSES * 86_400_000), fuseau);
  const reponse = await appel(
    `/v1/event-types/${encodeURIComponent(type)}/slots?from=${du}&to=${au}&tz=${encodeURIComponent(fuseau)}`,
  );
  if (!reponse.ok) throw new Error(`Meetlyio a refusé la lecture des créneaux (${reponse.status}).`);
  const corps = (await reponse.json()) as { slots?: { start?: unknown }[] };
  return (corps.slots ?? []).map((s) => s.start).filter((s): s is string => typeof s === "string");
}

export async function reserver(
  type: string,
  rdv: { cle: string; debut: string; reponses: Reponses; fuseau: string },
): Promise<{ ok: true; reservation: Reservation } | { ok: false; erreur: EchecReservation }> {
  // Le numéro n'est accepté que si le type de rendez-vous propose l'appel téléphonique.
  const infos = await appel(`/v1/event-types/${encodeURIComponent(type)}/public`);
  const avecTelephone = infos.ok && ((await infos.json()) as { allow_phone_call?: boolean }).allow_phone_call === true;

  const reponse = await appel("/v1/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": rdv.cle },
    body: JSON.stringify({
      event_type_slug: type,
      start_at: new Date(rdv.debut).toISOString().replace(/\.\d{3}Z$/, "Z"),
      name: rdv.reponses.nom,
      email: rdv.reponses.courriel,
      ...(avecTelephone && { phone: rdv.reponses.telephone }),
      timezone: rdv.fuseau,
      language: languesMeetlyio[rdv.reponses.langue] ?? "fr-CA",
    }),
  });
  const corps = (await reponse.json().catch(() => ({}))) as {
    id?: string;
    start_at?: string;
    hosts?: { name?: string }[];
    error?: string;
  };

  if (reponse.status === 201 && corps.id && corps.start_at) {
    return { ok: true, reservation: { reference: corps.id, debut: corps.start_at, hote: corps.hosts?.[0]?.name ?? "" } };
  }
  // Même clé : 409 = réservation de ce dossier encore en cours (réessayer rejoue la réponse),
  // 422 = ce dossier a déjà réservé un autre créneau.
  if (reponse.status === 409) {
    return { ok: false, erreur: corps.error?.includes("Idempotency-Key") ? "indisponible" : "pris" };
  }
  if (reponse.status === 422 && corps.error?.includes("Idempotency-Key")) return { ok: false, erreur: "deja" };
  if (reponse.status === 429) return { ok: false, erreur: "limite" };
  console.error("Réservation Meetlyio refusée", reponse.status, corps.error);
  return { ok: false, erreur: "indisponible" };
}

// Webhooks Meetlyio. Un webhook appartient à un hôte : Paulina et Denis en créent chacun un,
// avec son propre secret. MEETLYIO_WEBHOOK_SECRET les liste, séparés par des virgules.

export function secretsWebhook() {
  return (process.env.MEETLYIO_WEBHOOK_SECRET ?? "")
    .split(",")
    .map((secret) => secret.trim())
    .filter((secret) => /^[0-9a-f]{64}$/i.test(secret));
}

/** X-Calnode-Signature : "sha256=" + HMAC-SHA256 du corps brut, avec le secret décodé de l'hexadécimal. */
export function signatureValide(corps: string, signature: string | null, secrets: string[]) {
  const recue = /^sha256=([0-9a-f]{64})$/i.exec(signature ?? "")?.[1];
  if (!recue) return false;
  const attendue = Buffer.from(recue, "hex");
  return secrets.some((secret) =>
    timingSafeEqual(createHmac("sha256", Buffer.from(secret, "hex")).update(corps).digest(), attendue),
  );
}

const texte = (v: unknown) => (typeof v === "string" ? v : undefined);
const instant = (v: unknown) => {
  const t = texte(v);
  return t && !Number.isNaN(Date.parse(t)) ? t : undefined;
};

/** Événement utile au site, ou null pour ceux qu'il ignore (booking.created, format inattendu). */
export function lireEvenement(corps: unknown, livraison: string | null): BookingEvent | null {
  const enveloppe = (typeof corps === "object" && corps !== null ? corps : {}) as Record<string, unknown>;
  const data = (typeof enveloppe.data === "object" && enveloppe.data !== null ? enveloppe.data : {}) as Record<
    string,
    unknown
  >;
  const type = enveloppe.event;
  const reference = texte(data.id);
  const debut = instant(data.start_at);
  if ((type !== "booking.cancelled" && type !== "booking.rescheduled") || !reference || !debut) return null;
  const idLivraison =
    livraison && /^[\w-]{1,100}$/.test(livraison) ? livraison : `${type}:${reference}:${texte(enveloppe.created_at)}`;
  return {
    livraison: idLivraison,
    type,
    reference,
    debut,
    ancienDebut: instant(data.previous_start_at),
    hote: texte(data.host_name),
    motif: texte(data.cancellation_reason)?.slice(0, 500),
  };
}
