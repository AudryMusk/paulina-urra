import Link from "next/link";
export default function MissingFile() {
  return (
    <main className="bo-login">
      <section className="bo-login-card">
        <h1>Dossier introuvable.</h1>
        <Link href="/admin">Retour aux demandes</Link>
      </section>
    </main>
  );
}
