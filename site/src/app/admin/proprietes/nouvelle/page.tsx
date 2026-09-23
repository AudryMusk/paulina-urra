import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/backoffice/auth";
import { AdminShell } from "../../shell";
import { FormulairePropriete } from "../FormulairePropriete";

export default async function NouvelleProprietePage() {
  await requireUser();
  return (
    <AdminShell actif="proprietes">
      <Link href="/admin/proprietes" className="bo-back">
        <ArrowLeft size={18} />
        Toutes les propriétés
      </Link>
      <header className="bo-heading">
        <div>
          <p className="bo-eyebrow">SITE WEB</p>
          <h1>Nouvelle propriété</h1>
        </div>
      </header>
      <section className="bo-panel bo-pad bo-narrow">
        <FormulairePropriete />
      </section>
    </AdminShell>
  );
}
