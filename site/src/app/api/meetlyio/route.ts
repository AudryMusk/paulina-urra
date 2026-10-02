import { applyBookingEvent } from "@/lib/backoffice/store";
import { lireEvenement, secretsWebhook, signatureValide } from "@/lib/meetlyio";

// Webhook Meetlyio : annulations, déplacements et réattributions des appels réservés sur le site.
// Une réponse hors 2xx fait renvoyer la livraison (3 tentatives en tout).
export async function POST(requete: Request) {
  const secrets = secretsWebhook();
  if (!secrets.length) return Response.json({ erreur: "Webhook non configuré." }, { status: 503 });

  const corps = await requete.text();
  if (corps.length > 65_536) return Response.json({ erreur: "Corps trop volumineux." }, { status: 413 });
  if (!signatureValide(corps, requete.headers.get("x-calnode-signature"), secrets)) {
    return Response.json({ erreur: "Signature invalide." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(corps);
  } catch {
    return Response.json({ erreur: "JSON invalide." }, { status: 400 });
  }
  const evenement = lireEvenement(json, requete.headers.get("x-calnode-delivery"));
  if (!evenement) return Response.json({ resultat: "ignore" });

  try {
    return Response.json({ resultat: await applyBookingEvent(evenement) });
  } catch (erreur) {
    console.error("Webhook Meetlyio non appliqué", erreur);
    return Response.json({ erreur: "Enregistrement impossible." }, { status: 500 });
  }
}
