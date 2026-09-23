"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="bo-login">
      <section className="bo-login-card">
        <h1>Le chargement a échoué.</h1>
        <p>Réessayez dans quelques instants. Vos informations déjà enregistrées sont conservées.</p>
        <button className="bo-button" onClick={reset}>
          Réessayer
        </button>
      </section>
    </main>
  );
}
