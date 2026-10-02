import { randomUUID } from "node:crypto";
import type { Reponses } from "../evaluation";
import { erreurEtape, NOMBRE_QUESTIONS } from "../evaluation";
import { query, transaction, type Query } from "./db";
import { owners, statuses, type Owner, type Status } from "./model";

export type Lead = {
  id: string;
  answers: Reponses;
  status: Status;
  owner: Owner;
  next_action: string;
  version: number;
  created_at: string;
  updated_at: string;
};
export type Activity = { id: string; author: string; body: string; created_at: string };
export class Conflict extends Error {}

const LEAD_COLUMNS = "id, answers, status, owner, next_action, version, created_at, updated_at";

async function history(q: Query, id: string, author: string, body: string) {
  await q("INSERT INTO activities(id, lead_id, author, body, created_at) VALUES ($1, $2, $3, $4, $5)", [
    randomUUID(),
    id,
    author,
    body,
    new Date().toISOString(),
  ]);
}

export async function createLead(answers: Reponses, submissionKey: string) {
  for (let step = 1; step <= NOMBRE_QUESTIONS; step++) {
    const error = erreurEtape(step, answers);
    if (error) throw new Error(error);
  }
  if (!/^[0-9a-f-]{36}$/i.test(submissionKey)) throw new Error("Référence d’envoi invalide.");
  return transaction(async (q) => {
    const now = new Date().toISOString();
    const owner = answers.courtier === "Peu importe" ? "" : answers.courtier;
    const [created] = await q<{ id: string }>(
      `INSERT INTO leads(id, answers, owner, created_at, updated_at, submission_key) VALUES ($1, $2, $3, $4, $4, $5)
       ON CONFLICT (submission_key) DO NOTHING RETURNING id`,
      [randomUUID(), JSON.stringify(answers), owner, now, submissionKey],
    );
    if (!created) {
      const [existing] = await q<{ id: string }>("SELECT id FROM leads WHERE submission_key = $1", [submissionKey]);
      return { id: existing.id, nouveau: false };
    }
    await history(q, created.id, "Formulaire du site", "Demande reçue. Consentement au contact enregistré.");
    return { id: created.id, nouveau: true };
  });
}

export async function getLeadBySubmissionKey(submissionKey: string): Promise<Lead | null> {
  if (!/^[0-9a-f-]{36}$/i.test(submissionKey)) return null;
  const [lead] = await query<Lead>(`SELECT ${LEAD_COLUMNS} FROM leads WHERE submission_key = $1`, [submissionKey]);
  return lead || null;
}

const quandQuebec = (iso: string) =>
  new Intl.DateTimeFormat("fr-CA", { dateStyle: "full", timeStyle: "short", timeZone: "America/Toronto" }).format(
    new Date(iso),
  ) + " (heure du Québec)";

const appelQuebec = (iso: string) =>
  "Appel : " +
  new Intl.DateTimeFormat("fr-CA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Toronto",
  }).format(new Date(iso));

const courtierNomme = (hote: string | undefined) => owners.find((o) => o && hote?.startsWith(o));

// Rendez-vous pris par le client dans l'agenda Meetlyio. La note porte la référence de la
// réservation comme identifiant : une même réservation n'est enregistrée qu'une fois, et les
// webhooks de Meetlyio retrouvent le dossier par cette note.
export async function recordBooking(id: string, booking: { reference: string; debut: string; hote: string }) {
  return transaction(async (q) => {
    const [lead] = await q<Lead>(`SELECT ${LEAD_COLUMNS} FROM leads WHERE id = $1 FOR UPDATE`, [id]);
    if (!lead) throw new Error("Dossier introuvable.");
    const now = new Date().toISOString();
    const [note] = await q<{ id: string }>(
      `INSERT INTO activities(id, lead_id, author, body, created_at) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      [
        "meetlyio:" + booking.reference,
        id,
        "Site",
        `Rendez-vous réservé par le client : ${quandQuebec(booking.debut)}` +
          (booking.hote ? `, avec ${booking.hote}` : "") +
          `. Référence Meetlyio : ${booking.reference}.`,
        now,
      ],
    );
    if (!note) return;
    const owner = courtierNomme(booking.hote) || lead.owner;
    const status: Status = lead.status === "nouveau" || lead.status === "contacte" ? "rendez_vous" : lead.status;
    await q(
      "UPDATE leads SET status = $1, owner = $2, next_action = $3, updated_at = $4, version = version + 1 WHERE id = $5",
      [status, owner, appelQuebec(booking.debut), now, id],
    );
  });
}

export type BookingEvent = {
  livraison: string;
  type: "booking.cancelled" | "booking.rescheduled";
  reference: string;
  debut: string;
  ancienDebut?: string;
  hote?: string;
  motif?: string;
};

// Annulation, déplacement ou réattribution reçus du webhook Meetlyio. L'identifiant de
// livraison sert d'identifiant à la note : une livraison renvoyée n'est appliquée qu'une fois.
export async function applyBookingEvent(e: BookingEvent): Promise<"applique" | "deja" | "inconnu"> {
  return transaction(async (q) => {
    const [lien] = await q<{ lead_id: string }>("SELECT lead_id FROM activities WHERE id = $1", [
      "meetlyio:" + e.reference,
    ]);
    if (!lien) return "inconnu";
    const [lead] = await q<Lead>(`SELECT ${LEAD_COLUMNS} FROM leads WHERE id = $1 FOR UPDATE`, [lien.lead_id]);
    if (!lead) return "inconnu";

    let { status, owner, next_action } = lead;
    let body: string;
    if (e.type === "booking.cancelled") {
      body = `Rendez-vous annulé : ${quandQuebec(e.debut)}.` + (e.motif ? ` Motif : ${e.motif}` : "");
      if (status === "rendez_vous") status = "nouveau";
      next_action = "Rappeler le client : son appel a été annulé";
    } else if (e.ancienDebut) {
      body = `Rendez-vous déplacé par le client : ${quandQuebec(e.ancienDebut)} → ${quandQuebec(e.debut)}.`;
      next_action = appelQuebec(e.debut);
    } else {
      body = "Rendez-vous réattribué" + (e.hote ? ` à ${e.hote}` : "") + ` : ${quandQuebec(e.debut)}.`;
      owner = courtierNomme(e.hote) || owner;
    }

    const now = new Date().toISOString();
    const [note] = await q<{ id: string }>(
      `INSERT INTO activities(id, lead_id, author, body, created_at) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      ["meetlyio-livraison:" + e.livraison, lead.id, "Meetlyio", body.slice(0, 4000), now],
    );
    if (!note) return "deja";
    await q(
      "UPDATE leads SET status = $1, owner = $2, next_action = $3, updated_at = $4, version = version + 1 WHERE id = $5",
      [status, owner, next_action, now, lead.id],
    );
    return "applique";
  });
}

