import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/backoffice/auth";
import { LoginForm } from "../forms";

export default async function LoginPage() {
  if (await currentUser()) redirect("/admin");
  return (
    <main className="bo-login">
      <section className="bo-login-card">
        <p className="bo-eyebrow">ÉQUIPE URRA-RAUDA</p>
        <h1>Heureux de vous retrouver.</h1>
        <p className="bo-muted">Connectez-vous pour retrouver vos demandes et les prochains suivis de l’équipe.</p>
        <LoginForm />
        <Link href="/">Retour au site</Link>
      </section>
    </main>
  );
}
