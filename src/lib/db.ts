import postgres from "postgres";

const url =
  process.env.DATABASE_OWNER_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "postgres://hiros:hiros@127.0.0.1:5432/hiros";

const isLocal = /localhost|127\.0\.0\.1/.test(url);

export const sql = postgres(url, {
  max: 8,
  ssl: isLocal ? false : "require",
});
