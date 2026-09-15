import postgres from "postgres";

export const databaseUrl =
  process.env.DATABASE_OWNER_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.STORAGE_POSTGRES_URL ||
  process.env.STORAGE_URL ||
  "";

const fallbackUrl = "postgres://hiros:hiros@127.0.0.1:5432/hiros";
const url = databaseUrl || (process.env.VERCEL ? "" : fallbackUrl);
const isLocal = !url || /localhost|127\.0\.0\.1/.test(url);

const globalForDb = globalThis as typeof globalThis & {
  hirosSql?: ReturnType<typeof postgres>;
};

export const sql =
  globalForDb.hirosSql ??
  postgres(url || fallbackUrl, {
    max: isLocal ? 2 : 8,
    ssl: isLocal ? false : "require",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.hirosSql = sql;
}
