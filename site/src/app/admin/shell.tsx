import Link from "next/link";
import { ArrowUpRight, House, Inbox, LogOut } from "lucide-react";
import { requireUser } from "@/lib/backoffice/auth";
import { externalUrl } from "@/lib/backoffice/model";
import { logout } from "./actions";

export async function AdminShell({ actif, children }: { actif: "demandes" | "proprietes"; children: React.ReactNode }) {
  const user = await requireUser();
  const agenda = externalUrl(process.env.CALNODE_ADMIN_URL);
  return (
    <div className="bo-shell">
      <a className="bo-skip" href="#contenu">
        Aller au contenu
      </a>
      <aside className="bo-sidebar">
        <Link href="/admin" className="bo-brand">
          <span>ÉQUIPE</span>
          <strong>URRA-RAUDA</strong>
          <small>Espace courtiers</small>
        </Link>
        <nav aria-label="Navigation du back-office">
          <Link href="/admin" aria-current={actif === "demandes" ? "page" : undefined}>
            <Inbox size={20} />
            Demandes
          </Link>
          <Link href="/admin/proprietes" aria-current={actif === "proprietes" ? "page" : undefined}>
            <House size={20} />
            Propriétés
          </Link>
          {agenda && (
            <a href={agenda} target="_blank" rel="noreferrer">
              Agenda Calnode
              <ArrowUpRight size={18} />
              <span className="bo-sr"> (nouvel onglet)</span>
            </a>
          )}
        </nav>
        <div className="bo-account">
          <span className="bo-avatar">{user.name.slice(0, 1)}</span>
          <div>
            <strong>{user.name}</strong>
            <small>Équipe Urra-Rauda</small>
          </div>
          <form action={logout}>
            <button className="bo-icon-button" aria-label="Se déconnecter">
              <LogOut size={19} />
            </button>
          </form>
        </div>
      </aside>
      <main id="contenu" className="bo-main">
        {children}
      </main>
    </div>
  );
}
export function DateLabel({ value }: { value: string }) {
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("fr-CA", {
        timeZone: "America/Toronto",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))}
    </time>
  );
}
