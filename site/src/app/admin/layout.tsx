import type { Metadata } from "next";
import "./style.css";

export const metadata: Metadata = { title: "Espace courtiers · Urra-Rauda", robots: { index: false, follow: false } };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="bo">{children}</div>;
}
