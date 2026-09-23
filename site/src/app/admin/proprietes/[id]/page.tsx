import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/backoffice/auth";
import { lirePropriete } from "@/lib/backoffice/proprietes";
import { AdminShell } from "../../shell";
import { retirerPropriete } from "../actions";
import { BoutonSupprimer } from "../BoutonSupprimer";
import { FormulairePropriete } from "../FormulairePropriete";

export default async function ModifierProprietePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const propriete = await lirePropriete(id);
  if (!propriete) notFound();
  return (
    <AdminShell actif="proprietes">
      <Link href="/admin/proprietes" className="bo-back">
        <ArrowLeft size={18} />
        Toutes les propriétés
      </Link>
      <header className="bo-heading">
        <div>
          <p className="bo-eyebrow">SITE WEB</p>
          <h1>{propriete.adresse}</h1>
          <p className="bo-muted">{propriete.ville}</p>
        </div>
      </header>
      <section className="bo-panel bo-pad bo-narrow">
        <FormulairePropriete propriete={propriete} />
      </section>
      <section className="bo-panel bo-pad bo-narrow bo-danger-zone">
        <h2>Retirer la propriété</h2>
        <p className="bo-muted">
          Elle disparaît du site et du back-office, avec sa photo. Pour la cacher temporairement, décochez plutôt «
          Afficher sur le site ».
        </p>
        <form action={retirerPropriete}>
          <input type="hidden" name="id" value={propriete.id} />
          <BoutonSupprimer />
        </form>
      </section>
    </AdminShell>
  );
}
