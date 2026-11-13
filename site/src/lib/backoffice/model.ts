export const statuses = {
  nouveau: "Nouvelle demande",
  contacte: "Contact établi",
  rendez_vous: "Rendez-vous prévu",
  evaluation: "Évaluation envoyée",
  mandat: "Mandat signé",
  cloture: "Dossier clôturé",
} as const;

export type Status = keyof typeof statuses;
export const owners = ["", "Paulina", "Denis"] as const;
export type Owner = (typeof owners)[number];
export function externalUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.username || url.password) return null;
    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
