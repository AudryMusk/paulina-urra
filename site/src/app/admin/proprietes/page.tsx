import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import { requireUser } from "@/lib/backoffice/auth";
import { listerProprietes } from "@/lib/backoffice/proprietes";
import { argent, etats } from "@/lib/proprietes-affichage";
import { AdminShell } from "../shell";
import { changerOrdre } from "./actions";

export default async function ProprietesPage() {
  await requireUser();
  const proprietes = await listerProprietes();
  return (
    <AdminShell actif="proprietes">
      <header className="bo-heading">
        <div>
          <p className="bo-eyebrow">SITE WEB</p>
          <h1>Les propriétés</h1>
          <p className="bo-muted">Les propriétés affichées apparaissent sur la page d’accueil, dans cet ordre.</p>
        </div>
        <Link href="/admin/proprietes/nouvelle" className="bo-button">
          <Plus size={18} />
          Ajouter une propriété
        </Link>
      </header>
      <section className="bo-panel">
        {proprietes.length ? (
          <div className="bo-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Propriété</th>
                  <th>Prix</th>
                  <th>Situation</th>
                  <th>Sur le site</th>
                  <th>Ordre</th>
                  <th>
                    <span className="bo-sr">Modifier</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {proprietes.map((p, i) => (
                  <tr key={p.id}>
                    <td>
                      <div className="bo-prop">
                        <Image src={`/photos/${p.photo_id}`} alt="" width={96} height={64} className="bo-prop-thumb" />
                        <div>
                          <Link className="bo-client" href={`/admin/proprietes/${p.id}`}>
                            {p.adresse}
                          </Link>
                          <small>{p.ville}</small>
                        </div>
                      </div>
                    </td>
                    <td>{argent(p.prix)}</td>
                    <td>
                      <span className={`bo-badge ${p.etat === "vendu" ? "bo-status-mandat" : "bo-status-nouveau"}`}>
                        {etats[p.etat]}
                      </span>
                      {p.mention && <small>{p.mention}</small>}
                    </td>
                    <td>{p.publie ? "Affichée" : <span className="bo-muted">Masquée</span>}</td>
                    <td>
                      <div className="bo-order">
                        {(["haut", "bas"] as const).map((sens) => (
                          <form key={sens} action={changerOrdre}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="sens" value={sens} />
                            <button
                              className="bo-icon-button"
                              disabled={sens === "haut" ? i === 0 : i === proprietes.length - 1}
                              aria-label={`Déplacer ${p.adresse} vers le ${sens}`}
                            >
                              {sens === "haut" ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                            </button>
                          </form>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Link
                        href={`/admin/proprietes/${p.id}`}
                        className="bo-icon-button"
                        aria-label={`Modifier ${p.adresse}`}
                      >
                        <Pencil size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bo-empty">
            <h3>Aucune propriété pour l’instant.</h3>
            <p>Ajoutez une première propriété : elle apparaîtra sur la page d’accueil du site.</p>
            <Link href="/admin/proprietes/nouvelle">Ajouter une propriété</Link>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
