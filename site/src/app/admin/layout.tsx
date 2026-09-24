import type { Metadata } from "next";
import "../globals.css";
import "./style.css";
import { polices } from "../fonts";

export const metadata: Metadata = { title: "Espace courtiers · Urra-Rauda", robots: { index: false, follow: false } };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={polices}>
      <body>
        <div className="bo">{children}</div>
      </body>
    </html>
  );
}
