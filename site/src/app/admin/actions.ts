"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE, requireUser } from "@/lib/backoffice/auth";
import { authenticate, createSession, hashToken, revokeSession, SESSION_SECONDS } from "@/lib/backoffice/identity";
import { consumeLimit } from "@/lib/backoffice/db";
import { addNote, updateLead } from "@/lib/backoffice/store";

export type FormState = { error?: string; success?: string };
const field = (data: FormData, key: string) => String(data.get(key) || "").trim();

export async function login(_: FormState, data: FormData): Promise<FormState> {
  const email = field(data, "email").toLowerCase();
  const password = String(data.get("password") || "");
  if (!email || email.length > 254 || !password || password.length > 256)
    return { error: "Courriel ou mot de passe incorrect." };
  if (
    !(await consumeLimit("login:" + hashToken(email), 5, 15 * 60_000)) ||
    !(await consumeLimit("login:global", 100, 15 * 60_000))
  ) {
    return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  }
  const user = await authenticate(email, password);
  if (!user) return { error: "Courriel ou mot de passe incorrect." };
  const token = await createSession(user.id);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_SECONDS,
  });
  redirect("/admin");
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await revokeSession(token);
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 0,
  });
  redirect("/admin/connexion");
}
export async function saveFollowup(_: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = field(data, "id");
  try {
    await updateLead(
      id,
      Number(field(data, "version")),
      { status: field(data, "status"), owner: field(data, "owner"), next_action: field(data, "next_action") },
      user.name,
    );
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Enregistrement impossible." };
  }
  revalidatePath("/admin", "layout");
  return { success: "Suivi enregistré." };
}
export async function saveNote(_: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser();
  try {
    await addNote(field(data, "id"), user.name, field(data, "body"));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Enregistrement impossible." };
  }
  revalidatePath("/admin", "layout");
  return { success: "Note ajoutée à l’historique." };
}
