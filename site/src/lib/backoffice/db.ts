import { neon, Pool } from "@neondatabase/serverless";

export type Query = <R>(text: string, params?: unknown[]) => Promise<R[]>;

function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL n'est pas défini.");
  return url;
}

export const query: Query = async <R>(text: string, params: unknown[] = []) =>
  (await neon(databaseUrl()).query(text, params)) as R[];

export async function transaction<T>(operation: (q: Query) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: databaseUrl() });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await operation(async <R>(text: string, params: unknown[] = []) => {
      return (await client.query(text, params)).rows as R[];
    });
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function consumeLimit(key: string, maximum: number, windowMs: number, now = Date.now()) {
  const [row] = await query<{ count: number }>(
    `INSERT INTO rate_limits(key, count, expires_at) VALUES ($1, 1, $2)
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN rate_limits.expires_at <= $3 THEN 1 ELSE rate_limits.count + 1 END,
       expires_at = CASE WHEN rate_limits.expires_at <= $3 THEN $2 ELSE rate_limits.expires_at END
     RETURNING count`,
    [key, now + windowMs, now],
  );
  return row.count <= maximum;
}
