import { randomBytes, randomUUID, scryptSync, createHash, timingSafeEqual } from "node:crypto";
import { query, transaction } from "./db";

export type User = { id: string; name: string; email: string };
export const SESSION_SECONDS = 8 * 60 * 60;
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash || "", "hex");
  const actual = scryptSync(password, salt || "invalid", 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function provisionUser(email: string, name: string, password: string) {
  email = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error("Courriel invalide.");
  if (!["Paulina", "Denis"].includes(name)) throw new Error("Le nom doit être Paulina ou Denis.");
  if (password.length < 14 || password.length > 256)
    throw new Error("Utilisez un mot de passe de 14 à 256 caractères.");
  return transaction(async (q) => {
    const [user] = await q<User>(
      `INSERT INTO users(id, email, name, password, created_at) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET name = excluded.name, password = excluded.password
       RETURNING id, email, name`,
      [randomUUID(), email, name, hashPassword(password), new Date().toISOString()],
    );
    await q("DELETE FROM sessions WHERE user_id = $1", [user.id]);
    return user;
  });
}

const dummyHash = hashPassword(randomBytes(32).toString("hex"));
export async function authenticate(email: string, password: string): Promise<User | null> {
  if (email.length > 254 || password.length > 256) return null;
  const [user] = await query<User & { password: string }>(
    "SELECT id, email, name, password FROM users WHERE email = $1",
    [email.trim().toLowerCase()],
  );
  const valid = verifyPassword(password, user?.password || dummyHash);
  return valid && user ? { id: user.id, email: user.email, name: user.name } : null;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await query("DELETE FROM sessions WHERE expires_at <= $1", [Date.now()]);
  await query("INSERT INTO sessions(token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
    hashToken(token),
    userId,
    Date.now() + SESSION_SECONDS * 1000,
  ]);
  return token;
}
export async function sessionUser(token: string | undefined): Promise<User | null> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const [user] = await query<User>(
    `SELECT u.id, u.name, u.email FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > $2`,
    [hashToken(token), Date.now()],
  );
  return user || null;
}
export async function revokeSession(token: string) {
  await query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
}
