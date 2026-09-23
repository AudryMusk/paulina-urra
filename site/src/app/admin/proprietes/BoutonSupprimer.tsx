"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

export function BoutonSupprimer() {
  const { pending } = useFormStatus();
  return (
    <button
      className="bo-button bo-danger"
      disabled={pending}
      onClick={(ev) => {
        if (!confirm("Retirer définitivement cette propriété et sa photo ?")) ev.preventDefault();
      }}
    >
      <Trash2 size={18} />
      {pending ? "Suppression…" : "Retirer la propriété"}
    </button>
  );
}
