import type { Reponses } from "./evaluation";

const echapper = (texte: string) =>
  texte.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function destinataires() {
  return (process.env.COURRIEL_DESTINATAIRES || "")
    .split(",")
    .map((adresse) => adresse.trim())
    .filter(Boolean);
}

export async function notifierNouvelleDemande(id: string, r: Reponses): Promise<"envoye" | "echec" | "non-configure"> {
  const cle = process.env.RESEND_API_KEY;
  const expediteur = process.env.COURRIEL_EXPEDITEUR;
  const a = destinataires();
  if (!cle || !expediteur || !a.length) {
    console.warn(
      "Courriel de notification non configuré : RESEND_API_KEY, COURRIEL_EXPEDITEUR ou COURRIEL_DESTINATAIRES manquant.",
    );
    return "non-configure";
  }

  const site = process.env.SITE_URL || process.env.URL;
  const lienDossier = URL.canParse(`/admin/dossiers/${id}`, site)
    ? new URL(`/admin/dossiers/${id}`, site).toString()
    : null;
  const lignes: [string, string][] = [
    ["Téléphone", r.telephone],
    ["Courriel", r.courriel],
    ["Courtier demandé", r.courtier],
    ["Langue préférée", r.langue],
    ["Type de propriété", r.typePropriete],
    ["Adresse", r.adresse],
    ["Chambres · salles de bain · stationnement", `${r.chambres} · ${r.sallesDeBain} · ${r.stationnement}`],
    ["Superficie habitable", r.superficie ? `${r.superficie} pi²` : "Non précisée"],
    ["État", r.etat],
    ["Échéancier", r.echeancier],
  ];

  const html = `<div style="font-family:Arial,sans-serif;color:#131722;max-width:600px">
<p style="color:#e11b2f;font-size:12px;letter-spacing:2px;font-weight:bold">NOUVELLE DEMANDE D'ÉVALUATION</p>
<h1 style="font-size:24px;margin:0 0 16px">${echapper(r.nom)}</h1>
<table style="border-collapse:collapse;width:100%;font-size:14px">${lignes
    .map(
      ([cle, valeur]) =>
        `<tr><td style="padding:8px 12px 8px 0;border-top:1px solid #e3e5ea;color:#5b6170">${echapper(cle)}</td><td style="padding:8px 0;border-top:1px solid #e3e5ea">${echapper(valeur)}</td></tr>`,
    )
    .join("")}</table>
${lienDossier ? `<p style="margin-top:24px"><a href="${echapper(lienDossier)}" style="background:#e11b2f;color:#fff;padding:12px 18px;text-decoration:none;font-weight:bold">Ouvrir le dossier</a></p>` : ""}
<p style="color:#5b6170;font-size:12px;margin-top:24px">Répondez directement à ce courriel pour écrire au client.</p>
</div>`;

  const texte = [
    `Nouvelle demande d'évaluation : ${r.nom}`,
    "",
    ...lignes.map(([cle, valeur]) => `${cle} : ${valeur}`),
    ...(lienDossier ? ["", `Dossier : ${lienDossier}`] : []),
  ].join("\n");

  const reponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: expediteur,
      to: a,
      reply_to: r.courriel,
      subject: `Nouvelle demande d'évaluation : ${r.nom.replace(/[\r\n]+/g, " ")}`,
      html,
      text: texte,
    }),
    signal: AbortSignal.timeout(8000),
  }).catch((erreur) => {
    console.error("Envoi du courriel de notification impossible", erreur);
    return null;
  });
  if (reponse && !reponse.ok) console.error("Resend a refusé le courriel", reponse.status, await reponse.text());
  return reponse?.ok ? "envoye" : "echec";
}
