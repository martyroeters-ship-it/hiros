import postgres from "postgres";

const url =
  process.env.DATABASE_OWNER_URL ??
  process.env.DATABASE_URL ??
  "postgres://hiros:hiros@127.0.0.1:5432/hiros";

export const sql = postgres(url, { max: 8 });
