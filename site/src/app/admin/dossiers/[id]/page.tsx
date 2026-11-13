import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { requireUser } from "@/lib/backoffice/auth";
import { activities, getLead } from "@/lib/backoffice/store";
import { statuses } from "@/lib/backoffice/model";
import { AdminShell, DateLabel } from "../../shell";
import { FollowupForm, NoteForm } from "../../forms";

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();
  const answer = lead.answers;
  const history = await activities(id);
  const property = [
    ["Type de propriété", answer.typePropriete],
    ["Adresse", answer.adresse],
    ["Chambres", String(answer.chambres)],
    ["Salles de bain", String(answer.sallesDeBain)],
    ["Stationnements", String(answer.stationnement)],
    ["Superficie", answer.superficie ? answer.superficie + " pi²" : "Non précisée"],
    ["État", answer.etat],
    ["Échéancier", answer.echeancier],
  ];
  return (
    <AdminShell actif="demandes">
      <Link href="/admin" className="bo-back">
        <ArrowLeft size={18} />
        Toutes les demandes
      </Link>
      <header className="bo-heading">
        <div>
          <p className="bo-eyebrow">DOSSIER CLIENT</p>
          <h1>{answer.nom}</h1>
          <p className="bo-muted">
            Demande reçue le <DateLabel value={lead.created_at} />
          </p>
        </div>
        <span className={`bo-badge bo-status-${lead.status}`}>{statuses[lead.status]}</span>
      </header>
      <div className="bo-detail-grid">
        <div className="bo-stack">
          <section className="bo-panel bo-pad">
            <h2>Coordonnées</h2>
            <div className="bo-contact">
              <a href={`mailto:${answer.courriel}`}>
                <Mail size={19} />
                {answer.courriel}
              </a>
              <a href={`tel:${answer.telephone.replace(/[^+\d]/g, "")}`}>
                <Phone size={19} />
                {answer.telephone}
              </a>
            </div>
            <dl className="bo-definition">
              <div>
                <dt>Langue préférée</dt>
                <dd>{answer.langue}</dd>
              </div>
              <div>
                <dt>Courtier demandé</dt>
                <dd>{answer.courtier}</dd>
              </div>
              <div>
                <dt>Consentement au contact</dt>
                <dd>Accepté lors de la demande</dd>
              </div>
            </dl>
          </section>
          <section className="bo-panel bo-pad">
            <h2>La propriété et le projet</h2>
            <dl className="bo-definition">
              {property.map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="bo-panel bo-pad">
            <h2>Notes et historique</h2>
            <NoteForm id={id} />
            <ol className="bo-timeline">
              {history.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.author}</strong>
                    <small>
                      <DateLabel value={item.created_at} />
                    </small>
                  </div>
                  <p>{item.body}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <div className="bo-stack">
          <section className="bo-panel bo-pad">
            <h2>Suivi du dossier</h2>
            <FollowupForm key={lead.version} lead={lead} />
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
