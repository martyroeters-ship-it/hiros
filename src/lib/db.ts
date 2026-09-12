import postgres from "postgres";

export const databaseUrl =
  process.env.DATABASE_OWNER_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

const fallbackUrl = "postgres://hiros:hiros@127.0.0.1:5432/hiros";
const url = databaseUrl || (process.env.VERCEL ? "" : fallbackUrl);
const isLocal = !url || /localhost|127\.0\.0\.1/.test(url);

export const sql = postgres(url || fallbackUrl, {
  max: 8,
  ssl: isLocal ? false : "require",
});