export async function getLead(id: string): Promise<Lead | null> {
  const [lead] = await query<Lead>(`SELECT ${LEAD_COLUMNS} FROM leads WHERE id = $1`, [id]);
  return lead || null;
}

export async function listLeads(filters: { q?: string; status?: string; owner?: string; page?: number } = {}) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  const param = (value: unknown) => {
    params.push(value);
    return "$" + params.length;
  };
  if (filters.q) {
    const motif = param("%" + filters.q.slice(0, 120).replace(/[\\%_]/g, "\\$&") + "%");
    clauses.push(
      `(answers->>'nom' ILIKE ${motif} OR answers->>'courriel' ILIKE ${motif} OR answers->>'adresse' ILIKE ${motif})`,
    );
  }
  if (filters.status && Object.hasOwn(statuses, filters.status)) clauses.push("status = " + param(filters.status));
  if (filters.owner && ["Paulina", "Denis", "sans"].includes(filters.owner)) {
    clauses.push("owner = " + param(filters.owner === "sans" ? "" : filters.owner));
  }
  const where = clauses.length ? " WHERE " + clauses.join(" AND ") : "";
  const [{ total }] = await query<{ total: number }>("SELECT count(*)::int AS total FROM leads" + where, params);
  const pages = Math.max(1, Math.ceil(total / 30));
  const page = Math.min(pages, Math.max(1, Math.floor(filters.page || 1)));
  const items = await query<Lead>(
    `SELECT ${LEAD_COLUMNS} FROM leads${where} ORDER BY created_at DESC, id DESC LIMIT 30 OFFSET ${param((page - 1) * 30)}`,
    params,
  );
  return { items, count: total, page, pages };
}

export async function updateLead(
  id: string,
  version: number,
  values: { status: string; owner: string; next_action: string },
  author: string,
) {
  if (
    !Object.hasOwn(statuses, values.status) ||
    !owners.includes(values.owner as Owner) ||
    values.next_action.length > 300
  ) {
    throw new Error("Vérifiez les informations du suivi.");
  }
  const nextAction = values.next_action.trim();
  return transaction(async (q) => {
    const [previous] = await q<Lead>(`SELECT ${LEAD_COLUMNS} FROM leads WHERE id = $1 FOR UPDATE`, [id]);
    if (!previous) throw new Error("Dossier introuvable.");
    if (previous.version !== version) {
      throw new Conflict("Le dossier a changé depuis son ouverture. Actualisez la page avant de réessayer.");
    }
    await q(
      "UPDATE leads SET status = $1, owner = $2, next_action = $3, updated_at = $4, version = version + 1 WHERE id = $5",
      [values.status, values.owner, nextAction, new Date().toISOString(), id],
    );
    const changes = [];
    if (previous.status !== values.status) changes.push("Statut : " + statuses[values.status as Status]);
    if (previous.owner !== values.owner) changes.push("Responsable : " + (values.owner || "À attribuer"));
    if (previous.next_action !== nextAction) changes.push("Prochaine action : " + (nextAction || "Aucune"));
    if (changes.length) await history(q, id, author, changes.join(" · "));
  });
}

export async function addNote(id: string, author: string, body: string) {
  if (!body.trim() || body.length > 4000) throw new Error("La note doit contenir entre 1 et 4 000 caractères.");
  return transaction(async (q) => {
    const [lead] = await q<{ id: string }>("SELECT id FROM leads WHERE id = $1", [id]);
    if (!lead) throw new Error("Dossier introuvable.");
    await history(q, id, author, body.trim());
  });
}

export async function activities(id: string) {
  return query<Activity>(
    "SELECT id, author, body, created_at FROM activities WHERE lead_id = $1 ORDER BY created_at DESC, seq DESC LIMIT 100",
    [id],
  );
}

export async function summary() {
  const [row] = await query<{ fresh: number; unassigned: number }>(
    `SELECT
       (SELECT count(*)::int FROM leads WHERE status = 'nouveau') AS fresh,
       (SELECT count(*)::int FROM leads WHERE owner = '' AND status NOT IN ('mandat', 'cloture')) AS unassigned`,
  );
  return row;
}
