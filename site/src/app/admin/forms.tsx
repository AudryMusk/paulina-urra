"use client";

import { useActionState } from "react";
import { login, saveFollowup, saveNote, type FormState } from "./actions";
import { statuses } from "@/lib/backoffice/model";
import type { Lead } from "@/lib/backoffice/store";

function Feedback({ state }: { state: FormState }) {
  return (
    <div aria-live="polite">
      {state.error && (
        <p className="bo-error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && <p className="bo-success">{state.success}</p>}
    </div>
  );
}
export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="bo-form">
      <label>
        Courriel professionnel
        <input name="email" type="email" autoComplete="username" maxLength={254} required />
      </label>
      <label>
        Mot de passe
        <input name="password" type="password" autoComplete="current-password" maxLength={256} required />
      </label>
      <Feedback state={state} />
      <button className="bo-button" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
export function FollowupForm({ lead }: { lead: Lead }) {
  const [state, action, pending] = useActionState(saveFollowup, {});
  return (
    <form action={action} className="bo-form">
      <input type="hidden" name="id" value={lead.id} />
      <input type="hidden" name="version" value={lead.version} />
      <div className="bo-two">
        <label>
          Statut
          <select name="status" defaultValue={lead.status}>
            {Object.entries(statuses).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Responsable
          <select name="owner" defaultValue={lead.owner}>
            <option value="">À attribuer</option>
            <option>Paulina</option>
            <option>Denis</option>
          </select>
        </label>
      </div>
      <label>
        Prochaine action
        <input
          name="next_action"
          defaultValue={lead.next_action}
          maxLength={300}
          placeholder="Ex. Appeler pour préciser le projet"
        />
      </label>
      <Feedback state={state} />
      <button className="bo-button" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer le suivi"}
      </button>
    </form>
  );
}
export function NoteForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(saveNote, {});
  return (
    <form action={action} className="bo-form">
      <input type="hidden" name="id" value={id} />
      <label>
        Ajouter une note interne
        <textarea
          name="body"
          maxLength={4000}
          rows={3}
          placeholder="Résumé du dernier échange, information utile…"
          required
        />
      </label>
      <Feedback state={state} />
      <button className="bo-button bo-secondary" disabled={pending}>
        {pending ? "Enregistrement…" : "Ajouter la note"}
      </button>
    </form>
  );
}
