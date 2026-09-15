import { readFile } from "node:fs/promises";
import path from "node:path";
import { databaseUrl, sql } from "./db";

const globalForDb = globalThis as typeof globalThis & {
  hirosDbBoot?: Promise<void> | null;
};

async function applyFile(relativePath: string) {
  const sqlText = await readFile(path.join(process.cwd(), relativePath), "utf8");
  await sql.unsafe(sqlText);
}

async function applyIfNeeded() {
  const [{ cases }] = await sql`
    select to_regclass('public.cases') as cases
  `;
  if (!cases) {
    await applyFile("db/migrations/001_init.sql");
  }

  const [{ treatments }] = await sql`
    select to_regclass('public.case_treatments') as treatments
  `;
  if (!treatments) {
    await applyFile("db/migrations/002_treatment_followup.sql");
  }

  const [{ appointments }] = await sql`
    select to_regclass('public.video_appointments') as appointments
  `;
  if (!appointments) {
    await applyFile("db/migrations/003_video_appointments.sql");
  }

  const [{ has_password }] = await sql`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'password_hash'
    ) as has_password
  `;
  if (!has_password) {
    await applyFile("db/migrations/004_auth.sql");
  }

  await applyFile("db/seed/001_demo.sql");
  await applyFile("db/seed/002_treatment_patients.sql");
  await applyFile("db/seed/003_appointments.sql");
  await applyFile("db/seed/004_messages.sql");
}

export async function ready() {
  if (process.env.VERCEL && !databaseUrl) {
    throw new Error("NO_DATABASE");
  }
  if (!globalForDb.hirosDbBoot) {
    globalForDb.hirosDbBoot = applyIfNeeded().catch((error) => {
      globalForDb.hirosDbBoot = null;
      throw error;
    });
  }
  await globalForDb.hirosDbBoot;
}
