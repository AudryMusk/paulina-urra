import Link from "next/link";
import "./globals.css";
import { polices } from "./fonts";

export default function Introuvable() {
  return (
    <html lang="fr-CA" className={polices}>
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-serif text-4xl">Page introuvable.</h1>
        <Link href="/" className="text-lg text-blue underline">
          Retour à l’accueil
        </Link>
      </body>
    </html>
  );
}
