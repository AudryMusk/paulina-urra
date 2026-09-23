import Link from "next/link";
import { requireUser } from "@/lib/backoffice/auth";
import { reminders } from "@/lib/backoffice/store";
import { montrealToday } from "@/lib/backoffice/model";
import { AdminShell, DateLabel } from "../shell";
import { CompleteButton } from "../forms";

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const params = await searchParams;
  const owner = typeof params.owner === "string" ? params.owner : "";
  const completed = params.vue === "effectuees";
  const items = await reminders({ owner, completed });
  const today = montrealToday();
  const groups = completed
    ? [["Relances effectuées", items] as const]
    : [
        ["En retard", items.filter((item) => item.due_date < today)] as const,
        ["Aujourd’hui", items.filter((item) => item.due_date === today)] as const,
        ["À venir", items.filter((item) => item.due_date > today)] as const,
      ];
  return (
    <AdminShell active="relances">
      <header className="bo-heading">
        <div>
          <p className="bo-eyebrow">LES PROCHAINS CONTACTS</p>
          <h1>Les relances</h1>
          <p className="bo-muted">Les suivis à faire, partagés entre Paulina et Denis. Dates de Montréal.</p>
        </div>
      </header>
      <form className="bo-filters bo-panel" action="/admin/relances">
        <label>
          Responsable
          <select name="owner" defaultValue={owner}>
            <option value="">Toute l’équipe</option>
            <option>Paulina</option>
            <option>Denis</option>
          </select>
        </label>
        <label>
          Afficher
          <select name="vue" defaultValue={completed ? "effectuees" : "ouvertes"}>
            <option value="ouvertes">Relances ouvertes</option>
            <option value="effectuees">Relances effectuées</option>
          </select>
        </label>
        <button className="bo-button bo-secondary">Filtrer</button>
      </form>
      {items.length ? (
        groups
          .filter(([, tasks]) => tasks.length)
          .map(([title, tasks]) => (
            <section className="bo-panel bo-pad bo-reminder-group" key={title}>
              <h2>
                {title} <span className="bo-count">{tasks.length}</span>
              </h2>
              <ul className="bo-task-list">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <div>
                      <Link className="bo-client" href={`/admin/dossiers/${task.lead_id}`}>
                        {task.client}
                      </Link>
                      <p>{task.title}</p>
                      <small className={title === "En retard" ? "bo-overdue" : "bo-muted"}>
                        <DateLabel value={task.due_date} dateOnly /> · {task.owner}
                      </small>
                    </div>
                    {completed ? <span className="bo-badge">Effectuée</span> : <CompleteButton id={task.id} />}
                  </li>
                ))}
              </ul>
            </section>
          ))
      ) : (
        <section className="bo-panel bo-empty">
          <h2>{completed ? "Aucune relance effectuée." : "Tout est à jour."}</h2>
          <p>Vous pouvez planifier une relance depuis la fiche d’un dossier.</p>
          <Link href="/admin">Voir les dossiers</Link>
        </section>
      )}
    </AdminShell>
  );
}
