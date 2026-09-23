import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { requireUser } from "@/lib/backoffice/auth";
import { listLeads, summary } from "@/lib/backoffice/store";
import { statuses } from "@/lib/backoffice/model";
import { AdminShell, DateLabel } from "./shell";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const params = await searchParams;
  const value = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const q = value("q").slice(0, 120),
    status = value("status"),
    owner = value("owner");
  const result = await listLeads({ q, status, owner, page: Number(value("page")) || 1 });
  const stats = await summary();
  const href = (page: number) => "/admin?" + new URLSearchParams({ q, status, owner, page: String(page) });
  return (
    <AdminShell>
      <header className="bo-heading">
        <div>
          <p className="bo-eyebrow">VOTRE ESPACE DE TRAVAIL</p>
          <h1>Les demandes de l’équipe</h1>
          <p className="bo-muted">Un dossier partagé, un prochain contact clair.</p>
        </div>
      </header>
      <div className="bo-stats">
        <Link href="/admin?status=nouveau">
          <span>Nouvelles demandes</span>
          <strong>{stats.fresh}</strong>
        </Link>
        <Link href="/admin?owner=sans">
          <span>Dossiers à attribuer</span>
          <strong>{stats.unassigned}</strong>
        </Link>
      </div>
      <section className="bo-panel">
        <form className="bo-filters" action="/admin">
          <label className="bo-search">
            <span>Rechercher un dossier</span>
            <div>
              <Search size={18} />
              <input name="q" defaultValue={q} maxLength={120} placeholder="Nom, courriel ou adresse" />
            </div>
          </label>
          <label>
            Statut
            <select name="status" defaultValue={status}>
              <option value="">Tous les statuts</option>
              {Object.entries(statuses).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Responsable
            <select name="owner" defaultValue={owner}>
              <option value="">Toute l’équipe</option>
              <option>Paulina</option>
              <option>Denis</option>
              <option value="sans">À attribuer</option>
            </select>
          </label>
          <button className="bo-button bo-secondary">Filtrer</button>
        </form>
        <div className="bo-list-title">
          <h2>Demandes reçues</h2>
          <span>
            {result.count} résultat{result.count > 1 ? "s" : ""}
          </span>
        </div>
        {result.items.length ? (
          <div className="bo-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client / propriété</th>
                  <th>Statut</th>
                  <th>Responsable</th>
                  <th>Prochaine action</th>
                  <th>Reçue le</th>
                  <th>
                    <span className="bo-sr">Ouvrir</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <Link className="bo-client" href={`/admin/dossiers/${lead.id}`}>
                        {lead.answers.nom}
                      </Link>
                      <small>{lead.answers.adresse}</small>
                    </td>
                    <td>
                      <span className={`bo-badge bo-status-${lead.status}`}>{statuses[lead.status]}</span>
                    </td>
                    <td>{lead.owner || <span className="bo-muted">À attribuer</span>}</td>
                    <td className="bo-next">{lead.next_action || "À définir"}</td>
                    <td>
                      <DateLabel value={lead.created_at} />
                    </td>
                    <td>
                      <Link
                        href={`/admin/dossiers/${lead.id}`}
                        className="bo-icon-button"
                        aria-label={`Ouvrir le dossier de ${lead.answers.nom}`}
                      >
                        <ArrowRight size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bo-empty">
            <h3>{q || status || owner ? "Aucun dossier ne correspond." : "Votre prochain projet commence ici."}</h3>
            <p>
              {q || status || owner
                ? "Essayez d’autres critères de recherche."
                : "Les demandes envoyées depuis le formulaire d’évaluation apparaîtront automatiquement dans cet espace."}
            </p>
            {(q || status || owner) && <Link href="/admin">Réinitialiser les filtres</Link>}
          </div>
        )}
        <div className="bo-pagination">
          <span>
            Page {result.page} sur {result.pages}
          </span>
          <div>
            {result.page > 1 && <Link href={href(result.page - 1)}>Précédente</Link>}
            {result.page < result.pages && <Link href={href(result.page + 1)}>Suivante</Link>}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
