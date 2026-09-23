import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionUser } from "./identity";

export const SESSION_COOKIE = "urra_admin_session";
export async function currentUser() {
  return sessionUser((await cookies()).get(SESSION_COOKIE)?.value);
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/admin/connexion");
  return user;
}
